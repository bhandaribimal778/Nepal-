package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.model.Article
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalNavy

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
    var currentFontSize by remember { mutableIntStateOf(fontSizeSp) }
    val relatedArticles = allArticles.filter { it.id != article.id }.take(2)

    Scaffold(
        topBar = {
            Surface(
                color = Color.White,
                shadowElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "पछाडि",
                            tint = NepalNavy
                        )
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        // Font size AA button
                        IconButton(
                            onClick = {
                                currentFontSize = if (currentFontSize >= 20) 14 else currentFontSize + 2
                                onAdjustFontSize(currentFontSize)
                            }
                        ) {
                            Text(
                                text = "AA",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = NepalNavy
                            )
                        }

                        // Share button
                        IconButton(onClick = { onShareClick(article) }) {
                            Icon(
                                imageVector = Icons.Default.Share,
                                contentDescription = "साझेदारी",
                                tint = NepalNavy,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        // Bookmark button
                        IconButton(onClick = { onBookmarkToggle(article.id) }) {
                            Icon(
                                imageVector = if (isBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                                contentDescription = "बचत",
                                tint = if (isBookmarked) NepalCrimson else NepalNavy,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color.White)
        ) {
            // 1. Full-width Hero Cover Image with Nepal flag/landscape
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(230.dp)
                ) {
                    AsyncImage(
                        model = article.imageUrl,
                        contentDescription = article.title,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }

            // 2. Article Header, Category Badge & Headline
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp)
                ) {
                    // Category Badge (e.g. "राष्ट्रिय" / "राजनीति")
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(NepalCrimson)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        val badgeText = if (article.id == "art-snow") "राष्ट्रिय" else article.category.nepaliName
                        Text(
                            text = badgeText,
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Main Headline
                    Text(
                        text = article.title,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Black,
                        fontSize = 22.sp,
                        lineHeight = 28.sp,
                        color = NepalNavy
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Author line with red circular avatar
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(NepalCrimson),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "ने",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Text(
                            text = article.author,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.5.sp,
                            color = NepalNavy
                        )

                        Text(
                            text = "•",
                            color = Color(0xFF94A3B8)
                        )

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AccessTime,
                                contentDescription = null,
                                tint = Color(0xFF94A3B8),
                                modifier = Modifier.size(13.dp)
                            )
                            Text(
                                text = article.publishedAt,
                                fontSize = 12.sp,
                                color = Color(0xFF64748B)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // Published Timestamp line (Screen 3 style)
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Schedule,
                            contentDescription = null,
                            tint = Color(0xFF94A3B8),
                            modifier = Modifier.size(13.dp)
                        )
                        Text(
                            text = "प्रकाशित: १९ असोज २०८३, 08:15",
                            fontSize = 11.sp,
                            color = Color(0xFF64748B)
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    HorizontalDivider(color = Color(0xFFF1F5F9), thickness = 1.dp)
                }
            }

            // 3. Story Paragraphs
            items(article.content.size) { pIndex ->
                Text(
                    text = article.content[pIndex],
                    fontSize = currentFontSize.sp,
                    lineHeight = (currentFontSize + 8).sp,
                    color = Color(0xFF1E293B),
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
                )
            }

            // 4. "सम्बन्धित भिडियो" (Related Video Card) - Screen 3 style
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9)),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp)
                        .clickable { onToggleAudio() }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF0F172A)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = "भिडियो बजाउनुहोस्",
                                tint = Color.White,
                                modifier = Modifier.size(28.dp)
                            )
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "सम्बन्धित भिडियो",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = NepalCrimson
                            )
                            Text(
                                text = "हिमाली क्षेत्रमा हिमपात",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = NepalNavy
                            )
                            Text(
                                text = "2:45",
                                fontSize = 11.sp,
                                color = Color(0xFF64748B)
                            )
                        }
                    }
                }
            }

            // 5. "सम्बन्धित समाचार" (Related News) Section
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp)
                ) {
                    Text(
                        text = "सम्बन्धित समाचार",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = NepalNavy,
                        fontSize = 16.sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    if (relatedArticles.isNotEmpty()) {
                        val rel = relatedArticles.first()
                        Card(
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)),
                            border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onRelatedArticleClick(rel) }
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(10.dp),
                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(60.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                ) {
                                    AsyncImage(
                                        model = rel.imageUrl,
                                        contentDescription = rel.title,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                }
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "मौसम विभागको चेतावनी: पश्चिमी वायु सक्रिय",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        maxLines = 2,
                                        overflow = TextOverflow.Ellipsis,
                                        color = NepalNavy
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "३ घण्टा अघि",
                                        fontSize = 11.sp,
                                        color = Color(0xFF64748B)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(30.dp))
            }
        }
    }
}
