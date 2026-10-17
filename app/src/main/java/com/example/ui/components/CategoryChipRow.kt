package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.NewsCategory
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalCrimsonLight
import com.example.ui.theme.NepalNavy
import com.example.ui.theme.NewsBorderLight

@Composable
fun CategoryChipRow(
    selectedCategory: NewsCategory,
    onCategorySelected: (NewsCategory) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        NewsCategory.entries.forEach { category ->
            val isSelected = category == selectedCategory
            val shape = RoundedCornerShape(20.dp)

            Box(
                modifier = Modifier
                    .clip(shape)
                    .background(
                        if (isSelected) NepalNavy else Color.White
                    )
                    .border(
                        width = 1.dp,
                        color = if (isSelected) NepalNavy else NewsBorderLight,
                        shape = shape
                    )
                    .clickable { onCategorySelected(category) }
                    .padding(horizontal = 14.dp, vertical = 7.dp)
                    .testTag("category_chip_${category.slug}"),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    if (isSelected) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(NepalCrimson)
                        )
                    }
                    Text(
                        text = category.nepaliName,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) Color.White else NepalNavy,
                        fontSize = 13.sp
                    )
                }
            }
        }
    }
}
