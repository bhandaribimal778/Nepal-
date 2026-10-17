package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.TrendingUp
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
import com.example.ui.components.EmptyStateView
import com.example.ui.components.NewsCard
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalCrimsonLight
import com.example.ui.theme.NepalNavy
import com.example.ui.theme.NewsBorderLight

@Composable
fun SearchScreen(
    searchQuery: String,
    searchResults: List<Article>,
    bookmarkedIds: Set<String>,
    onQueryChange: (String) -> Unit,
    onArticleClick: (Article) -> Unit,
    onBookmarkToggle: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val trendingKeywords = listOf("मेट्रो रेल", "जलविद्युत", "म्याराथन", "सगरमाथा", "५जी", "स्टार्टअप", "नासा")

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
    ) {
        // Search Input Bar
        Surface(
            color = Color.White,
            shadowElevation = 2.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = onQueryChange,
                    placeholder = {
                        Text(
                            text = "समाचार, शीर्षक वा लेखक खोज्नुहोस्...",
                            color = Color(0xFF94A3B8),
                            fontSize = 14.sp
                        )
                    },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "खोज्नुहोस्",
                            tint = NepalCrimson
                        )
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { onQueryChange("") }) {
                                Icon(
                                    imageVector = Icons.Default.Clear,
                                    contentDescription = "खाली गर्नुहोस्",
                                    tint = Color(0xFF64748B)
                                )
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = NepalCrimson,
                        unfocusedBorderColor = NewsBorderLight,
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("search_text_input")
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Trending Keywords
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.TrendingUp,
                        contentDescription = null,
                        tint = NepalCrimson,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = "लोकप्रिय खोजीहरू:",
                        style = MaterialTheme.typography.labelSmall,
                        color = NepalNavy,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(trendingKeywords) { keyword ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(NepalCrimsonLight)
                                .clickable { onQueryChange(keyword) }
                                .padding(horizontal = 10.dp, vertical = 5.dp)
                        ) {
                            Text(
                                text = "# $keyword",
                                color = NepalCrimson,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }
        }

        // Search Results List
        if (searchQuery.isBlank()) {
            EmptyStateView(
                title = "समाचार खोज्नुहोस्",
                message = "कुनै पनि समाचार, लेखक वा विषयवस्तु टाइप गर्नुहोस् वा माथिका लोकप्रिय ट्याग छान्नुहोस्।",
                modifier = Modifier.fillMaxSize()
            )
        } else if (searchResults.isEmpty()) {
            EmptyStateView(
                title = "कुनै नतिजा फेला परेन",
                message = "'$searchQuery' सम्बन्धी कुनै पनि समाचार भेटिएन। कृपया अन्य शब्दहरू प्रयोग गर्नुहोस्।",
                actionLabel = "खोजी खाली गर्नुहोस्",
                onActionClick = { onQueryChange("") },
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
                        text = "'$searchQuery' का लागि ${searchResults.size} परिणामहरू फेला परे",
                        style = MaterialTheme.typography.labelMedium,
                        color = Color(0xFF64748B),
                        fontWeight = FontWeight.SemiBold
                    )
                }

                items(searchResults, key = { it.id }) { article ->
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
