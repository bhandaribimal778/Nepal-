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
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.Article
import com.example.ui.components.NewsCard
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalNavy

@Composable
fun SearchScreen(
    searchQuery: String,
    searchResults: List<Article>,
    bookmarkedIds: Set<String>,
    onQueryChange: (String) -> Unit,
    onArticleClick: (Article) -> Unit,
    onBookmarkToggle: (String) -> Unit,
    onBackClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val popularTags = listOf("बजेट", "हिमपात", "नेपाल", "खेलकुद", "शिक्षा", "स्वास्थ्य")
    var recentSearches by remember {
        mutableStateOf(mutableListOf("बजेट", "हिमपात", "नेपाल", "क्रिकेट", "शिक्षा"))
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .imePadding()
            .background(Color.White)
    ) {
        // Top Search Input Bar (Screen 4 style)
        Surface(
            color = Color.White,
            shadowElevation = 1.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                IconButton(onClick = onBackClick) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "पछाडि",
                        tint = NepalNavy
                    )
                }

                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = onQueryChange,
                    placeholder = {
                        Text(
                            text = "समाचार खोज्नुहोस्...",
                            color = Color(0xFF94A3B8),
                            fontSize = 14.sp
                        )
                    },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "खोज्नुहोस्",
                            tint = Color(0xFF94A3B8),
                            modifier = Modifier.size(18.dp)
                        )
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { onQueryChange("") }) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "खाली गर्नुहोस्",
                                    tint = Color(0xFF64748B),
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(24.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFFE2E8F0),
                        unfocusedBorderColor = Color(0xFFE2E8F0),
                        focusedContainerColor = Color(0xFFF8FAFC),
                        unfocusedContainerColor = Color(0xFFF8FAFC)
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("search_text_input")
                )
            }
        }

        if (searchQuery.isEmpty()) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // 1. "लोकप्रिय खोजी" (Popular searches)
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(
                            text = "लोकप्रिय खोजी",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Black,
                            color = NepalNavy,
                            fontSize = 16.sp
                        )

                        // Pill Chips Row
                        val chunked = popularTags.chunked(3)
                        for (row in chunked) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                for (tag in row) {
                                    Surface(
                                        shape = RoundedCornerShape(20.dp),
                                        color = Color(0xFFF1F5F9),
                                        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                                        modifier = Modifier
                                            .clickable { onQueryChange(tag) }
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Search,
                                                contentDescription = null,
                                                tint = Color(0xFF64748B),
                                                modifier = Modifier.size(13.dp)
                                            )
                                            Text(
                                                text = tag,
                                                fontSize = 12.5.sp,
                                                color = Color(0xFF334155),
                                                fontWeight = FontWeight.Medium
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // 2. "हालै खोजिएका" (Recent searches)
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(
                            text = "हालै खोजिएका",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Black,
                            color = NepalNavy,
                            fontSize = 16.sp
                        )

                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(2.dp)
                        ) {
                            recentSearches.forEach { keyword ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { onQueryChange(keyword) }
                                        .padding(vertical = 10.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Search,
                                            contentDescription = null,
                                            tint = Color(0xFF94A3B8),
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Text(
                                            text = keyword,
                                            fontSize = 14.sp,
                                            color = Color(0xFF334155),
                                            fontWeight = FontWeight.Medium
                                        )
                                    }

                                    IconButton(
                                        onClick = {
                                            recentSearches = recentSearches.toMutableList().also { it.remove(keyword) }
                                        },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Close,
                                            contentDescription = "हटाउनुहोस्",
                                            tint = Color(0xFF94A3B8),
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                                HorizontalDivider(color = Color(0xFFF1F5F9), thickness = 0.8.dp)
                            }
                        }
                    }
                }
            }
        } else {
            // Search Results
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item {
                    Text(
                        text = "खोजी परिणाम: \"$searchQuery\" (${searchResults.size})",
                        style = MaterialTheme.typography.labelLarge,
                        color = NepalCrimson,
                        fontWeight = FontWeight.Bold
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
