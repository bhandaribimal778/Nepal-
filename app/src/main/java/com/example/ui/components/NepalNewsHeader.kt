package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.UserProfile
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalGold
import com.example.ui.theme.NepalNavy
import com.example.ui.theme.NepalNavySurface

@Composable
fun NepalNewsHeader(
    onSearchClick: () -> Unit,
    onSavedClick: () -> Unit,
    onProfileClick: () -> Unit,
    userProfile: UserProfile? = null,
    modifier: Modifier = Modifier
) {
    var liveClock by androidx.compose.runtime.remember {
        androidx.compose.runtime.mutableStateOf(com.example.util.NepalCalendarUtils.getNepalLiveClock())
    }
    var showBikramSambat by androidx.compose.runtime.remember {
        androidx.compose.runtime.mutableStateOf(false)
    }

    androidx.compose.runtime.LaunchedEffect(Unit) {
        while (true) {
            liveClock = com.example.util.NepalCalendarUtils.getNepalLiveClock()
            kotlinx.coroutines.delay(1000L)
        }
    }

    Surface(
        color = NepalNavy,
        shadowElevation = 4.dp,
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            // Top Live Clock, Date (Nepali Gregorian / BS) and Nepal Standard Time Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Live Clock Pill with Pulsing Live Indicator
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF3B0707))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(7.dp)
                            .clip(CircleShape)
                            .background(NepalCrimson)
                    )
                    Text(
                        text = liveClock.timeNe,
                        style = MaterialTheme.typography.labelSmall,
                        color = Color(0xFFFCA5A5),
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp
                    )
                }

                // Date with clickable toggle (AD Nepali vs BS)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { showBikramSambat = !showBikramSambat }
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = if (showBikramSambat) "वि.सं. ${liveClock.dateBsNe}" else liveClock.dateGregorianNe,
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White.copy(alpha = 0.9f),
                        fontWeight = FontWeight.Medium,
                        fontSize = 11.sp
                    )
                    Text(
                        text = if (showBikramSambat) "AD" else "वि.सं.",
                        style = MaterialTheme.typography.labelSmall,
                        color = NepalGold,
                        fontWeight = FontWeight.Bold,
                        fontSize = 9.sp,
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(Color.White.copy(alpha = 0.15f))
                            .padding(horizontal = 4.dp, vertical = 1.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Main Brand and Actions Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Nepal News Brand Logo
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.testTag("brand_logo_row")
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(NepalCrimson),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "ने",
                            color = Color.White,
                            fontWeight = FontWeight.Black,
                            fontSize = 20.sp
                        )
                    }

                    Column {
                        Text(
                            text = "नेपाल न्यूज",
                            style = MaterialTheme.typography.titleLarge,
                            color = Color.White,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 22.sp,
                            letterSpacing = 0.5.sp
                        )
                        Text(
                            text = "NEPAL NEWS PORTAL",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White.copy(alpha = 0.65f),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.SemiBold,
                            letterSpacing = 1.2.sp
                        )
                    }
                }

                // Action Shortcuts
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = onSearchClick,
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(NepalNavySurface)
                            .testTag("header_search_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "समाचार खोज्नुहोस्",
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    IconButton(
                        onClick = onSavedClick,
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(NepalNavySurface)
                            .testTag("header_saved_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Bookmark,
                            contentDescription = "सुरक्षित समाचार",
                            tint = NepalGold,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    // Profile / Account Button
                    IconButton(
                        onClick = onProfileClick,
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(
                                if (userProfile != null) NepalCrimson else NepalNavySurface
                            )
                            .testTag("header_profile_button")
                    ) {
                        if (userProfile != null) {
                            val initial = userProfile.fullName.trim().firstOrNull()?.uppercaseChar()
                                ?: userProfile.email.trim().firstOrNull()?.uppercaseChar()
                                ?: 'U'
                            Text(
                                text = initial.toString(),
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = "प्रयोगकर्ता खाता / लगइन",
                                tint = Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
