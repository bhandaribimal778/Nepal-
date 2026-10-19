package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForwardIos
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.AuthState
import com.example.model.UserProfile
import com.example.model.UserSession
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalNavy

@Composable
fun ProfileScreen(
    userSession: UserSession?,
    userProfile: UserProfile?,
    authState: AuthState,
    savedCount: Int,
    onLoginClick: (String, String) -> Unit,
    onRegisterClick: (String, String, String) -> Unit,
    onLogoutClick: () -> Unit,
    onNavigateToSaved: () -> Unit,
    onNavigateToNotifications: () -> Unit = {},
    onNavigateToLoginRegister: () -> Unit = {},
    onClearError: () -> Unit
) {
    var isDarkMode by remember { mutableStateOf(false) }
    var showDeleteDialog by remember { mutableStateOf(false) }

    val displayName = userProfile?.fullName?.ifBlank { "Bimal Shrestha" } ?: "Bimal Shrestha"
    val displayEmail = userProfile?.email?.ifBlank { "bimal@gmail.com" } ?: "bimal@gmail.com"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
    ) {
        // Top App Bar: "प्रोफाइल" on left, ⚙️ on right (Screen 6 style)
        Surface(
            color = Color.White,
            shadowElevation = 1.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "प्रोफाइल",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Black,
                    color = NepalNavy,
                    fontSize = 20.sp
                )

                IconButton(
                    onClick = onNavigateToNotifications,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = "सेटिङ",
                        tint = NepalNavy
                    )
                }
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Profile Header Card (Screen 6 style)
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
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Avatar with online status badge
                    Box {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFE2E8F0)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "👨‍💼",
                                fontSize = 30.sp
                            )
                        }
                    }

                    Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                        Text(
                            text = displayName,
                            fontWeight = FontWeight.Black,
                            fontSize = 17.sp,
                            color = NepalNavy
                        )
                        Text(
                            text = displayEmail,
                            fontSize = 12.sp,
                            color = Color(0xFF64748B)
                        )
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(5.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(7.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF10B981))
                            )
                            Text(
                                text = "Online",
                                fontSize = 11.sp,
                                color = Color(0xFF10B981),
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            // Settings Menu Items Card
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    ProfileMenuItem(
                        icon = Icons.Outlined.Person,
                        title = "मेरो जानकारी",
                        onClick = onNavigateToLoginRegister
                    )
                    HorizontalDivider(color = Color(0xFFF1F5F9))

                    ProfileMenuItem(
                        icon = Icons.Outlined.BookmarkBorder,
                        title = "बचत गरिएको समाचार",
                        onClick = onNavigateToSaved
                    )
                    HorizontalDivider(color = Color(0xFFF1F5F9))

                    ProfileMenuItem(
                        icon = Icons.Outlined.History,
                        title = "पढेको इतिहास",
                        onClick = {}
                    )
                    HorizontalDivider(color = Color(0xFFF1F5F9))

                    ProfileMenuItem(
                        icon = Icons.Outlined.Notifications,
                        title = "सूचना सेटिङ",
                        onClick = onNavigateToNotifications
                    )
                    HorizontalDivider(color = Color(0xFFF1F5F9))

                    // Dark Mode Switch Row
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.DarkMode,
                                contentDescription = null,
                                tint = Color(0xFF64748B),
                                modifier = Modifier.size(20.dp)
                            )
                            Text(
                                text = "थीम (Dark Mode)",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = NepalNavy
                            )
                        }

                        Switch(
                            checked = isDarkMode,
                            onCheckedChange = { isDarkMode = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = NepalCrimson
                            )
                        )
                    }
                    HorizontalDivider(color = Color(0xFFF1F5F9))

                    // Language Row
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { }
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Language,
                                contentDescription = null,
                                tint = Color(0xFF64748B),
                                modifier = Modifier.size(20.dp)
                            )
                            Text(
                                text = "भाषा",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = NepalNavy
                            )
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = "नेपाली",
                                fontSize = 13.sp,
                                color = Color(0xFF64748B)
                            )
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForwardIos,
                                contentDescription = null,
                                tint = Color(0xFF94A3B8),
                                modifier = Modifier.size(13.dp)
                            )
                        }
                    }
                    HorizontalDivider(color = Color(0xFFF1F5F9))

                    // Delete Account Row
                    ProfileMenuItem(
                        icon = Icons.Outlined.DeleteOutline,
                        title = "खाता मेटाउने",
                        textColor = Color(0xFFEF4444),
                        iconColor = Color(0xFFEF4444),
                        onClick = { showDeleteDialog = true }
                    )
                }
            }

            // Quick Switch / Logout Option
            if (userProfile != null) {
                Button(
                    onClick = onLogoutClick,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFEE2E2)),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "लगआउट गर्नुहोस्",
                        color = NepalCrimson,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            } else {
                Button(
                    onClick = onNavigateToLoginRegister,
                    colors = ButtonDefaults.buttonColors(containerColor = NepalCrimson),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "लगइन वा नयाँ खाता खोल्नुहोस्",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }

    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("खाता मेटाउने पुष्टि गर्नुहोस्", fontWeight = FontWeight.Bold) },
            text = { Text("के तपाईं साँच्चै आफ्नो खाता र सबै सुरक्षित डाटा मेटाउन चाहनुहुन्छ? यो प्रक्रिया उल्टाउन सकिँदैन।") },
            confirmButton = {
                Button(
                    onClick = {
                        showDeleteDialog = false
                        onLogoutClick()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = NepalCrimson)
                ) {
                    Text("मेटाउनुहोस्")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("रद्द गर्नुहोस्")
                }
            }
        )
    }
}

@Composable
private fun ProfileMenuItem(
    icon: ImageVector,
    title: String,
    onClick: () -> Unit,
    textColor: Color = NepalNavy,
    iconColor: Color = Color(0xFF64748B)
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = iconColor,
                modifier = Modifier.size(20.dp)
            )
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = textColor
            )
        }

        Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowForwardIos,
            contentDescription = null,
            tint = Color(0xFF94A3B8),
            modifier = Modifier.size(13.dp)
        )
    }
}
