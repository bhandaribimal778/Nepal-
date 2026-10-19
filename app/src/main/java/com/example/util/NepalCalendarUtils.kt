package com.example.util

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Accurate Nepali Calendar (Bikram Sambat - BS), Live Clock, and Nepal Standard Time (NPT: UTC+05:45) utilities.
 * Timezone: Asia/Kathmandu (UTC+5:45)
 */
object NepalCalendarUtils {

    val TIMEZONE_KATHMANDU: TimeZone = TimeZone.getTimeZone("Asia/Kathmandu")

    val NEPALI_BS_MONTHS = listOf(
        "बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
        "कात्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"
    )

    val NEPALI_BS_MONTHS_EN = listOf(
        "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
        "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
    )

    val NEPALI_DAYS = listOf(
        "आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहीबार", "शुक्रबार", "शनिबार"
    )

    val GREGORIAN_MONTHS_NE = listOf(
        "जनवरी", "फेब्रुअरी", "मार्च", "अप्रिल", "मे", "जुन",
        "जुलाई", "अगस्ट", "सेप्टेम्बर", "अक्टोबर", "नोभेम्बर", "डिसेम्बर"
    )

    private val NEPALI_DIGITS = charArrayOf('०', '१', '२', '३', '४', '५', '६', '७', '८', '९')

    /**
     * Convert English digits (0-9) to Nepali Devanagari numerals (०-९)
     */
    fun toNepaliNumerals(input: Any): String {
        val str = input.toString()
        val sb = StringBuilder(str.length)
        for (ch in str) {
            if (ch in '0'..'9') {
                sb.append(NEPALI_DIGITS[ch - '0'])
            } else {
                sb.append(ch)
            }
        }
        return sb.toString()
    }

    /**
     * Bikram Sambat Calendar Days Data per month (2070 BS to 2090 BS)
     */
    private val BS_CALENDAR_DATA: Map<Int, List<Int>> = mapOf(
        2070 to listOf(31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30),
        2071 to listOf(31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30),
        2072 to listOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31),
        2073 to listOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31),
        2074 to listOf(31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30),
        2075 to listOf(31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30),
        2076 to listOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31),
        2077 to listOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31),
        2078 to listOf(31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30),
        2079 to listOf(31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30),
        2080 to listOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31),
        2081 to listOf(31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30),
        2082 to listOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30),
        2083 to listOf(31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30), // 2026 AD
        2084 to listOf(31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30),
        2085 to listOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31),
        2086 to listOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31),
        2087 to listOf(31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30),
        2088 to listOf(31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30),
        2089 to listOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31),
        2090 to listOf(31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31)
    )

    private const val REF_BS_YEAR = 2080
    private const val REF_BS_MONTH = 1
    private const val REF_BS_DAY = 1
    // 2080 Baisakh 1 = April 14, 2023 UTC
    private const val REF_AD_TIME_MS = 1681430400000L // 2023-04-14 00:00:00 UTC

    data class BikramSambatDate(
        val year: Int,
        val month: Int,
        val day: Int,
        val monthNameNe: String,
        val dayNameNe: String,
        val formattedNe: String,
        val formattedEn: String
    )

    data class LiveClockState(
        val timeNe: String,
        val timeEn: String,
        val dateGregorianNe: String,
        val dateBsNe: String,
        val dayNameNe: String
    )

    /**
     * Convert Gregorian Date to Bikram Sambat (BS)
     */
    fun adToBikramSambat(adDate: Date = Date()): BikramSambatDate {
        val cal = Calendar.getInstance(TIMEZONE_KATHMANDU)
        cal.time = adDate

        val nptCal = Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply {
            set(cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH), 0, 0, 0)
            set(Calendar.MILLISECOND, 0)
        }

        var diffDays = ((nptCal.timeInMillis - REF_AD_TIME_MS) / (24 * 60 * 60 * 1000L)).toInt()

        var bsYear = REF_BS_YEAR
        var bsMonth = REF_BS_MONTH
        var bsDay = REF_BS_DAY

        val defaultYearDays = listOf(31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30)

        if (diffDays >= 0) {
            while (diffDays > 0) {
                val yearDays = BS_CALENDAR_DATA[bsYear] ?: defaultYearDays
                val monthDays = yearDays[bsMonth - 1]
                val daysLeftInMonth = monthDays - bsDay + 1

                if (diffDays >= daysLeftInMonth) {
                    diffDays -= daysLeftInMonth
                    bsDay = 1
                    bsMonth++
                    if (bsMonth > 12) {
                        bsMonth = 1
                        bsYear++
                    }
                } else {
                    bsDay += diffDays
                    diffDays = 0
                }
            }
        } else {
            while (diffDays < 0) {
                bsMonth--
                if (bsMonth < 1) {
                    bsMonth = 12
                    bsYear--
                }
                val yearDays = BS_CALENDAR_DATA[bsYear] ?: defaultYearDays
                val monthDays = yearDays[bsMonth - 1]

                if (Math.abs(diffDays) >= monthDays) {
                    diffDays += monthDays
                } else {
                    bsDay = monthDays + diffDays + 1
                    diffDays = 0
                }
            }
        }

        val dayOfWeekIndex = cal.get(Calendar.DAY_OF_WEEK) - 1 // Calendar.SUNDAY = 1
        val dayNameNe = NEPALI_DAYS.getOrElse(dayOfWeekIndex) { "आइतबार" }
        val monthNameNe = NEPALI_BS_MONTHS.getOrElse(bsMonth - 1) { "" }
        val monthNameEn = NEPALI_BS_MONTHS_EN.getOrElse(bsMonth - 1) { "" }

        val formattedNe = "${toNepaliNumerals(bsYear)} $monthNameNe ${toNepaliNumerals(bsDay)} गते, $dayNameNe"
        val formattedEn = "$bsDay $monthNameEn $bsYear"

        return BikramSambatDate(
            year = bsYear,
            month = bsMonth,
            day = bsDay,
            monthNameNe = monthNameNe,
            dayNameNe = dayNameNe,
            formattedNe = formattedNe,
            formattedEn = formattedEn
        )
    }

    /**
     * Get Gregorian Date in Nepali format (e.g., "१९ अक्टोबर २०२६, सोमबार")
     */
    fun getGregorianInNepali(date: Date = Date()): String {
        val cal = Calendar.getInstance(TIMEZONE_KATHMANDU)
        cal.time = date

        val day = toNepaliNumerals(cal.get(Calendar.DAY_OF_MONTH))
        val monthIndex = cal.get(Calendar.MONTH)
        val month = GREGORIAN_MONTHS_NE.getOrElse(monthIndex) { "" }
        val year = toNepaliNumerals(cal.get(Calendar.YEAR))
        val dayOfWeekIndex = cal.get(Calendar.DAY_OF_WEEK) - 1
        val dayName = NEPALI_DAYS.getOrElse(dayOfWeekIndex) { "" }

        return "$day $month $year, $dayName"
    }

    /**
     * Get Live Digital Clock and Date in Nepal Standard Time (UTC+05:45)
     */
    fun getNepalLiveClock(date: Date = Date()): LiveClockState {
        val cal = Calendar.getInstance(TIMEZONE_KATHMANDU)
        cal.time = date

        val hour24 = cal.get(Calendar.HOUR_OF_DAY)
        val minutes = cal.get(Calendar.MINUTE)
        val seconds = cal.get(Calendar.SECOND)

        val isPm = hour24 >= 12
        val hour12 = if (hour24 % 12 == 0) 12 else hour24 % 12

        val periodNe = when {
            hour24 in 12..15 -> "दिउँसो"
            hour24 in 16..18 -> "साँझ"
            hour24 >= 19 || hour24 < 4 -> "राति"
            else -> "बिहान"
        }

        val periodEn = if (isPm) "PM" else "AM"

        val pad = { n: Int -> if (n < 10) "0$n" else "$n" }

        val rawHour = pad(hour12)
        val rawMin = pad(minutes)
        val rawSec = pad(seconds)

        val timeNe = "${toNepaliNumerals(rawHour)}:${toNepaliNumerals(rawMin)}:${toNepaliNumerals(rawSec)} $periodNe"
        val timeEn = "$rawHour:$rawMin:$rawSec $periodEn (NPT)"

        val dateGregorianNe = getGregorianInNepali(date)
        val bsDate = adToBikramSambat(date)

        return LiveClockState(
            timeNe = timeNe,
            timeEn = timeEn,
            dateGregorianNe = dateGregorianNe,
            dateBsNe = bsDate.formattedNe,
            dayNameNe = bsDate.dayNameNe
        )
    }

    /**
     * Formats published_at from ISO 8601 UTC timestamp to relative time (e.g. "५ मिनेटअघि")
     */
    fun formatArticlePublishedAt(isoTimestamp: String?): String {
        if (isoTimestamp.isNullOrBlank()) {
            return "भर्खरै"
        }

        return try {
            val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
            // Strip fractional seconds if any
            val cleanStr = isoTimestamp.replace(Regex("\\.[0-9]+"), "").replace("Z", "").replace(Regex("[+-][0-9:]+$"), "")
            val parsedDate = format.parse(cleanStr) ?: return "भर्खरै"

            val diffMs = System.currentTimeMillis() - parsedDate.time
            val diffSec = Math.max(0L, diffMs / 1000L)

            when {
                diffSec < 60 -> "भर्खरै"
                diffSec < 3600 -> {
                    val mins = (diffSec / 60).toInt()
                    "${toNepaliNumerals(mins)} मिनेटअघि"
                }
                diffSec < 86400 -> {
                    val hours = (diffSec / 3600).toInt()
                    "${toNepaliNumerals(hours)} घण्टाअघि"
                }
                diffSec < 172800 -> "हिजो"
                diffSec < 604800 -> {
                    val days = (diffSec / 86400).toInt()
                    "${toNepaliNumerals(days)} दिनअघि"
                }
                else -> {
                    val bs = adToBikramSambat(parsedDate)
                    "${bs.monthNameNe} ${toNepaliNumerals(bs.day)}"
                }
            }
        } catch (e: Exception) {
            "भर्खरै"
        }
    }
}
