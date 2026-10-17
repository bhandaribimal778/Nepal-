package com.example.data

import android.util.Log
import com.example.model.Article
import com.example.model.NewsCategory
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import java.util.concurrent.TimeUnit

/**
 * Supabase Repository for Nepal News
 * Directly communicates with Supabase PostgREST endpoint:
 * /rest/v1/articles?select=*,categories(id,slug,name)&status=eq.published&order=published_at.desc
 */
object SupabaseNewsRepository {

    private const val TAG = "SupabaseNewsRepo"

    // Configured Supabase credentials for Nepal News
    var supabaseUrl: String = "https://yaawyaimhhfqpnexuxgb.supabase.co"
    var supabaseAnonKey: String = "sb_publishable_GL8kxO4n5o9CPx7Y198PXA_D3TWGMsY"

    private val client = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(12, TimeUnit.SECONDS)
        .build()

    val isConfigured: Boolean
        get() = supabaseUrl.isNotBlank() && supabaseAnonKey.isNotBlank()

    suspend fun getPublishedArticles(): List<Article> = withContext(Dispatchers.IO) {
        if (!isConfigured) {
            return@withContext DevelopmentFixtures.ARTICLES
        }

        try {
            val cleanUrl = supabaseUrl.trimEnd('/')
            val endpoint = "$cleanUrl/rest/v1/articles?select=*,categories(id,slug,name)&status=eq.published&order=published_at.desc"

            val request = Request.Builder()
                .url(endpoint)
                .addHeader("apikey", supabaseAnonKey)
                .addHeader("Authorization", "Bearer $supabaseAnonKey")
                .addHeader("Accept", "application/json")
                .get()
                .build()

            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    Log.w(TAG, "Supabase request failed with code: ${response.code}")
                    return@withContext DevelopmentFixtures.ARTICLES
                }

                val bodyString = response.body?.string() ?: return@withContext DevelopmentFixtures.ARTICLES
                val jsonArray = JSONArray(bodyString)
                val articles = mutableListOf<Article>()

                for (i in 0 until jsonArray.length()) {
                    val obj = jsonArray.getJSONObject(i)
                    val id = obj.optString("id")
                    val title = obj.optString("title")
                    val summary = obj.optString("summary")

                    val contentList = mutableListOf<String>()
                    val contentJson = obj.optJSONArray("content")
                    if (contentJson != null) {
                        for (j in 0 until contentJson.length()) {
                            contentList.add(contentJson.getString(j))
                        }
                    } else {
                        contentList.add(obj.optString("content", summary))
                    }

                    val catObj = obj.optJSONObject("categories")
                    val categorySlug = catObj?.optString("slug") ?: "politics"
                    val category = NewsCategory.fromSlug(categorySlug)

                    val isBreaking = obj.optBoolean("is_breaking", false)
                    val isFeatured = obj.optBoolean("is_featured", false)
                    val imageUrl = obj.optString(
                        "image_url",
                        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80"
                    )
                    val readTime = obj.optInt("read_time_minutes", 3)
                    val viewCount = obj.optInt("view_count", 100)

                    // Extract and format published time if present
                    val publishedAtRaw = obj.optString("published_at")
                    val publishedAtFormatted = if (publishedAtRaw.isNotBlank()) "ताजा अपडेट" else "१० मिनेट अगाडि"

                    articles.add(
                        Article(
                            id = id,
                            title = title,
                            summary = summary,
                            content = contentList,
                            category = category,
                            author = "नेपाल न्यूज डेस्क",
                            authorRole = "सम्पादकीय टोली",
                            publishedAt = publishedAtFormatted,
                            readTimeMinutes = readTime,
                            imageUrl = imageUrl,
                            isBreaking = isBreaking,
                            isFeatured = isFeatured,
                            viewCount = viewCount,
                            tags = listOf(category.nepaliName, "नेपाल", "समाचार")
                        )
                    )
                }

                if (articles.isNotEmpty()) articles else DevelopmentFixtures.ARTICLES
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching articles from Supabase: ${e.message}", e)
            DevelopmentFixtures.ARTICLES
        }
    }
}
