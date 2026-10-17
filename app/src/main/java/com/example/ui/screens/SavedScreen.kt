package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.Article
import com.example.ui.components.EmptyStateView
import com.example.ui.components.NewsCard
import com.example.ui.theme.NepalNavy

@Composable
fun SavedScreen(
    savedArticles: List<Article>,
    bookmarkedIds: Set<String>,
    onArticleClick: (Article) -> Unit,
    onBookmarkToggle: (String) -> Unit,
    onExploreClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
    ) {
        Surface(
            color = Color.White,
            shadowElevation = 1.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "सुरक्षित गरिएका समाचारहरू",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = NepalNavy,
                    fontSize = 20.sp
                )
                Text(
                    text = "तपाईंले पछि पढ्नका लागि सुरक्षित गरेका समाचारहरू यहाँ रहनेछन्",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF64748B),
                    fontSize = 12.sp
                )
            }
        }

        if (savedArticles.isEmpty()) {
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
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item {
                    Text(
                        text = "कुल ${savedArticles.size} सुरक्षित समाचार",
                        style = MaterialTheme.typography.labelMedium,
                        color = Color(0xFF64748B),
                        fontWeight = FontWeight.SemiBold
                    )
                }

                items(savedArticles, key = { it.id }) { article ->
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
