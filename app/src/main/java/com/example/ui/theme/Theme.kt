package com.example.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = NepalCrimson,
    onPrimary = NewsSurfaceLight,
    primaryContainer = NepalCrimsonDark,
    onPrimaryContainer = NepalCrimsonLight,
    secondary = NepalNavyElevated,
    onSecondary = NewsTextPrimaryDark,
    tertiary = NepalGold,
    background = NewsBackgroundDark,
    onBackground = NewsTextPrimaryDark,
    surface = NewsSurfaceDark,
    onSurface = NewsTextPrimaryDark,
    surfaceVariant = NepalNavySurface,
    onSurfaceVariant = NewsTextSecondaryDark,
    outline = NewsBorderDark
)

private val LightColorScheme = lightColorScheme(
    primary = NepalCrimson,
    onPrimary = NewsSurfaceLight,
    primaryContainer = NepalCrimsonLight,
    onPrimaryContainer = NepalCrimsonDark,
    secondary = NepalNavy,
    onSecondary = NewsSurfaceLight,
    tertiary = NepalGold,
    background = NewsBackgroundLight,
    onBackground = NewsTextPrimaryLight,
    surface = NewsSurfaceLight,
    onSurface = NewsTextPrimaryLight,
    surfaceVariant = NewsBorderLight,
    onSurfaceVariant = NewsTextSecondaryLight,
    outline = NewsBorderLight
)

@Composable
fun NepalNewsTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
