package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.AuthState
import com.example.model.UserProfile
import com.example.model.UserSession
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalNavy

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    userSession: UserSession?,
    userProfile: UserProfile?,
    authState: AuthState,
    savedCount: Int,
    onLoginClick: (String, String) -> Unit,
    onRegisterClick: (String, String, String) -> Unit,
    onLogoutClick: () -> Unit,
    onNavigateToSaved: () -> Unit,
    onClearError: () -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .imePadding()
            .verticalScroll(scrollState)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (userSession != null && userProfile != null) {
            // Logged-in profile view
            LoggedInView(
                profile = userProfile,
                savedCount = savedCount,
                onLogoutClick = onLogoutClick,
                onNavigateToSaved = onNavigateToSaved
            )
        } else {
            // Logged-out view with Login and Register tabs
            LoggedOutAuthView(
                authState = authState,
                onLoginClick = onLoginClick,
                onRegisterClick = onRegisterClick,
                onClearError = onClearError
            )
        }
    }
}

@Composable
private fun LoggedInView(
    profile: UserProfile,
    savedCount: Int,
    onLogoutClick: () -> Unit,
    onNavigateToSaved: () -> Unit
) {
    var showLogoutDialog by remember { mutableStateOf(false) }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = {
                Text("लगआउट पुष्टि गर्नुहोस्", fontWeight = FontWeight.Bold)
            },
            text = {
                Text("के तपाईं साँच्चै आफ्नो खाताबाट लगआउट गर्न चाहनुहुन्छ?")
            },
            confirmButton = {
                Button(
                    onClick = {
                        showLogoutDialog = false
                        onLogoutClick()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = NepalCrimson)
                ) {
                    Text("लगआउट", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("रद्द गर्नुहोस्")
                }
            }
        )
    }

    // Profile Header Card
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 16.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(NepalNavy, Color(0xFF1E293B))
                    )
                )
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                // Avatar circle
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.linearGradient(
                                listOf(NepalCrimson, Color(0xFFF59E0B))
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    val initial = profile.fullName.trim().firstOrNull()?.uppercaseChar()
                        ?: profile.email.trim().firstOrNull()?.uppercaseChar()
                        ?: 'U'
                    Text(
                        text = initial.toString(),
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = profile.fullName.ifBlank { "नेपाल न्यूज पाठक" },
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = profile.email,
                    fontSize = 13.sp,
                    color = Color(0xFF94A3B8)
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Role chip
                Surface(
                    shape = RoundedCornerShape(50),
                    color = if (profile.role == "admin") Color(0xFFFEF3C7) else Color(0xFFDCFCE7),
                    contentColor = if (profile.role == "admin") Color(0xFF92400E) else Color(0xFF166534)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (profile.role == "admin") Icons.Filled.Shield else Icons.Filled.CheckCircle,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (profile.role == "admin") "व्यवस्थापक (Admin)" else "प्रमाणित पाठक (Reader)",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }

    // Account Summary Section
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "खाता विवरण तथा सुविधाहरू",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1E293B)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Saved Articles row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.Bookmark,
                        contentDescription = null,
                        tint = Color(0xFFF59E0B),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(text = "सुरक्षित समाचारहरू", fontSize = 14.sp)
                }
                Text(
                    text = "$savedCount वटा",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = NepalCrimson
                )
            }

            HorizontalDivider(color = Color(0xFFF1F5F9))

            // Account Status row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.VerifiedUser,
                        contentDescription = null,
                        tint = Color(0xFF10B981),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(text = "खाताको अवस्था", fontSize = 14.sp)
                }
                Text(
                    text = "सक्रिय (Active)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = Color(0xFF10B981)
                )
            }
        }
    }

    // Saved Articles Shortcut Button
    OutlinedButton(
        onClick = onNavigateToSaved,
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 12.dp)
            .height(50.dp),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.outlinedButtonColors(contentColor = NepalNavy)
    ) {
        Icon(imageVector = Icons.Outlined.Bookmark, contentDescription = null)
        Spacer(modifier = Modifier.width(8.dp))
        Text("सुरक्षित समाचारहरू पढ्नुहोस्", fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.weight(1f))
        Icon(imageVector = Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
    }

    // Logout Button
    Button(
        onClick = { showLogoutDialog = true },
        modifier = Modifier
            .fillMaxWidth()
            .height(50.dp)
            .testTag("logout_button"),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFFFEE2E2),
            contentColor = NepalCrimson
        )
    ) {
        Icon(imageVector = Icons.Filled.Logout, contentDescription = null)
        Spacer(modifier = Modifier.width(8.dp))
        Text("खाताबाट लगआउट गर्नुहोस् (Sign Out)", fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun LoggedOutAuthView(
    authState: AuthState,
    onLoginClick: (String, String) -> Unit,
    onRegisterClick: (String, String, String) -> Unit,
    onClearError: () -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) } // 0 = Login, 1 = Register
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var isPasswordVisible by remember { mutableStateOf(false) }
    var localValidationMsg by remember { mutableStateOf<String?>(null) }

    // Top Brand Logo
    Box(
        modifier = Modifier
            .size(64.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(NepalCrimson),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "ने",
            color = Color.White,
            fontWeight = FontWeight.Black,
            fontSize = 32.sp
        )
    }

    Spacer(modifier = Modifier.height(12.dp))

    Text(
        text = "नेपाल न्यूज पाठक पोर्टल",
        fontSize = 20.sp,
        fontWeight = FontWeight.Black,
        color = NepalNavy
    )

    Text(
        text = "आफ्नो खातामा लगइन वा नयाँ दर्ता गरी व्यक्तिगत समाचार अनुभव लिनुहोस्",
        fontSize = 12.sp,
        color = Color(0xFF64748B),
        textAlign = TextAlign.Center,
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
    )

    Spacer(modifier = Modifier.height(16.dp))

    // Card with Tabs
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            // Segmented Tabs
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color(0xFFF1F5F9),
                contentColor = NepalCrimson,
                indicator = {},
                divider = {},
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .padding(4.dp)
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = {
                        selectedTab = 0
                        localValidationMsg = null
                        onClearError()
                    },
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (selectedTab == 0) Color.White else Color.Transparent)
                        .padding(vertical = 10.dp)
                ) {
                    Text(
                        text = "लगइन (Login)",
                        fontWeight = if (selectedTab == 0) FontWeight.Bold else FontWeight.Normal,
                        color = if (selectedTab == 0) NepalCrimson else Color(0xFF64748B),
                        fontSize = 13.sp
                    )
                }

                Tab(
                    selected = selectedTab == 1,
                    onClick = {
                        selectedTab = 1
                        localValidationMsg = null
                        onClearError()
                    },
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (selectedTab == 1) Color.White else Color.Transparent)
                        .padding(vertical = 10.dp)
                ) {
                    Text(
                        text = "नयाँ दर्ता (Register)",
                        fontWeight = if (selectedTab == 1) FontWeight.Bold else FontWeight.Normal,
                        color = if (selectedTab == 1) NepalCrimson else Color(0xFF64748B),
                        fontSize = 13.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Error display
            val errorText = localValidationMsg ?: if (authState is AuthState.Error) authState.message else null
            if (errorText != null) {
                Surface(
                    color = Color(0xFFFEF2F2),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.ErrorOutline,
                            contentDescription = null,
                            tint = Color(0xFFDC2626),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = errorText,
                            color = Color(0xFFB91C1C),
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Success message (e.g. registration success awaiting confirmation)
            if (authState is AuthState.Success) {
                Surface(
                    color = Color(0xFFF0FDF4),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.CheckCircle,
                            contentDescription = null,
                            tint = Color(0xFF16A34A),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = authState.message,
                            color = Color(0xFF15803D),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            // Registration specific field: Full Name
            if (selectedTab == 1) {
                OutlinedTextField(
                    value = fullName,
                    onValueChange = {
                        fullName = it
                        localValidationMsg = null
                    },
                    label = { Text("पूरा नाम (Full Name)") },
                    placeholder = { Text("उदा: बिमल भण्डारी") },
                    leadingIcon = {
                        Icon(imageVector = Icons.Outlined.Person, contentDescription = null, tint = Color(0xFF94A3B8))
                    },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp)
                        .testTag("fullname_input"),
                    shape = RoundedCornerShape(12.dp)
                )
            }

            // Email Field
            OutlinedTextField(
                value = email,
                onValueChange = {
                    email = it
                    localValidationMsg = null
                },
                label = { Text("इमेल ठेगाना (Email)") },
                placeholder = { Text("user@gmail.com") },
                leadingIcon = {
                    Icon(imageVector = Icons.Outlined.Email, contentDescription = null, tint = Color(0xFF94A3B8))
                },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp)
                    .testTag("email_input"),
                shape = RoundedCornerShape(12.dp)
            )

            // Password Field
            OutlinedTextField(
                value = password,
                onValueChange = {
                    password = it
                    localValidationMsg = null
                },
                label = { Text("पासवर्ड (Password)") },
                placeholder = { Text("कम्तिमा ६ अक्षर") },
                leadingIcon = {
                    Icon(imageVector = Icons.Outlined.Lock, contentDescription = null, tint = Color(0xFF94A3B8))
                },
                trailingIcon = {
                    IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                        Icon(
                            imageVector = if (isPasswordVisible) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                            contentDescription = if (isPasswordVisible) "Hide password" else "Show password",
                            tint = Color(0xFF94A3B8)
                        )
                    }
                },
                visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp)
                    .testTag("password_input"),
                shape = RoundedCornerShape(12.dp)
            )

            // Confirm Password Field (only for register)
            if (selectedTab == 1) {
                OutlinedTextField(
                    value = confirmPassword,
                    onValueChange = {
                        confirmPassword = it
                        localValidationMsg = null
                    },
                    label = { Text("पासवर्ड पुष्टि (Confirm Password)") },
                    placeholder = { Text("पासवर्ड पुनः लेख्नुहोस्") },
                    leadingIcon = {
                        Icon(imageVector = Icons.Outlined.Lock, contentDescription = null, tint = Color(0xFF94A3B8))
                    },
                    visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp)
                        .testTag("confirm_password_input"),
                    shape = RoundedCornerShape(12.dp)
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Action Button
            val isLoading = authState is AuthState.Loading
            Button(
                onClick = {
                    val cleanEmail = email.trim()
                    if (cleanEmail.isEmpty()) {
                        localValidationMsg = "कृपया इमेल ठेगाना प्रविष्ट गर्नुहोस्।"
                        return@Button
                    }
                    if (!cleanEmail.contains("@") || !cleanEmail.contains(".")) {
                        localValidationMsg = "कृपया मान्य इमेल ठेगाना लेख्नुहोस्।"
                        return@Button
                    }
                    if (password.length < 6) {
                        localValidationMsg = "पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ।"
                        return@Button
                    }

                    if (selectedTab == 1) {
                        if (fullName.trim().isEmpty()) {
                            localValidationMsg = "कृपया पूरा नाम लेख्नुहोस्।"
                            return@Button
                        }
                        if (password != confirmPassword) {
                            localValidationMsg = "पासवर्डहरू मेल खाएनन्।"
                            return@Button
                        }
                        onRegisterClick(fullName.trim(), cleanEmail, password)
                    } else {
                        onLoginClick(cleanEmail, password)
                    }
                },
                enabled = !isLoading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .testTag(if (selectedTab == 0) "login_submit_button" else "register_submit_button"),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = NepalCrimson)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("कृपया पर्खनुहोस्...")
                } else if (selectedTab == 0) {
                    Icon(imageVector = Icons.Filled.Login, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("लगइन गर्नुहोस्", fontWeight = FontWeight.Bold)
                } else {
                    Icon(imageVector = Icons.Filled.PersonAdd, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("खाता दर्ता गर्नुहोस्", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
