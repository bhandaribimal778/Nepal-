package com.example.model

data class UserSession(
    val accessToken: String,
    val refreshToken: String,
    val userId: String,
    val email: String,
    val expiresIn: Long = 3600
)

data class UserProfile(
    val id: String,
    val email: String,
    val fullName: String,
    val role: String = "reader",
    val avatarUrl: String = ""
)

sealed interface AuthState {
    data object Idle : AuthState
    data object Loading : AuthState
    data class Success(val profile: UserProfile, val message: String) : AuthState
    data class Error(val message: String) : AuthState
}
