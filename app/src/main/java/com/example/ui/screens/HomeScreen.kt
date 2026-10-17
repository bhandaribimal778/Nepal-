package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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
                    // Breaking Ticker
                    if (uiState.breakingNews.isNotEmpty()) {
                        item {
                            BreakingNewsTicker(
                                breakingArticles = uiState.breakingNews,
                                onArticleClick = onArticleClick
                            )
                        }
                    }

                    // Category Selector Row
                    item {
                        CategoryChipRow(
                            selectedCategory = selectedCategory,
                            onCategorySelected = onCategorySelected
                        )
                    }

                    // Filtered or Featured section
                    if (selectedCategory == NewsCategory.ALL && uiState.featuredArticle != null) {
                        item {
                            Column(
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

                    // Latest News Header
                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = if (selectedCategory == NewsCategory.ALL) "ताजा समाचार" else selectedCategory.nepaliName,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.ExtraBold,
                                color = NepalNavy,
                                fontSize = 18.sp
                            )
                            Text(
                                text = "सबै अपडेट",
                                style = MaterialTheme.typography.labelSmall,
                                color = NepalCrimson,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                    }

                    // News List
                    val displayedArticles = if (selectedCategory == NewsCategory.ALL) {
                        uiState.latestArticles
                    } else {
                        (listOfNotNull(uiState.featuredArticle) + uiState.latestArticles)
                            .filter { it.category == selectedCategory }
                    }

                    if (displayedArticles.isEmpty()) {
                        item {
                            EmptyStateView(
                                title = "यस वर्गमा कुनै समाचार छैन",
                                message = "अन्य वर्गका ताजा समाचारहरू हेर्नुहोस्।",
                                actionLabel = "सबै समाचार देखाउनुहोस्",
                                onActionClick = { onCategorySelected(NewsCategory.ALL) }
                            )
                        }
                    } else {
                        items(displayedArticles, key = { it.id }) { article ->
                            Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
                                NewsCard(
                                    article = article,
                                    isBookmarked = bookmarkedIds.contains(article.id),
                                    onArticleClick = onArticleClick,
                                    onBookmarkToggle = onBookmarkToggle
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
