package com.example

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.Category
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.Article
import com.example.model.NavigationScreen
import com.example.ui.components.NepalNewsHeader
import com.example.ui.screens.*
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalNavy
import com.example.ui.theme.NepalNewsTheme
import com.example.viewmodel.NewsViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: NewsViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            NepalNewsTheme {
                NepalNewsApp(viewModel = viewModel)
            }
        }
    }
}

sealed class BottomNavItem(
    val screen: NavigationScreen,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val testTag: String
) {
    data object Home : BottomNavItem(NavigationScreen.HOME, "गृहपृष्ठ", Icons.Filled.Home, Icons.Outlined.Home, "nav_home")
    data object Categories : BottomNavItem(NavigationScreen.CATEGORIES, "वर्गहरू", Icons.Filled.Category, Icons.Outlined.Category, "nav_categories")
    data object Search : BottomNavItem(NavigationScreen.SEARCH, "खोज", Icons.Filled.Search, Icons.Outlined.Search, "nav_search")
    data object Saved : BottomNavItem(NavigationScreen.SAVED, "सुरक्षित", Icons.Filled.Bookmark, Icons.Outlined.BookmarkBorder, "nav_saved")
    data object Admin : BottomNavItem(NavigationScreen.ADMIN, "एडमिन", Icons.Filled.Lock, Icons.Outlined.Lock, "nav_admin")
}

@Composable
fun NepalNewsApp(viewModel: NewsViewModel) {
    val context = LocalContext.current
    val currentScreen by viewModel.currentScreen.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val bookmarkedIds by viewModel.bookmarkedIds.collectAsState()
    val selectedArticle by viewModel.selectedArticle.collectAsState()
    val isAudioPlaying by viewModel.isAudioPlaying.collectAsState()
    val audioProgress by viewModel.audioProgress.collectAsState()
    val fontSizeSp by viewModel.articleFontSize.collectAsState()

    // Handle Android system back button
    BackHandler(enabled = currentScreen != NavigationScreen.HOME) {
        viewModel.navigateBack()
    }

    val navItems = listOf(
        BottomNavItem.Home,
        BottomNavItem.Categories,
        BottomNavItem.Search,
        BottomNavItem.Saved,
        BottomNavItem.Admin
    )

    fun shareArticle(article: Article) {
        val sendIntent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_TEXT, "${article.title}\n\n${article.summary}\n\nनेपाल न्यूज पोर्टलबाट थप पढ्नुहोस्")
            type = "text/plain"
        }
        val shareIntent = Intent.createChooser(sendIntent, "समाचार साझेदारी गर्नुहोस्")
        context.startActivity(shareIntent)
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            if (currentScreen != NavigationScreen.ARTICLE_DETAIL && currentScreen != NavigationScreen.ADMIN) {
                NepalNewsHeader(
                    onSearchClick = { viewModel.navigateTo(NavigationScreen.SEARCH) },
                    onSavedClick = { viewModel.navigateTo(NavigationScreen.SAVED) },
                    onAdminClick = { viewModel.navigateTo(NavigationScreen.ADMIN) }
                )
            }
        },
        bottomBar = {
            if (currentScreen != NavigationScreen.ARTICLE_DETAIL) {
                NavigationBar(
                    containerColor = Color.White,
                    tonalElevation = 8.dp,
                    modifier = Modifier.testTag("bottom_navigation_bar")
                ) {
                    navItems.forEach { item ->
                        val isSelected = currentScreen == item.screen
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = { viewModel.navigateTo(item.screen) },
                            icon = {
                                Icon(
                                    imageVector = if (isSelected) item.selectedIcon else item.unselectedIcon,
                                    contentDescription = item.title
                                )
                            },
                            label = {
                                Text(
                                    text = item.title,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    fontSize = 11.sp
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = NepalCrimson,
                                selectedTextColor = NepalCrimson,
                                unselectedIconColor = Color(0xFF64748B),
                                unselectedTextColor = Color(0xFF64748B),
                                indicatorColor = Color(0xFFFEE2E2)
                            ),
                            modifier = Modifier.testTag(item.testTag)
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color(0xFFF8FAFC))
        ) {
            when (currentScreen) {
                NavigationScreen.HOME -> {
                    HomeScreen(
                        uiState = uiState,
                        selectedCategory = selectedCategory,
                        bookmarkedIds = bookmarkedIds,
                        onCategorySelected = { viewModel.selectCategory(it) },
                        onArticleClick = { viewModel.openArticle(it) },
                        onBookmarkToggle = { viewModel.toggleBookmark(it) },
                        onShareClick = { shareArticle(it) },
                        onRetry = { viewModel.loadNews() }
                    )
                }

                NavigationScreen.CATEGORIES -> {
                    CategoryScreen(
                        selectedCategory = selectedCategory,
                        articles = viewModel.getFilteredArticles(),
                        bookmarkedIds = bookmarkedIds,
                        onCategorySelected = { viewModel.selectCategory(it) },
                        onArticleClick = { viewModel.openArticle(it) },
                        onBookmarkToggle = { viewModel.toggleBookmark(it) }
                    )
                }

                NavigationScreen.SEARCH -> {
                    SearchScreen(
                        searchQuery = searchQuery,
                        searchResults = viewModel.getSearchResults(),
                        bookmarkedIds = bookmarkedIds,
                        onQueryChange = { viewModel.setSearchQuery(it) },
                        onArticleClick = { viewModel.openArticle(it) },
                        onBookmarkToggle = { viewModel.toggleBookmark(it) }
                    )
                }

                NavigationScreen.SAVED -> {
                    SavedScreen(
                        savedArticles = viewModel.getSavedArticles(),
                        bookmarkedIds = bookmarkedIds,
                        onArticleClick = { viewModel.openArticle(it) },
                        onBookmarkToggle = { viewModel.toggleBookmark(it) },
                        onExploreClick = { viewModel.navigateTo(NavigationScreen.HOME) }
                    )
                }

                NavigationScreen.ARTICLE_DETAIL -> {
                    val article = selectedArticle
                    if (article != null) {
                        ArticleDetailScreen(
                            article = article,
                            isBookmarked = bookmarkedIds.contains(article.id),
                            isAudioPlaying = isAudioPlaying,
                            audioProgress = audioProgress,
                            fontSizeSp = fontSizeSp,
                            allArticles = viewModel.getFilteredArticles(),
                            bookmarkedIds = bookmarkedIds,
                            onBackClick = { viewModel.navigateBack() },
                            onBookmarkToggle = { viewModel.toggleBookmark(it) },
                            onShareClick = { shareArticle(it) },
                            onToggleAudio = { viewModel.toggleAudioPlayer() },
                            onAdjustFontSize = { viewModel.adjustFontSize(it) },
                            onRelatedArticleClick = { viewModel.openArticle(it) }
                        )
                    } else {
                        viewModel.navigateBack()
                    }
                }

                NavigationScreen.ADMIN -> {
                    AdminScreen(
                        onBackClick = { viewModel.navigateBack() },
                        onArticlePublished = {
                            viewModel.loadNews()
                            viewModel.navigateBack()
                        }
                    )
                }
            }
        }
    }
}
