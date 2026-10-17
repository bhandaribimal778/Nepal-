-- ==============================================================================
-- NEPAL NEWS (नेपाल न्यूज) DATABASE MIGRATION SCRIPT (FIXED FOR FRESH DATABASES)
-- Target: Supabase (PostgreSQL 15+)
-- Fix: Tables are created FIRST before any triggers or policies are attached,
--      preventing "ERROR: 42P01: relation does not exist" on fresh setups.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CREATE TABLES FIRST
-- ==============================================================================

-- 2.1 PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('admin', 'editor', 'reporter', 'reader')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.profiles IS 'User profiles linked to auth.users with RBAC role enforcement';
COMMENT ON COLUMN public.profiles.role IS 'Authorization role: admin, editor, reporter, or reader';

-- 2.2 CATEGORIES TABLE (नेपाल न्यूज विधा/वर्गहरू)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,               -- नेपाली नाम (उदा: राजनीति, अर्थतन्त्र)
    name_en TEXT NOT NULL,            -- English Name (Politics, Economy)
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.categories IS 'News categories/topics for articles';

-- 2.3 ARTICLES TABLE (समाचारहरू)
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of paragraph strings
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_breaking BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    image_url TEXT,
    read_time_minutes INTEGER NOT NULL DEFAULT 3 CHECK (read_time_minutes > 0),
    view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    published_at TIMESTAMPTZ,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.articles IS 'News articles with draft/published lifecycle and editorial metadata';

-- ==============================================================================
-- 3. PERFORMANCE & FILTER INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_articles_status_published_at ON public.articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category_status ON public.articles(category_id, status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_is_breaking ON public.articles(is_breaking) WHERE is_breaking = true;
CREATE INDEX IF NOT EXISTS idx_articles_is_featured ON public.articles(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_categories_is_active_order ON public.categories(is_active, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ==============================================================================
-- 4. AUTOMATIC FUNCTIONS & TRIGGERS (Safe now that tables exist)
-- ==============================================================================

-- 4.1 Updated_at automatic updater
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_set_categories_updated_at ON public.categories;
CREATE TRIGGER trigger_set_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_set_articles_updated_at ON public.articles;
CREATE TRIGGER trigger_set_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4.2 Admin check helper function (Used in RLS policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- 4.3 Prevent Public Users from Changing Their Own Role
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Block role modification if called by client API (auth.uid() is not null) and user is not admin.
    -- Allows SQL Editor / database superuser (where auth.uid() is null) to assign roles safely.
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
            RAISE EXCEPTION 'Role escalation forbidden: Only administrators can modify user roles';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trigger_prevent_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- 4.4 Auto-create profile upon auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'reader' -- Always reader by default, preventing self-assigned admin
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 5.1 PROFILES POLICIES
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are readable by everyone"
    ON public.profiles
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5.2 CATEGORIES POLICIES
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Active categories are readable by everyone" ON public.categories;
CREATE POLICY "Active categories are readable by everyone"
    ON public.categories
    FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories"
    ON public.categories
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories"
    ON public.categories
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories"
    ON public.categories
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5.3 ARTICLES POLICIES
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Published articles in active categories are viewable by public" ON public.articles;
CREATE POLICY "Published articles in active categories are viewable by public"
    ON public.articles
    FOR SELECT
    USING (
        (status = 'published' AND EXISTS (
            SELECT 1 FROM public.categories c
            WHERE c.id = articles.category_id AND c.is_active = true
        ))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can insert articles" ON public.articles;
CREATE POLICY "Admins can insert articles"
    ON public.articles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update articles" ON public.articles;
CREATE POLICY "Admins can update articles"
    ON public.articles
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete articles" ON public.articles;
CREATE POLICY "Admins can delete articles"
    ON public.articles
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 6. DATABASE GRANTS
-- ==============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Public read permissions
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;

-- Authenticated user permissions
GRANT UPDATE (full_name, avatar_url, bio) ON public.profiles TO authenticated;

-- Service role bypasses all RLS
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- ==============================================================================
-- 7. SEED DATA (Nepal News Categories & Verified Articles)
-- ==============================================================================

-- 7.1 Seed Categories
INSERT INTO public.categories (slug, name, name_en, description, is_active, display_order)
VALUES
    ('politics', 'राजनीति', 'Politics', 'नेपालको राष्ट्रिय राजनीति तथा नीतिगत समाचार', true, 1),
    ('economy', 'अर्थतन्त्र', 'Economy', 'बजेट, व्यापार, जलविद्युत र आर्थिक सूचकाङ्क', true, 2),
    ('society', 'समाज', 'Society', 'सामाजिक सरोकार, वातावरण तथा जनजीवन', true, 3),
    ('sports', 'खेलकुद', 'Sports', 'क्रिकेट, फुटबल, म्याराथन तथा राष्ट्रिय खेलकुद', true, 4),
    ('opinion', 'विचार', 'Opinion', 'विज्ञहरूको विश्लेषण, स्तम्भ तथा विचार', true, 5),
    ('world', 'विश्व', 'World', 'अन्तर्राष्ट्रिय घटनाक्रम, कूटनीति र अन्तरिक्ष', true, 6),
    ('tech', 'प्रविधि', 'Tech', 'सूचना प्रविधि, स्टार्टअप, इन्टरनेट र ५जी', true, 7),
    ('entertainment', 'मनोरञ्जन', 'Entertainment', 'चलचित्र, कला, संगीत तथा साहित्य', true, 8)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    name_en = EXCLUDED.name_en,
    is_active = EXCLUDED.is_active;

-- 7.2 Seed Published Articles
INSERT INTO public.articles (
    title,
    slug,
    summary,
    content,
    category_id,
    status,
    is_breaking,
    is_featured,
    image_url,
    read_time_minutes,
    view_count,
    published_at,
    tags
)
VALUES
(
    'काठमाडौँ उपत्यकाको सार्वजनिक यातायात सुधार: मेट्रो रेल आयोजनाको डीपीआर तयार',
    'kathmandu-metro-rail-dpr-prepared',
    'सरकारले काठमाडौँ उपत्यकाको ट्राफिक जाम न्यूनीकरण गर्न बुढानीलकण्ठदेखि सातदोबाटो सम्म पहिलो चरणको मेट्रो रेल निर्माण प्रक्रिया अघि बढाउने घोषणा गरेको छ।',
    '["काठमाडौँ उपत्यकामा दैनिक बढ्दो सवारी चाप र वातावरणीय प्रदूषणलाई मध्यनजर गर्दै सरकारले बहुप्रतीक्षित मेट्रो रेल परियोजनाको विस्तृत परियोजना प्रतिवेदन (DPR) स्वीकृतिको अन्तिम चरणमा पुगेको जनाएको छ।", "यातायात मन्त्रालयका अनुसार पहिलो चरणमा बुढानीलकण्ठ, नारायणगोपाल चोक, रत्नपार्क हुँदै सातदोबाटो जोड्ने २१ किलोमिटर लामो भूमिगत तथा इलेभेटेड लाइन निर्माण गरिनेछ। यस आयोजनामा दातृ निकायहरूको सहुलियतपूर्ण ऋण सहयोग प्राप्त हुने विश्वास व्यक्त गरिएको छ।", "मन्त्रालयका प्रवक्ताले भने, ''राजधानीको जीवनस्तर उकास्न र आम नागरिकलाई आधुनिक, समयबद्ध तथा सुरक्षित सार्वजनिक यातायात उपलब्ध गराउन यो परियोजना कोशेढुंगा साबित हुनेछ। आगामी आर्थिक वर्षदेखि नै प्रारम्भिक निर्माण कार्य थालिने लक्ष्य छ।''", "यसअघि सम्भाव्यता अध्ययन सम्पन्न भइसकेको भए पनि स्रोत व्यवस्थापनको अभावमा आयोजना लामो समयदेखि अन्योलमा परेको थियो। यसपटक बहुपक्षीय प्राविधिक टोलीले वातावरणमैत्री प्रविधि प्रयोग गर्ने गरी प्रतिवेदन तयार पारेको हो।"]'::jsonb,
    (SELECT id FROM public.categories WHERE slug = 'politics'),
    'published',
    true,
    true,
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    4,
    4850,
    timezone('utc'::text, now() - INTERVAL '15 minutes'),
    ARRAY['यातायात', 'काठमाडौँ', 'विकास निर्माण', 'पूर्वाधार']
),
(
    'नेपालबाट थप २५० मेगावाट जलविद्युत बंगलादेश निर्यात सुरु, ऐतिहासिक उपलब्धि',
    'nepal-electricity-export-to-bangladesh',
    'नेपाल, भारत र बंगलादेशबीच भएको त्रिपक्षीय विद्युत व्यापार सम्झौता अनुसार आजदेखि औपचारिक रूपमा प्रसारण सुरु गरिएको नेपाल विद्युत प्राधिकरणले जनाएको छ।',
    '["नेपालको स्वच्छ जलविद्युत ऊर्जा क्षेत्रीय बजारमा पुर्‍याउने दशकौँ लामो प्रयासले आज सार्थकता पाएको छ। नेपालबाट भारतको प्रसारण लाइन हुँदै बंगलादेशसम्म थप २५० मेगावाट विद्युत निर्यात शुभारम्भ भएको हो।", "नेपाल विद्युत प्राधिकरणका कार्यकारी निर्देशकले काठमाडौँमा आयोजित विशेष पत्रकार सम्मेलनमा यस ऐतिहासिक दिनलाई नेपालको आर्थिक विकासको सुनौलो अध्याय भन्दै प्रशंसा गर्नुभयो।", "उहाँले भन्नुभयो, ''यसले हाम्रो व्यापार घाटा न्यूनीकरण गर्न मात्र होइन, दक्षिण एसियाली क्षेत्रमै स्वच्छ ऊर्जा संक्रमणलाई गति दिन अहम् भूमिका खेल्नेछ। विदेशी मुद्रा आर्जनको यो दीगो स्रोत हो।''"]'::jsonb,
    (SELECT id FROM public.categories WHERE slug = 'economy'),
    'published',
    true,
    false,
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
    3,
    3420,
    timezone('utc'::text, now() - INTERVAL '45 minutes'),
    ARRAY['जलविद्युत', 'ऊर्जा', 'व्यापार', 'अर्थतन्त्र']
),
(
    'पोखरा अन्तर्राष्ट्रिय म्याराथन: केन्याका धावक पहिलो, नेपालका खड्कालाई रजत',
    'pokhara-international-marathon-results',
    'अन्नपूर्ण हिमशृङ्खलाको काखमा सम्पन्न १९ औँ पोखरा अन्तर्राष्ट्रिय म्याराथनमा विश्वभरका ३०० भन्दा बढी अन्तर्राष्ट्रिय खेलाडीहरूको सहभागिता रहेको थियो।',
    '["पर्यटकीय नगरी पोखरामा सम्पन्न १९ औँ अन्तर्राष्ट्रिय म्याराथनमा पुरुष खुलातर्फ केन्याका धावक किप्रोटोले निर्धारित ४२.१९५ किलोमिटर दूरी २ घण्टा १५ मिनेट १२ सेकेन्डमा पार गर्दै स्वर्ण पदक हात पारेका छन्।", "त्यस्तै, नेपालका तर्फबाट सशस्त्र प्रहरी बल (एपिएफ) का धावक किरणसिंह खड्काले कडा प्रतिस्पर्धाका बीच २ घण्टा १८ मिनेटमा दूरी पूरा गर्दै रजत पदक जित्न सफल भए।"]'::jsonb,
    (SELECT id FROM public.categories WHERE slug = 'sports'),
    'published',
    false,
    false,
    'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
    3,
    2190,
    timezone('utc'::text, now() - INTERVAL '2 hours'),
    ARRAY['खेलकुद', 'म्याराथन', 'पोखरा', 'दौड']
),
(
    'सगरमाथा क्षेत्रमा शून्य फोहोर अभियान: हिमाल आरोहणमा नयाँ कडा नियम लागू',
    'everest-zero-waste-strict-guidelines',
    'खुम्बु पासाङल्हामु गाउँपालिका र पर्यटन बोर्डले सर्वोच्च शिखर सगरमाथाको पर्यावरणीय सन्तुलन कायम राख्न प्रत्येक आरोहीका लागि नयाँ सरसफाइ निर्देशिका जारी गरेका छन्।',
    '["संसारकै ध्यान खिच्ने सगरमाथा क्षेत्रमा बढ्दो फोहोरमैला व्यवस्थापनका लागि नयाँ आरोहण सिजनदेखि लागू हुने गरी कडा आचारसंहिता सार्वजनिक गरिएको छ।", "नयाँ नियमावली अनुसार क्याम्प-४ भन्दा माथि जाने प्रत्येक आरोहीले आफ्नो व्यक्तिगत फोहोर र पुराना डोरीहरू अनिवार्य रूपमा आधार शिविरसम्म फिर्ता ल्याउनुपर्नेछ।"]'::jsonb,
    (SELECT id FROM public.categories WHERE slug = 'society'),
    'published',
    false,
    false,
    'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
    4,
    5120,
    timezone('utc'::text, now() - INTERVAL '3 hours'),
    ARRAY['सगरमाथा', 'हिमाल', 'पर्यावरण', 'पर्यटन']
),
(
    'मस्यौदा: आगामी आर्थिक वर्षको नयाँ बजेट योजना (अप्रकाशित)',
    'draft-upcoming-budget-plan',
    'आगामी आर्थिक वर्षको वार्षिक बजेट सम्बन्धी प्रारम्भिक मस्यौदा आन्तरिक छलफलमा।',
    '["यो केवल सम्पादकीय टोलीको आन्तरिक प्रयोजनका लागि तयार पारिएको मस्यौदा हो। सर्वसाधारणले यसलाई हेर्न पाउने छैनन्।"]'::jsonb,
    (SELECT id FROM public.categories WHERE slug = 'economy'),
    'draft', -- DRAFT STATUS: Verified that public cannot view this article
    false,
    false,
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    2,
    0,
    NULL,
    ARRAY['बजेट', 'मस्यौदा']
)
ON CONFLICT (slug) DO NOTHING;
