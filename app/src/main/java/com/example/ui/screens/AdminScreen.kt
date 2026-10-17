package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.SupabaseNewsRepository
import com.example.model.NewsCategory
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalNavy
import com.example.ui.theme.NewsBorderLight
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminScreen(
    onBackClick: () -> Unit,
    onArticlePublished: () -> Unit,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()

    var email by remember { mutableStateOf("bhandaribimal778@gmail.com") }
    var password by remember { mutableStateOf("") }
    var authToken by remember { mutableStateOf<String?>(null) }
    var isLoggingIn by remember { mutableStateOf(false) }
    var authError by remember { mutableStateOf<String?>(null) }

    // Publish form state
    var title by remember { mutableStateOf("") }
    var summary by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf(NewsCategory.POLITICS) }
    var isBreaking by remember { mutableStateOf(false) }
    var isFeatured by remember { mutableStateOf(false) }
    var isPublishing by remember { mutableStateOf(false) }
    var publishSuccess by remember { mutableStateOf<String?>(null) }

    val client = remember { OkHttpClient() }

    fun doLogin() {
        if (email.isBlank() || password.isBlank()) {
            authError = "कृपया इमेल र पासवर्ड भर्नुहोस्"
            return
        }
        coroutineScope.launch {
            isLoggingIn = true
            authError = null
            try {
                withContext(Dispatchers.IO) {
                    val url = "${SupabaseNewsRepository.supabaseUrl}/auth/v1/token?grant_type=password"
                    val body = JSONObject().apply {
                        put("email", email.trim())
                        put("password", password)
                    }.toString()

                    val req = Request.Builder()
                        .url(url)
                        .addHeader("apikey", SupabaseNewsRepository.supabaseAnonKey)
                        .addHeader("Content-Type", "application/json")
                        .post(body.toRequestBody("application/json".toMediaType()))
                        .build()

                    client.newCall(req).execute().use { resp ->
                        val respBody = resp.body?.string() ?: ""
                        if (resp.isSuccessful) {
                            val json = JSONObject(respBody)
                            val token = json.getString("access_token")
                            val userObj = json.getJSONObject("user")
                            val userId = userObj.getString("id")

                            // Check role in profiles
                            val profileReq = Request.Builder()
                                .url("${SupabaseNewsRepository.supabaseUrl}/rest/v1/profiles?id=eq.$userId&select=*")
                                .addHeader("apikey", SupabaseNewsRepository.supabaseAnonKey)
                                .addHeader("Authorization", "Bearer $token")
                                .get()
                                .build()

                            client.newCall(profileReq).execute().use { pResp ->
                                val pBody = pResp.body?.string() ?: "[]"
                                val pArray = JSONArray(pBody)
                                if (pArray.length() > 0 && pArray.getJSONObject(0).optString("role") == "admin") {
                                    authToken = token
                                } else {
                                    authError = "तपाईंको खातामा Admin अधिकार छैन।"
                                }
                            }
                        } else {
                            val json = JSONObject(respBody)
                            authError = json.optString("msg", "लगइन असफल भयो")
                        }
                    }
                }
            } catch (e: Exception) {
                authError = "जडान त्रुटि: ${e.message}"
            } finally {
                isLoggingIn = false
            }
        }
    }

    fun publishArticle() {
        if (title.isBlank() || summary.isBlank() || authToken == null) {
            authError = "कृपया शीर्षक र विवरण लेख्नुहोस्"
            return
        }

        coroutineScope.launch {
            isPublishing = true
            publishSuccess = null
            authError = null
            try {
                withContext(Dispatchers.IO) {
                    val cleanSlug = title.trim().lowercase().replace(Regex("[^a-z0-9]+"), "-")
                        .ifBlank { "news-${System.currentTimeMillis()}" }

                    // Resolve category UUID
                    val catReq = Request.Builder()
                        .url("${SupabaseNewsRepository.supabaseUrl}/rest/v1/categories?slug=eq.${selectedCategory.slug}&select=id")
                        .addHeader("apikey", SupabaseNewsRepository.supabaseAnonKey)
                        .addHeader("Authorization", "Bearer $authToken")
                        .get()
                        .build()

                    var catId = ""
                    client.newCall(catReq).execute().use { cResp ->
                        val cArray = JSONArray(cResp.body?.string() ?: "[]")
                        if (cArray.length() > 0) {
                            catId = cArray.getJSONObject(0).getString("id")
                        }
                    }

                    val payload = JSONObject().apply {
                        put("title", title.trim())
                        put("slug", cleanSlug)
                        put("summary", summary.trim())
                        put("content", JSONArray().put(summary.trim()))
                        put("category_id", catId)
                        put("status", "published")
                        put("is_breaking", isBreaking)
                        put("is_featured", isFeatured)
                        put("image_url", "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80")
                        put("read_time_minutes", 3)
                    }.toString()

                    val insertReq = Request.Builder()
                        .url("${SupabaseNewsRepository.supabaseUrl}/rest/v1/articles")
                        .addHeader("apikey", SupabaseNewsRepository.supabaseAnonKey)
                        .addHeader("Authorization", "Bearer $authToken")
                        .addHeader("Content-Type", "application/json")
                        .post(payload.toRequestBody("application/json".toMediaType()))
                        .build()

                    client.newCall(insertReq).execute().use { insResp ->
                        if (insResp.isSuccessful) {
                            publishSuccess = "समाचार Supabase मा सफलतापूर्वक प्रकाशित भयो!"
                            title = ""
                            summary = ""
                        } else {
                            val errJson = insResp.body?.string() ?: ""
                            authError = "प्रकाशन त्रुटि (RLS): $errJson"
                        }
                    }
                }
                if (publishSuccess != null) {
                    onArticlePublished()
                }
            } catch (e: Exception) {
                authError = "प्रकाशनमा समस्या: ${e.message}"
            } finally {
                isPublishing = false
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "व्यवस्थापक प्यानल (Admin)",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = NepalNavy
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "फर्कनुहोस्",
                            tint = NepalNavy
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        modifier = modifier.fillMaxSize()
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color(0xFFF8FAFC)),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = NepalNavy),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Shield,
                                contentDescription = null,
                                tint = NepalCrimson,
                                modifier = Modifier.size(24.dp)
                            )
                            Text(
                                text = "सुरक्षित एडमिन प्रमाणीकरण",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Supabase Auth & PostgreSQL RLS द्वारा सुरक्षित",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF94A3B8)
                        )
                    }
                }
            }

            if (authError != null) {
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFEE2E2)),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = authError ?: "",
                            color = Color(0xFF991B1B),
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                }
            }

            if (publishSuccess != null) {
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFD1FAE5)),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color(0xFF065F46)
                            )
                            Text(
                                text = publishSuccess ?: "",
                                color = Color(0xFF065F46),
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }
                }
            }

            if (authToken == null) {
                item {
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(2.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text(
                                text = "व्यवस्थापक लगइन",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = NepalNavy
                            )

                            OutlinedTextField(
                                value = email,
                                onValueChange = { email = it },
                                label = { Text("इमेल ठेगाना") },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )

                            OutlinedTextField(
                                value = password,
                                onValueChange = { password = it },
                                label = { Text("पासवर्ड") },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )

                            Button(
                                onClick = { doLogin() },
                                colors = ButtonDefaults.buttonColors(containerColor = NepalCrimson),
                                shape = RoundedCornerShape(8.dp),
                                enabled = !isLoggingIn,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                if (isLoggingIn) {
                                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                                } else {
                                    Icon(imageVector = Icons.Default.Lock, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("लगइन गर्नुहोस्", fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            } else {
                // Logged in as Admin: Publish news
                item {
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(2.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text(
                                text = "नयाँ समाचार सिधै Supabase मा प्रकाशित गर्नुहोस्",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = NepalNavy
                            )

                            OutlinedTextField(
                                value = title,
                                onValueChange = { title = it },
                                label = { Text("समाचारको शीर्षक *") },
                                modifier = Modifier.fillMaxWidth()
                            )

                            OutlinedTextField(
                                value = summary,
                                onValueChange = { summary = it },
                                label = { Text("सारसंक्षेप / विवरण *") },
                                minLines = 3,
                                modifier = Modifier.fillMaxWidth()
                            )

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("ताजा अपडेट (Breaking Ticker):", style = MaterialTheme.typography.bodySmall)
                                Switch(checked = isBreaking, onCheckedChange = { isBreaking = it })
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("मुख्य समाचार (Featured Hero):", style = MaterialTheme.typography.bodySmall)
                                Switch(checked = isFeatured, onCheckedChange = { isFeatured = it })
                            }

                            Button(
                                onClick = { publishArticle() },
                                colors = ButtonDefaults.buttonColors(containerColor = NepalCrimson),
                                shape = RoundedCornerShape(8.dp),
                                enabled = !isPublishing,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                if (isPublishing) {
                                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                                } else {
                                    Icon(imageVector = Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("समाचार प्रकाशित गर्नुहोस् (Publish)", fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
