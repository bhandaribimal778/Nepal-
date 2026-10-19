package com.example.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.DevelopmentFixtures
import com.example.model.Article
import com.example.model.NavigationScreen
import com.example.model.NewsCategory
import com.example.model.NewsUiState
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class NewsViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<NewsUiState>(NewsUiState.Loading)
    val uiState: StateFlow<NewsUiState> = _uiState.asStateFlow()

    private val _currentScreen = MutableStateFlow(NavigationScreen.HOME)
    val currentScreen: StateFlow<NavigationScreen> = _currentScreen.asStateFlow()

    private val _selectedCategory = MutableStateFlow(NewsCategory.ALL)
    val selectedCategory: StateFlow<NewsCategory> = _selectedCategory.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _bookmarkedIds = MutableStateFlow<Set<String>>(
        setOf("art-budget", "art-snow", "art-cricket", "art-traffic")
    )
    val bookmarkedIds: StateFlow<Set<String>> = _bookmarkedIds.asStateFlow()

    private val _selectedArticle = MutableStateFlow<Article?>(null)
    val selectedArticle: StateFlow<Article?> = _selectedArticle.asStateFlow()

    private val _isAudioPlaying = MutableStateFlow(false)
    val isAudioPlaying: StateFlow<Boolean> = _isAudioPlaying.asStateFlow()

    private val _audioProgress = MutableStateFlow(0f)
    val audioProgress: StateFlow<Float> = _audioProgress.asStateFlow()

    private val _articleFontSize = MutableStateFlow(16) // Sp
    val articleFontSize: StateFlow<Int> = _articleFontSize.asStateFlow()

    // User Authentication States
    private val _userSession = MutableStateFlow<com.example.model.UserSession?>(null)
    val userSession: StateFlow<com.example.model.UserSession?> = _userSession.asStateFlow()

    private val _userProfile = MutableStateFlow<com.example.model.UserProfile?>(null)
    val userProfile: StateFlow<com.example.model.UserProfile?> = _userProfile.asStateFlow()

    private val _authState = MutableStateFlow<com.example.model.AuthState>(com.example.model.AuthState.Idle)
    val authState: StateFlow<com.example.model.AuthState> = _authState.asStateFlow()

    // Screen navigation stack to support Android back navigation
    private val navigationStack = mutableListOf<NavigationScreen>(NavigationScreen.HOME)

    fun initializeAuth(context: android.content.Context) {
        val (session, profile) = com.example.data.SupabaseAuthRepository.loadSession(context)
        if (session != null && profile != null) {
            _userSession.value = session
            _userProfile.value = profile
        }
    }

    fun login(context: android.content.Context, email: String, password: String) {
        viewModelScope.launch {
            _authState.value = com.example.model.AuthState.Loading
            try {
                val (session, profile) = com.example.data.SupabaseAuthRepository.signIn(email, password)
                com.example.data.SupabaseAuthRepository.saveSession(context, session, profile)
                _userSession.value = session
                _userProfile.value = profile
                _authState.value = com.example.model.AuthState.Success(profile, "नमस्ते ${profile.fullName}! तपाईं सफलतापूर्वक लगइन हुनुभयो।")
            } catch (e: Exception) {
                _authState.value = com.example.model.AuthState.Error(e.message ?: "लगइन असफल भयो। कृपया विवरण जाँच गर्नुहोस्।")
            }
        }
    }

    fun register(context: android.content.Context, fullName: String, email: String, password: String) {
        viewModelScope.launch {
            _authState.value = com.example.model.AuthState.Loading
            try {
                val (session, profile) = com.example.data.SupabaseAuthRepository.signUp(fullName, email, password)
                if (session != null && profile != null) {
                    com.example.data.SupabaseAuthRepository.saveSession(context, session, profile)
                    _userSession.value = session
                    _userProfile.value = profile
                    _authState.value = com.example.model.AuthState.Success(profile, "खाता सफलतापूर्वक सिर्जना भयो! तपाईं लगइन हुनुभयो।")
                } else {
                    _authState.value = com.example.model.AuthState.Success(
                        com.example.model.UserProfile("temp", email, fullName),
                        "दर्ता सफल भयो! तपाईं अब लगइन गर्न सक्नुहुन्छ।"
                    )
                }
            } catch (e: Exception) {
                _authState.value = com.example.model.AuthState.Error(e.message ?: "दर्ता असफल भयो। कृपया पुनः प्रयास गर्नुहोस्।")
            }
        }
    }

    fun logout(context: android.content.Context) {
        com.example.data.SupabaseAuthRepository.clearSession(context)
        _userSession.value = null
        _userProfile.value = null
        _authState.value = com.example.model.AuthState.Idle
    }

    fun clearAuthState() {
        _authState.value = com.example.model.AuthState.Idle
    }

    init {
        loadNews()
    }

    fun loadNews(forceError: Boolean = false) {
        viewModelScope.launch {
            _uiState.value = NewsUiState.Loading
            delay(500) // Brief natural transition
            if (forceError) {
                _uiState.value = NewsUiState.Error("इन्टरनेट जडान वा सर्भरमा समस्या देखियो। कृपया केही समयपछि पुनः प्रयास गर्नुहोस्।")
            } else {
                val articles = com.example.data.SupabaseNewsRepository.getPublishedArticles()
                val breaking = articles.filter { it.isBreaking }
                val featured = articles.firstOrNull { it.isFeatured } ?: articles.firstOrNull()
                val latest = articles.filter { !it.isFeatured }
                _uiState.value = NewsUiState.Success(
                    breakingNews = breaking,
                    featuredArticle = featured,
                    latestArticles = latest
                )
            }
        }
    }

    fun selectCategory(category: NewsCategory) {
        _selectedCategory.value = category
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun toggleBookmark(articleId: String) {
        val current = _bookmarkedIds.value.toMutableSet()
        if (current.contains(articleId)) {
            current.remove(articleId)
        } else {
            current.add(articleId)
        }
        _bookmarkedIds.value = current
    }

    fun openArticle(article: Article) {
        _selectedArticle.value = article
        _isAudioPlaying.value = false
        _audioProgress.value = 0f
        navigateTo(NavigationScreen.ARTICLE_DETAIL)
    }

    fun navigateTo(screen: NavigationScreen) {
        if (_currentScreen.value != screen) {
            navigationStack.add(screen)
            _currentScreen.value = screen
        }
    }

    fun navigateBack(): Boolean {
        if (navigationStack.size > 1) {
            navigationStack.removeAt(navigationStack.size - 1)
            _currentScreen.value = navigationStack.last()
            if (_currentScreen.value != NavigationScreen.ARTICLE_DETAIL) {
                _isAudioPlaying.value = false
            }
            return true
        }
        return false
    }

    fun toggleAudioPlayer() {
        val next = !_isAudioPlaying.value
        _isAudioPlaying.value = next
        if (next) {
            viewModelScope.launch {
                while (_isAudioPlaying.value && _audioProgress.value < 1f) {
                    delay(300)
                    _audioProgress.value = (_audioProgress.value + 0.02f).coerceAtMost(1f)
                    if (_audioProgress.value >= 1f) {
                        _isAudioPlaying.value = false
                    }
                }
            }
        }
    }

    fun adjustFontSize(delta: Int) {
        val current = _articleFontSize.value
        _articleFontSize.value = (current + delta).coerceIn(13, 24)
    }

    fun getFilteredArticles(): List<Article> {
        val all = DevelopmentFixtures.ARTICLES
        val cat = _selectedCategory.value
        return if (cat == NewsCategory.ALL) all else all.filter { it.category == cat }
    }

    fun getSearchResults(): List<Article> {
        val query = _searchQuery.value.trim().lowercase()
        if (query.isEmpty()) return emptyList()
        return DevelopmentFixtures.ARTICLES.filter { article ->
            article.title.lowercase().contains(query) ||
            article.summary.lowercase().contains(query) ||
            article.author.lowercase().contains(query) ||
            article.category.nepaliName.contains(query) ||
            article.tags.any { it.lowercase().contains(query) }
        }
    }

    fun getSavedArticles(): List<Article> {
        val saved = _bookmarkedIds.value
        return DevelopmentFixtures.ARTICLES.filter { saved.contains(it.id) }
    }
}
