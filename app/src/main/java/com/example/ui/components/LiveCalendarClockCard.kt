package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalNavy
import com.example.util.NepalCalendarUtils
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun LiveCalendarClockCard(
    modifier: Modifier = Modifier
) {
    var currentTime by remember { mutableStateOf(Date()) }
    var showBsPrimary by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        while (true) {
            currentTime = Date()
            delay(1000L)
        }
    }

    // Nepal Standard Time (UTC+05:45)
    val timeFormat = remember {
        SimpleDateFormat("hh:mm:ss", Locale.US).apply {
            timeZone = NepalCalendarUtils.TIMEZONE_KATHMANDU
        }
    }
    val amPmFormat = remember {
        SimpleDateFormat("a", Locale.US).apply {
            timeZone = NepalCalendarUtils.TIMEZONE_KATHMANDU
        }
    }
    val adDateFormat = remember {
        SimpleDateFormat("d MMM yyyy", Locale.US).apply {
            timeZone = NepalCalendarUtils.TIMEZONE_KATHMANDU
        }
    }

    val bsDate = remember(currentTime) {
        NepalCalendarUtils.adToBikramSambat(currentTime)
    }
    val timeDigits = timeFormat.format(currentTime)
    val amPm = amPmFormat.format(currentTime)
    val adFormatted = adDateFormat.format(currentTime)

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clickable { showBsPrimary = !showBsPrimary }
            .testTag("live_calendar_clock_card")
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left: Calendar Icon + Date
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.CalendarMonth,
                    contentDescription = "क्यालेन्डर",
                    tint = NepalCrimson,
                    modifier = Modifier.size(24.dp)
                )

                Column {
                    Text(
                        text = if (showBsPrimary) {
                            "${bsDate.dayNameNe}, ${NepalCalendarUtils.toNepaliNumerals(bsDate.day)} ${bsDate.monthNameNe} ${NepalCalendarUtils.toNepaliNumerals(bsDate.year)} ($adFormatted)"
                        } else {
                            "${bsDate.dayNameNe}, $adFormatted (वि.सं. ${bsDate.monthNameNe} ${NepalCalendarUtils.toNepaliNumerals(bsDate.day)})"
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = NepalNavy,
                        fontSize = 12.5.sp
                    )
                    Text(
                        text = "नेपाल समय (NPT)",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color(0xFF64748B),
                        fontSize = 10.5.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Right: Big Digital Live Clock
            Row(
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.spacedBy(3.dp)
            ) {
                Text(
                    text = timeDigits,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 17.sp,
                    color = NepalNavy
                )
                Text(
                    text = amPm,
                    fontWeight = FontWeight.Bold,
                    fontSize = 10.sp,
                    color = NepalCrimson,
                    modifier = Modifier.padding(bottom = 1.dp)
                )
            }
        }
    }
}
