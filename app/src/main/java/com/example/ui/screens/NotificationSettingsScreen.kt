package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.outlined.NotificationsNone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalNavy

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationSettingsScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var masterNotification by remember { mutableStateOf(true) }
    var breakingNews by remember { mutableStateOf(true) }
    var favoriteCategories by remember { mutableStateOf(true) }
    var recommendedNews by remember { mutableStateOf(false) }
    var dailySummary by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
    ) {
        // Top App Bar: "← सूचना सेटिङ" (Screen 7 style)
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
                    text = "सूचना सेटिङ",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Black,
                    color = NepalNavy,
                    fontSize = 20.sp
                )
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Master Toggle Card (Screen 7 style)
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.5.dp),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFFEE2E2)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Notifications,
                                contentDescription = null,
                                tint = NepalCrimson,
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            Text(
                                text = "सूचना",
                                fontWeight = FontWeight.Black,
                                fontSize = 16.sp,
                                color = NepalNavy
                            )
                            Text(
                                text = "महत्वपूर्ण समाचार र अपडेटहरू तपाईंको मोवाइलमा पठाइनेछ।",
                                fontSize = 12.sp,
                                color = Color(0xFF64748B),
                                lineHeight = 16.sp
                            )
                        }
                    }

                    Switch(
                        checked = masterNotification,
                        onCheckedChange = { masterNotification = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = NepalCrimson
                        )
                    )
                }
            }

            // Section "कस्ता सूचनाहरू पाउने?"
            Text(
                text = "कस्ता सूचनाहरू पाउने?",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Black,
                color = NepalNavy,
                fontSize = 16.sp,
                modifier = Modifier.padding(top = 4.dp)
            )

            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    NotificationToggleItem(
                        title = "ब्रेकिङ न्यूज",
                        checked = breakingNews && masterNotification,
                        enabled = masterNotification,
                        onCheckedChange = { breakingNews = it }
                    )
                    HorizontalDivider(color = Color(0xFFF1F5F9))

                    NotificationToggleItem(
                        title = "मनपर्ने श्रेणीका समाचार",
                        checked = favoriteCategories && masterNotification,
                        enabled = masterNotification,
                        onCheckedChange = { favoriteCategories = it }
                    )
                    HorizontalDivider(color = Color(0xFFF1F5F9))

                    NotificationToggleItem(
                        title = "सिफारिस गरिएका समाचार",
                        checked = recommendedNews && masterNotification,
                        enabled = masterNotification,
                        onCheckedChange = { recommendedNews = it }
                    )
                    HorizontalDivider(color = Color(0xFFF1F5F9))

                    NotificationToggleItem(
                        title = "दैनिक सारांश",
                        checked = dailySummary && masterNotification,
                        enabled = masterNotification,
                        onCheckedChange = { dailySummary = it }
                    )
                }
            }

            // Bottom Informational Card
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9)),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Outlined.NotificationsNone,
                        contentDescription = null,
                        tint = Color(0xFF64748B),
                        modifier = Modifier.size(20.dp)
                    )
                    Text(
                        text = "तपाईंले कहिले पनि सूचना सेटिङ बदल्न सक्नुहुन्छ।",
                        fontSize = 12.5.sp,
                        color = Color(0xFF475569),
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

@Composable
private fun NotificationToggleItem(
    title: String,
    checked: Boolean,
    enabled: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = title,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = if (enabled) NepalNavy else Color(0xFF94A3B8)
        )

        Switch(
            checked = checked,
            enabled = enabled,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Color.White,
                checkedTrackColor = NepalCrimson
            )
        )
    }
}
