package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.Article
import com.example.model.NewsCategory
import com.example.model.NewsUiState
import com.example.ui.components.*
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalNavy

@Composable
fun HomeScreen(
    uiState: NewsUiState,
    selectedCategory: NewsCategory,
    bookmarkedIds: Set<String>,
    onCategorySelected: (NewsCategory) -> Unit,
    onArticleClick: (Article) -> Unit,
    onBookmarkToggle: (String) -> Unit,
    onShareClick: (Article) -> Unit,
    onSeeAllClick: () -> Unit = {},
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
    ) {
        when (uiState) {
            is NewsUiState.Loading -> {
                LoadingSkeletonView()
            }
            is NewsUiState.Error -> {
                ErrorStateView(
                    errorMessage = uiState.message,
                    onRetry = onRetry,
                    modifier = Modifier.fillMaxSize()
                )
            }
            is NewsUiState.Success -> {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(bottom = 24.dp)
                ) {
                    // 1. Live Calendar & Clock Card
                    item {
                        LiveCalendarClockCard()
                    }

                    // 2. Breaking News Ticker (रेड पिल "ब्रेकिङ न्यूज")
                    if (uiState.breakingNews.isNotEmpty()) {
                        item {
                            BreakingNewsTicker(
                                breakingArticles = uiState.breakingNews,
                                onArticleClick = onArticleClick
                            )
                        }
                    }

                    // 3. Hero Featured Story ("ब्रेकिङ समाचार")
                    if (uiState.featuredArticle != null) {
                        item {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 16.dp, vertical = 6.dp)
                            ) {
                                FeaturedStoryCard(
                                    article = uiState.featuredArticle,
                                    isBookmarked = bookmarkedIds.contains(uiState.featuredArticle.id),
                                    onArticleClick = onArticleClick,
                                    onBookmarkToggle = onBookmarkToggle,
                                    onShareClick = onShareClick
                                )
                            }
                        }
                    }

                    // 4. Latest News Header ("ताजा समाचार" + "सबै हेर्नुहोस् >")
                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(start = 16.dp, end = 16.dp, top = 14.dp, bottom = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "ताजा समाचार",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Black,
                                color = NepalNavy,
                                fontSize = 18.sp
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.clickable { onSeeAllClick() }
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
                                    contentDescription = "सबै हेर्नुहोस्",
                                    tint = Color(0xFF2563EB),
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }

                    // 5. Two-Column News Grid (Screen 1 style)
                    val articlesList = uiState.latestArticles
                    val chunked = articlesList.chunked(2)

                    items(chunked.size) { rowIndex ->
                        val pair = chunked[rowIndex]
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(modifier = Modifier.weight(1f)) {
                                NewsGridCard(
                                    article = pair[0],
                                    onArticleClick = onArticleClick
                                )
                            }
                            if (pair.size > 1) {
                                Box(modifier = Modifier.weight(1f)) {
                                    NewsGridCard(
                                        article = pair[1],
                                        onArticleClick = onArticleClick
                                    )
                                }
                            } else {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            }
        }
    }
}
