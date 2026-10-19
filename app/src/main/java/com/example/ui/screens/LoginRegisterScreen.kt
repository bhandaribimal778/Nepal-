package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.model.AuthState
import com.example.ui.theme.NepalCrimson
import com.example.ui.theme.NepalNavy

@Composable
fun LoginRegisterScreen(
    authState: AuthState,
    onLoginClick: (String, String) -> Unit,
    onRegisterClick: (String, String, String) -> Unit,
    onGuestClick: () -> Unit,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var authMode by remember { mutableStateOf("none") }
    var emailInput by remember { mutableStateOf("") }
    var passwordInput by remember { mutableStateOf("") }
    var nameInput by remember { mutableStateOf("") }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
    ) {
        // Fullscreen Himalayas Background Image
        AsyncImage(
            model = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
            contentDescription = "Himalayas Background",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )

        // Gradient Dark Overlay Scrim
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF0F172A).copy(alpha = 0.6f),
                            Color(0xFF0F172A).copy(alpha = 0.85f),
                            Color(0xFF0B1120).copy(alpha = 0.98f)
                        )
                    )
                )
        )

        // Top Back Button
        IconButton(
            onClick = onBackClick,
            modifier = Modifier
                .statusBarsPadding()
                .padding(12.dp)
                .align(Alignment.TopStart)
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "पछाडि",
                tint = Color.White
            )
        }

        // Main Center Content (Screen 8 style)
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .align(Alignment.Center),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Brand Logo: Red rounded square with Nepal flag
            Box(
                modifier = Modifier
                    .size(68.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(NepalCrimson),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "🇳🇵",
                    fontSize = 36.sp
                )
            }

            // Titles
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "News Nepal",
                    fontWeight = FontWeight.Black,
                    fontSize = 28.sp,
                    color = Color.White,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = "नेपाल न्यूज",
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = Color.White.copy(alpha = 0.9f)
                )
                Text(
                    text = "सधैँ तपाईंको साथमा, ताजा खबर, सही खबर",
                    fontSize = 12.5.sp,
                    color = Color.White.copy(alpha = 0.8f)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Auth Input Form if expanded
            if (authMode == "login") {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.95f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "ईमेल मार्फत लगइन गर्नुहोस्",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = NepalNavy
                        )
                        OutlinedTextField(
                            value = emailInput,
                            onValueChange = { emailInput = it },
                            label = { Text("ईमेल ठेगाना") },
                            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = NepalCrimson) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = passwordInput,
                            onValueChange = { passwordInput = it },
                            label = { Text("पासवर्ड") },
                            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = NepalCrimson) },
                            visualTransformation = PasswordVisualTransformation(),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Button(
                            onClick = { onLoginClick(emailInput.trim(), passwordInput) },
                            colors = ButtonDefaults.buttonColors(containerColor = NepalCrimson),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("लगइन", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            } else if (authMode == "register") {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.95f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "नयाँ खाता दर्ता गर्नुहोस्",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = NepalNavy
                        )
                        OutlinedTextField(
                            value = nameInput,
                            onValueChange = { nameInput = it },
                            label = { Text("पूरा नाम") },
                            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = NepalCrimson) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = emailInput,
                            onValueChange = { emailInput = it },
                            label = { Text("ईमेल ठेगाना") },
                            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = NepalCrimson) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = passwordInput,
                            onValueChange = { passwordInput = it },
                            label = { Text("पासवर्ड") },
                            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = NepalCrimson) },
                            visualTransformation = PasswordVisualTransformation(),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Button(
                            onClick = { onRegisterClick(nameInput.trim(), emailInput.trim(), passwordInput) },
                            colors = ButtonDefaults.buttonColors(containerColor = NepalCrimson),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("खाता खोल्नुहोस्", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Buttons Stack (Screen 8 style)
            // 1. Red Button: "ईमेल मार्फत लगइन"
            Button(
                onClick = { authMode = if (authMode == "login") "none" else "login" },
                colors = ButtonDefaults.buttonColors(containerColor = NepalCrimson),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                Text(
                    text = "ईमेल मार्फत लगइन",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = Color.White
                )
            }

            // 2. White Button: Google मार्फत लगइन
            Button(
                onClick = onGuestClick,
                colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "G",
                        fontWeight = FontWeight.Black,
                        fontSize = 18.sp,
                        color = Color(0xFF4285F4)
                    )
                    Text(
                        text = "Google मार्फत लगइन",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = Color(0xFF1E293B)
                    )
                }
            }

            // 3. Dark Translucent Button: "दर्ता गर्नुहोस्"
            OutlinedButton(
                onClick = { authMode = if (authMode == "register") "none" else "register" },
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.2.dp, Color.White.copy(alpha = 0.8f)),
                colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.Black.copy(alpha = 0.4f)),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                Text(
                    text = "दर्ता गर्नुहोस्",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            // 4. Bottom Link: "अहिले नै अतिथि मोडमा हेर्नुहोस्"
            Text(
                text = "अहिले नै अतिथि मोडमा हेर्नुहोस्",
                color = Color.White.copy(alpha = 0.75f),
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier
                    .clickable { onGuestClick() }
                    .padding(8.dp)
            )
        }
    }
}
