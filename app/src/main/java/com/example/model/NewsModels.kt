package com.example.model

enum class NewsCategory(val nepaliName: String, val slug: String) {
    ALL("सबै", "all"),
    POLITICS("राजनीति", "politics"),
    ECONOMY("अर्थतन्त्र", "economy"),
    SOCIETY("समाज", "society"),
    SPORTS("खेलकुद", "sports"),
    ENTERTAINMENT("मनोरञ्जन", "entertainment"),
    TECH("प्रविधि", "tech"),
    HEALTH("स्वास्थ्य", "health"),
    EDUCATION("शिक्षा", "education"),
    WORLD("अन्तर्राष्ट्रिय", "world"),
    LOCAL("स्थानीय", "local"),
    PROVINCE("प्रदेश", "province"),
    OPINION("विचार", "opinion");

    companion object {
        fun fromSlug(slug: String): NewsCategory {
            return entries.find { it.slug.equals(slug, ignoreCase = true) } ?: ALL
        }
    }
}

data class Article(
    val id: String,
    val title: String,
    val summary: String,
    val content: List<String>,
    val category: NewsCategory,
    val author: String,
    val authorRole: String,
    val publishedAt: String,
    val readTimeMinutes: Int,
    val imageUrl: String,
    val isBreaking: Boolean = false,
    val isFeatured: Boolean = false,
    val viewCount: Int = 1200,
    val tags: List<String> = emptyList(),
    val location: String = "काठमाडौँ"
)

data class ArticleComment(
    val id: String,
    val author: String,
    val content: String,
    val timeAgo: String
)

sealed interface NewsUiState {
    data object Loading : NewsUiState
    data class Success(
        val breakingNews: List<Article>,
        val featuredArticle: Article?,
        val latestArticles: List<Article>
    ) : NewsUiState
    data class Error(val message: String) : NewsUiState
}

enum class NavigationScreen {
    HOME,
    CATEGORIES,
    SEARCH,
    SAVED,
    ARTICLE_DETAIL,
    PROFILE,
    NOTIFICATION_SETTINGS,
    LOGIN_REGISTER
}
