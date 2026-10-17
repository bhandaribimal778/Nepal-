package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.DevelopmentFixtures
import com.example.model.Article
import com.example.ui.components.NewsCard
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalCrimsonLight
import com.example.ui.theme.NepalGold
import com.example.ui.theme.NepalNavy
import com.example.ui.theme.NewsBorderLight

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ArticleDetailScreen(
    article: Article,
    isBookmarked: Boolean,
    isAudioPlaying: Boolean,
    audioProgress: Float,
    fontSizeSp: Int,
    allArticles: List<Article>,
    bookmarkedIds: Set<String>,
    onBackClick: () -> Unit,
    onBookmarkToggle: (String) -> Unit,
    onShareClick: (Article) -> Unit,
    onToggleAudio: () -> Unit,
    onAdjustFontSize: (Int) -> Unit,
    onRelatedArticleClick: (Article) -> Unit,
    modifier: Modifier = Modifier
) {
    val relatedArticles = allArticles.filter { it.id != article.id && it.category == article.category }.take(2)
        .ifEmpty { allArticles.filter { it.id != article.id }.take(2) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = article.category.nepaliName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = NepalNavy
                    )
                },
                navigationIcon = {
                    IconButton(
                        onClick = onBackClick,
                        modifier = Modifier.testTag("article_detail_back_button")
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "पछाडि फर्कनुहोस्",
                            tint = NepalNavy
                        )
                    }
                },
                actions = {
                    IconButton(
                        onClick = { onBookmarkToggle(article.id) },
                        modifier = Modifier.testTag("article_detail_bookmark_button")
                    ) {
                        Icon(
                            imageVector = if (isBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                            contentDescription = "बचत गर्नुहोस्",
                            tint = if (isBookmarked) NepalGold else NepalNavy
                        )
                    }
                    IconButton(
                        onClick = { onShareClick(article) },
                        modifier = Modifier.testTag("article_detail_share_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "साझेदारी गर्नुहोस्",
                            tint = NepalNavy
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )
        },
        modifier = modifier.fillMaxSize()
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color.White),
            contentPadding = PaddingValues(bottom = 32.dp)
        ) {
            // Category & Published Time
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(NepalCrimson)
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = article.category.nepaliName,
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }

                    Text(
                        text = "प्रकाशित: ${article.publishedAt} | ${article.readTimeMinutes} मिनेट पढाइ",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color(0xFF64748B)
                    )
                }
            }

            // Headline
            item {
                Text(
                    text = article.title,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = NepalNavy,
                    lineHeight = 32.sp,
                    fontSize = 22.sp,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )
            }

            // Author Info Row
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(NepalNavy),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = article.author.take(1),
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = article.author,
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = NepalNavy,
                            fontSize = 14.sp
                        )
                        Text(
                            text = article.authorRole,
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF64748B),
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Audio Player Bar and Text Size Bar
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Audio listen simulator
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                IconButton(
                                    onClick = onToggleAudio,
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(NepalCrimson)
                                        .testTag("audio_toggle_button")
                                ) {
                                    Icon(
                                        imageVector = if (isAudioPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                        contentDescription = "समाचार सुन्नुहोस्",
                                        tint = Color.White,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }

                                Column {
                                    Text(
                                        text = if (isAudioPlaying) "वाचन भइरहेको छ..." else "समाचार सुन्नुहोस्",
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = NepalNavy,
                                        fontSize = 12.sp
                                    )
                                    Text(
                                        text = "स्वचालित नेपाली अडियो प्लेयर",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = Color(0xFF64748B),
                                        fontSize = 10.sp
                                    )
                                }
                            }

                            // Font size adjuster
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Color.White)
                                        .clickable { onAdjustFontSize(-2) }
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = "A-",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        color = NepalNavy
                                    )
                                }

                                Text(
                                    text = "${fontSizeSp}px",
                                    fontSize = 11.sp,
                                    color = Color(0xFF64748B),
                                    fontWeight = FontWeight.Medium
                                )

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Color.White)
                                        .clickable { onAdjustFontSize(2) }
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = "A+",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        color = NepalNavy
                                    )
                                }
                            }
                        }

                        if (isAudioPlaying || audioProgress > 0f) {
                            Spacer(modifier = Modifier.height(8.dp))
                            LinearProgressIndicator(
                                progress = { audioProgress },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(4.dp)
                                    .clip(RoundedCornerShape(2.dp)),
                                color = NepalCrimson,
                                trackColor = Color(0xFFCBD5E1)
                            )
                        }
                    }
                }
            }

            // Hero Image
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(230.dp)
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                        .clip(RoundedCornerShape(12.dp))
                ) {
                    AsyncImage(
                        model = article.imageUrl,
                        contentDescription = article.title,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }

            // Summary Lead Box
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(NepalCrimsonLight)
                        .padding(14.dp)
                ) {
                    Text(
                        text = "सारसंक्षेप: ${article.summary}",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF7F1D1D),
                        fontSize = (fontSizeSp - 1).sp,
                        lineHeight = (fontSizeSp + 6).sp
                    )
                }
            }

            // Paragraphs
            items(article.content) { paragraph ->
                Text(
                    text = paragraph,
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color(0xFF1E293B),
                    fontSize = fontSizeSp.sp,
                    lineHeight = (fontSizeSp + 9).sp,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }

            // Tags
            if (article.tags.isNotEmpty()) {
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        article.tags.forEach { tag ->
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(Color(0xFFE2E8F0))
                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = "# $tag",
                                    fontSize = 11.sp,
                                    color = NepalNavy,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }

            // Fixture Comments Section Notice
            item {
                Card(
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)),
                    border = CardDefaults.outlinedCardBorder(),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ChatBubbleOutline,
                                contentDescription = null,
                                tint = NepalCrimson,
                                modifier = Modifier.size(18.dp)
                            )
                            Text(
                                text = "टिप्पणीहरू (डेभलपमेन्ट फिक्सचर)",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = NepalNavy
                            )
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "सूचना: Supabase ब्याकइन्ड जोडिएपछि प्रत्यक्ष रूपमा कमेन्टहरू पोस्ट गर्न सकिनेछ।",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color(0xFF64748B),
                            fontSize = 11.sp
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        DevelopmentFixtures.COMMENTS.forEach { comment ->
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = comment.author,
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = NepalNavy
                                    )
                                    Text(
                                        text = comment.timeAgo,
                                        style = MaterialTheme.typography.labelSmall,
                                        color = Color(0xFF94A3B8)
                                    )
                                }
                                Text(
                                    text = comment.content,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Color(0xFF334155),
                                    fontSize = 12.sp
                                )
                                Divider(
                                    color = Color(0xFFE2E8F0),
                                    thickness = 0.5.dp,
                                    modifier = Modifier.padding(top = 6.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Related Stories
            if (relatedArticles.isNotEmpty()) {
                item {
                    Text(
                        text = "सम्बन्धित समाचारहरू",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = NepalNavy,
                        fontSize = 18.sp,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                    )
                }

                items(relatedArticles) { relArticle ->
                    Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) {
                        NewsCard(
                            article = relArticle,
                            isBookmarked = bookmarkedIds.contains(relArticle.id),
                            onArticleClick = onRelatedArticleClick,
                            onBookmarkToggle = onBookmarkToggle
                        )
                    }
                }
            }
        }
    }
}
