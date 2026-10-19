package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.model.Article
import com.example.model.NewsCategory
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalNavy

data class CategoryGridItem(
    val category: NewsCategory,
    val title: String,
    val icon: ImageVector,
    val bgColor: Color
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoryScreen(
    selectedCategory: NewsCategory,
    articles: List<Article>,
    bookmarkedIds: Set<String>,
    onCategorySelected: (NewsCategory) -> Unit,
    onArticleClick: (Article) -> Unit,
    onBookmarkToggle: (String) -> Unit,
    onBackClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val categoryItems = listOf(
        CategoryGridItem(NewsCategory.POLITICS, "राजनीति", Icons.Default.AccountBalance, Color(0xFFEF4444)),
        CategoryGridItem(NewsCategory.ECONOMY, "अर्थतन्त्र", Icons.Default.TrendingUp, Color(0xFF10B981)),
        CategoryGridItem(NewsCategory.SOCIETY, "समाज", Icons.Default.Groups, Color(0xFF3B82F6)),
        CategoryGridItem(NewsCategory.SPORTS, "खेलकुद", Icons.Default.SportsCricket, Color(0xFFF97316)),
        CategoryGridItem(NewsCategory.ENTERTAINMENT, "मनोरञ्जन", Icons.Default.Movie, Color(0xFF8B5CF6)),
        CategoryGridItem(NewsCategory.TECH, "प्रविधि", Icons.Default.Laptop, Color(0xFF06B6D4)),
        CategoryGridItem(NewsCategory.HEALTH, "स्वास्थ्य", Icons.Default.Favorite, Color(0xFFEC4899)),
        CategoryGridItem(NewsCategory.EDUCATION, "शिक्षा", Icons.Default.MenuBook, Color(0xFFF59E0B)),
        CategoryGridItem(NewsCategory.WORLD, "अन्तर्राष्ट्रिय", Icons.Default.Public, Color(0xFF2563EB)),
        CategoryGridItem(NewsCategory.LOCAL, "स्थानीय", Icons.Default.LocationOn, Color(0xFF0EA5E9)),
        CategoryGridItem(NewsCategory.PROVINCE, "प्रदेश", Icons.Default.Map, Color(0xFF4F46E5))
    )

    val popularArticles = androidx.compose.runtime.remember(articles) {
        val preferred = listOf("art-politics-na", "art-snow", "art-training").mapNotNull { id ->
            articles.find { it.id == id }
        }
        if (preferred.isNotEmpty()) preferred else articles.take(3)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
    ) {
        // Top App Bar with back arrow and title "श्रेणीहरू"
        Surface(
            color = Color.White,
            shadowElevation = 1.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                IconButton(
                    onClick = onBackClick,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "पछाडि फर्कनुहोस्",
                        tint = NepalNavy
                    )
                }

                Text(
                    text = "श्रेणीहरू",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Black,
                    color = NepalNavy,
                    fontSize = 20.sp
                )
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 3-Column Categories Grid (Screen 2 style)
            val chunked = categoryItems.chunked(3)
            items(chunked.size) { rowIndex ->
                val rowItems = chunked[rowIndex]
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    for (item in rowItems) {
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.5.dp),
                            border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { onCategorySelected(item.category) }
                                .testTag("cat_card_${item.category.slug}")
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 14.dp, horizontal = 4.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(46.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(item.bgColor),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = item.icon,
                                        contentDescription = item.title,
                                        tint = Color.White,
                                        modifier = Modifier.size(24.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = item.title,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.5.sp,
                                    color = NepalNavy,
                                    maxLines = 1
                                )
                            }
                        }
                    }
                    // Fill empty columns in the last row if < 3
                    if (rowItems.size < 3) {
                        for (i in 0 until (3 - rowItems.size)) {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }

            // Section "लोकप्रिय" (Popular)
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "लोकप्रिय",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Black,
                        color = NepalNavy,
                        fontSize = 18.sp
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clickable { onCategorySelected(NewsCategory.ALL) }
                    ) {
                        Text(
                            text = "सबै हेर्नुहोस्",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color(0xFF2563EB),
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                            contentDescription = null,
                            tint = Color(0xFF2563EB),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            // Popular News Items List (horizontal card items as shown in Screen 2)
            items(popularArticles.size) { index ->
                val article = popularArticles[index]
                Card(
                    shape = RoundedCornerShape(10.dp),
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
                        Box(
                            modifier = Modifier
                                .size(width = 68.dp, height = 62.dp)
                                .clip(RoundedCornerShape(8.dp))
                        ) {
                            AsyncImage(
                                model = article.imageUrl,
                                contentDescription = article.title,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        }

                        Column(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = article.title,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                lineHeight = 17.sp,
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
                                    text = article.publishedAt,
                                    fontSize = 11.sp,
                                    color = Color(0xFF64748B),
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
