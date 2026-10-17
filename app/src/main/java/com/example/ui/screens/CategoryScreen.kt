package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.Article
import com.example.model.NewsCategory
import com.example.ui.components.CategoryChipRow
import com.example.ui.components.EmptyStateView
import com.example.ui.components.NewsCard
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalNavy
import com.example.ui.theme.NewsBorderLight

@Composable
fun CategoryScreen(
    selectedCategory: NewsCategory,
    articles: List<Article>,
    bookmarkedIds: Set<String>,
    onCategorySelected: (NewsCategory) -> Unit,
    onArticleClick: (Article) -> Unit,
    onBookmarkToggle: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
    ) {
        // Top Category Bar Title
        Surface(
            color = Color.White,
            shadowElevation = 1.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "समाचार विधा तथा वर्गहरू",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = NepalNavy,
                    fontSize = 20.sp
                )
                Text(
                    text = "तपाईंको रुचि अनुसारका समाचारहरू छान्नुहोस्",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF64748B),
                    fontSize = 12.sp
                )
            }
        }

        CategoryChipRow(
            selectedCategory = selectedCategory,
            onCategorySelected = onCategorySelected
        )

        // Category Content
        val filteredArticles = if (selectedCategory == NewsCategory.ALL) {
            articles
        } else {
            articles.filter { it.category == selectedCategory }
        }

        if (filteredArticles.isEmpty()) {
            EmptyStateView(
                title = "कुनै समाचार फेला परेन",
                message = "${selectedCategory.nepaliName} विधामा हाल कुनै समाचार उपलब्ध छैन।",
                actionLabel = "सबै विधा हेर्नुहोस्",
                onActionClick = { onCategorySelected(NewsCategory.ALL) },
                modifier = Modifier.fillMaxSize()
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item {
                    Text(
                        text = "${selectedCategory.nepaliName} (${filteredArticles.size} समाचार)",
                        style = MaterialTheme.typography.labelLarge,
                        color = NepalCrimson,
                        fontWeight = FontWeight.Bold
                    )
                }

                items(filteredArticles, key = { it.id }) { article ->
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
