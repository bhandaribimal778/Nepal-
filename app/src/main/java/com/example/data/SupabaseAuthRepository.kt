package com.example.data

import android.content.Context
import android.util.Log
import com.example.model.UserProfile
import com.example.model.UserSession
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object SupabaseAuthRepository {

    private const val TAG = "SupabaseAuthRepo"
    private const val PREFS_NAME = "nepal_news_auth_prefs"
    private const val KEY_ACCESS_TOKEN = "access_token"
    private const val KEY_REFRESH_TOKEN = "refresh_token"
    private const val KEY_USER_ID = "user_id"
    private const val KEY_EMAIL = "email"
    private const val KEY_FULL_NAME = "full_name"
    private const val KEY_ROLE = "role"
    private const val KEY_AVATAR_URL = "avatar_url"

    var supabaseUrl: String = "https://yaawyaimhhfqpnexuxgb.supabase.co"
    var supabaseAnonKey: String = "sb_publishable_GL8kxO4n5o9CPx7Y198PXA_D3TWGMsY"

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA = "application/json; charset=utf-8".toMediaType()

    suspend fun signIn(email: String, password: String): Pair<UserSession, UserProfile> = withContext(Dispatchers.IO) {
        val endpoint = "${supabaseUrl.trimEnd('/')}/auth/v1/token?grant_type=password"
        val payload = JSONObject().apply {
            put("email", email.trim())
            put("password", password)
        }

        val request = Request.Builder()
            .url(endpoint)
            .addHeader("apikey", supabaseAnonKey)
            .addHeader("Content-Type", "application/json")
            .post(payload.toString().toRequestBody(JSON_MEDIA))
            .build()

        client.newCall(request).execute().use { response ->
            val bodyString = response.body?.string() ?: ""
            if (!response.isSuccessful) {
                val errorMsg = try {
                    val json = JSONObject(bodyString)
                    json.optString("error_description", json.optString("msg", "लगइन असफल भयो"))
                } catch (e: Exception) {
                    "लगइन असफल भयो: ${response.code}"
                }
                throw Exception(errorMsg)
            }

            val json = JSONObject(bodyString)
            val accessToken = json.getString("access_token")
            val refreshToken = json.optString("refresh_token", "")
            val expiresIn = json.optLong("expires_in", 3600)
            val userObj = json.getJSONObject("user")
            val userId = userObj.getString("id")
            val userEmail = userObj.optString("email", email)

            val session = UserSession(
                accessToken = accessToken,
                refreshToken = refreshToken,
                userId = userId,
                email = userEmail,
                expiresIn = expiresIn
            )

            val profile = fetchProfile(userId, accessToken, userEmail)
            Pair(session, profile)
        }
    }

    suspend fun signUp(fullName: String, email: String, password: String): Pair<UserSession?, UserProfile?> = withContext(Dispatchers.IO) {
        val endpoint = "${supabaseUrl.trimEnd('/')}/auth/v1/signup"
        val metaData = JSONObject().apply {
            put("full_name", fullName.trim())
        }
        val payload = JSONObject().apply {
            put("email", email.trim())
            put("password", password)
            put("data", metaData)
        }

        val request = Request.Builder()
            .url(endpoint)
            .addHeader("apikey", supabaseAnonKey)
            .addHeader("Content-Type", "application/json")
            .post(payload.toString().toRequestBody(JSON_MEDIA))
            .build()

        client.newCall(request).execute().use { response ->
            val bodyString = response.body?.string() ?: ""
            if (!response.isSuccessful) {
                val errorMsg = try {
                    val json = JSONObject(bodyString)
                    val raw = json.optString("error_description", json.optString("msg", "दर्ता असफल भयो"))
                    if (raw.contains("already registered", ignoreCase = true)) {
                        "यो इमेल पहिले नै दर्ता भइसकेको छ। कृपया लगइन गर्नुहोस्।"
                    } else {
                        raw
                    }
                } catch (e: Exception) {
                    "दर्ता असफल भयो: ${response.code}"
                }
                throw Exception(errorMsg)
            }

            val json = JSONObject(bodyString)
            val accessToken = json.optString("access_token")
            if (accessToken.isNotBlank()) {
                val refreshToken = json.optString("refresh_token", "")
                val expiresIn = json.optLong("expires_in", 3600)
                val userObj = json.optJSONObject("user")
                val userId = userObj?.optString("id") ?: json.optString("id")
                val userEmail = userObj?.optString("email") ?: email

                val session = UserSession(
                    accessToken = accessToken,
                    refreshToken = refreshToken,
                    userId = userId,
                    email = userEmail,
                    expiresIn = expiresIn
                )
                val profile = UserProfile(
                    id = userId,
                    email = userEmail,
                    fullName = fullName.trim(),
                    role = "reader"
                )
                Pair(session, profile)
            } else {
                Pair(null, null)
            }
        }
    }

    suspend fun fetchProfile(userId: String, accessToken: String, fallbackEmail: String): UserProfile = withContext(Dispatchers.IO) {
        try {
            val endpoint = "${supabaseUrl.trimEnd('/')}/rest/v1/profiles?id=eq.$userId&select=*"
            val request = Request.Builder()
                .url(endpoint)
                .addHeader("apikey", supabaseAnonKey)
                .addHeader("Authorization", "Bearer $accessToken")
                .addHeader("Accept", "application/json")
                .get()
                .build()

            client.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    val bodyString = response.body?.string() ?: ""
                    val array = JSONArray(bodyString)
                    if (array.length() > 0) {
                        val obj = array.getJSONObject(0)
                        return@withContext UserProfile(
                            id = obj.optString("id", userId),
                            email = obj.optString("email", fallbackEmail),
                            fullName = obj.optString("full_name", fallbackEmail.substringBefore('@')),
                            role = obj.optString("role", "reader"),
                            avatarUrl = obj.optString("avatar_url", "")
                        )
                    }
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to fetch profile from DB: ${e.message}")
        }

        UserProfile(
            id = userId,
            email = fallbackEmail,
            fullName = fallbackEmail.substringBefore('@'),
            role = "reader"
        )
    }

    fun saveSession(context: Context, session: UserSession, profile: UserProfile) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().apply {
            putString(KEY_ACCESS_TOKEN, session.accessToken)
            putString(KEY_REFRESH_TOKEN, session.refreshToken)
            putString(KEY_USER_ID, session.userId)
            putString(KEY_EMAIL, session.email)
            putString(KEY_FULL_NAME, profile.fullName)
            putString(KEY_ROLE, profile.role)
            putString(KEY_AVATAR_URL, profile.avatarUrl)
            apply()
        }
    }

    fun loadSession(context: Context): Pair<UserSession?, UserProfile?> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val token = prefs.getString(KEY_ACCESS_TOKEN, null) ?: return Pair(null, null)
        val refreshToken = prefs.getString(KEY_REFRESH_TOKEN, "") ?: ""
        val userId = prefs.getString(KEY_USER_ID, "") ?: ""
        val email = prefs.getString(KEY_EMAIL, "") ?: ""
        val fullName = prefs.getString(KEY_FULL_NAME, "") ?: ""
        val role = prefs.getString(KEY_ROLE, "reader") ?: "reader"
        val avatarUrl = prefs.getString(KEY_AVATAR_URL, "") ?: ""

        val session = UserSession(token, refreshToken, userId, email)
        val profile = UserProfile(userId, email, fullName, role, avatarUrl)
        return Pair(session, profile)
    }

    fun clearSession(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().clear().apply()
    }
}
