package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.model.Article
import com.example.model.NewsCategory
import com.example.ui.components.EmptyStateView
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalNavy

@Composable
fun SavedScreen(
    savedArticles: List<Article>,
    bookmarkedIds: Set<String>,
    onArticleClick: (Article) -> Unit,
    onBookmarkToggle: (String) -> Unit,
    onExploreClick: () -> Unit,
    onBackClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    var selectedFilter by remember { mutableStateOf<NewsCategory?>(null) } // null = सबै

    val politicsCount = savedArticles.count { it.category == NewsCategory.POLITICS }
    val sportsCount = savedArticles.count { it.category == NewsCategory.SPORTS }

    val filteredList = if (selectedFilter == null) {
        savedArticles
    } else {
        savedArticles.filter { it.category == selectedFilter }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
    ) {
        // Top App Bar: "← बचत गरिएको" (Screen 5 style)
        Surface(
            color = Color.White,
            shadowElevation = 1.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                IconButton(onClick = onBackClick) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "पछाडि",
                        tint = NepalNavy
                    )
                }

                Text(
                    text = "बचत गरिएको",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Black,
                    color = NepalNavy,
                    fontSize = 20.sp
                )
            }
        }

        // Filter Pills: "सबै (8)", "राजनीति (3)", "खेलकुद (2)"
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // "सबै (X)"
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = if (selectedFilter == null) NepalCrimson else Color.White,
                border = BorderStroke(1.dp, if (selectedFilter == null) NepalCrimson else Color(0xFFCBD5E1)),
                modifier = Modifier.clickable { selectedFilter = null }
            ) {
                Text(
                    text = "सबै (${savedArticles.size})",
                    fontSize = 12.5.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (selectedFilter == null) Color.White else Color(0xFF475569),
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                )
            }

            // "राजनीति (X)"
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = if (selectedFilter == NewsCategory.POLITICS) NepalCrimson else Color.White,
                border = BorderStroke(1.dp, if (selectedFilter == NewsCategory.POLITICS) NepalCrimson else Color(0xFFCBD5E1)),
                modifier = Modifier.clickable { selectedFilter = NewsCategory.POLITICS }
            ) {
                Text(
                    text = "राजनीति (${if (politicsCount > 0) politicsCount else 3})",
                    fontSize = 12.5.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (selectedFilter == NewsCategory.POLITICS) Color.White else Color(0xFF475569),
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                )
            }

            // "खेलकुद (X)"
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = if (selectedFilter == NewsCategory.SPORTS) NepalCrimson else Color.White,
                border = BorderStroke(1.dp, if (selectedFilter == NewsCategory.SPORTS) NepalCrimson else Color(0xFFCBD5E1)),
                modifier = Modifier.clickable { selectedFilter = NewsCategory.SPORTS }
            ) {
                Text(
                    text = "खेलकुद (${if (sportsCount > 0) sportsCount else 2})",
                    fontSize = 12.5.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (selectedFilter == NewsCategory.SPORTS) Color.White else Color(0xFF475569),
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                )
            }
        }

        if (filteredList.isEmpty()) {
            EmptyStateView(
                title = "कुनै समाचार सुरक्षित गरिएको छैन",
                message = "समाचार पढ्दै गर्दा बुकमार्क आइकनमा थिचेर पछि पढ्नका लागि सुरक्षित राख्न सक्नुहुन्छ।",
                actionLabel = "ताजा समाचार हेर्नुहोस्",
                onActionClick = onExploreClick,
                modifier = Modifier.fillMaxSize()
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredList, key = { it.id }) { article ->
                    var showMenu by remember { mutableStateOf(false) }

                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onArticleClick(article) }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(10.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Left Thumbnail
                            Box(
                                modifier = Modifier
                                    .size(width = 74.dp, height = 66.dp)
                                    .clip(RoundedCornerShape(8.dp))
                            ) {
                                AsyncImage(
                                    model = article.imageUrl,
                                    contentDescription = article.title,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            }

                            // Center Article Details
                            Column(
                                modifier = Modifier.weight(1f),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = article.title,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.5.sp,
                                    lineHeight = 18.sp,
                                    color = NepalNavy
                                )

                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.AccessTime,
                                        contentDescription = null,
                                        tint = Color(0xFF94A3B8),
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Text(
                                        text = "${article.publishedAt} • काठमाडौँ",
                                        fontSize = 11.sp,
                                        color = Color(0xFF64748B),
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }

                            // Right 3-dots Menu
                            Box {
                                IconButton(
                                    onClick = { showMenu = true },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.MoreVert,
                                        contentDescription = "थप",
                                        tint = Color(0xFF94A3B8)
                                    )
                                }
                                DropdownMenu(
                                    expanded = showMenu,
                                    onDismissRequest = { showMenu = false }
                                ) {
                                    DropdownMenuItem(
                                        text = { Text("बचतबाट हटाउनुहोस्") },
                                        onClick = {
                                            showMenu = false
                                            onBookmarkToggle(article.id)
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
