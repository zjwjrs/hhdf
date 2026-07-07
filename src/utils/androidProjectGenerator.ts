import JSZip from 'jszip';
import { WeightLog, UserProfile } from '../types';

export async function generateAndroidProjectZip(logs: WeightLog[], profile: UserProfile): Promise<Blob> {
  const zip = new JSZip();

  // 1. root build.gradle
  zip.file("build.gradle", `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`);

  // 2. settings.gradle
  zip.file("settings.gradle", `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "ChenJinglinWeightTracker"
include ':app'
`);

  // 3. gradle.properties
  zip.file("gradle.properties", `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
`);

  // 4. gradle/wrapper/gradle-wrapper.properties
  zip.file("gradle/wrapper/gradle-wrapper.properties", `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`);

  // 5. gradle libs.versions.toml
  zip.file("gradle/libs.versions.toml", `[versions]
agp = "8.2.2"
kotlin = "1.9.22"
coreKtx = "1.12.0"
lifecycleRuntimeKtx = "2.7.0"
activityCompose = "1.8.2"
composeBom = "2023.10.01"
gson = "2.10.1"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-ui-test-manifest = { group = "androidx.compose.ui", name = "ui-test-manifest" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
gson = { group = "com.google.code.gson", name = "gson", version.ref = "gson" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
`);

  // 6. app/build.gradle
  zip.file("app/build.gradle", `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace 'com.chenjinglin.weighttracker'
    compileSdk 34

    defaultConfig {
        applicationId "com.chenjinglin.weighttracker"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary true
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
    buildFeatures {
        compose true
    }
    composeOptions {
        kotlinCompilerExtensionVersion '1.5.8'
    }
    packaging {
        resources {
            excludes += '/META-INF/{AL2.0,LGPL2.1}'
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime-ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui-graphics)
    implementation(libs.androidx.ui-tooling-preview)
    implementation(libs.androidx.material3)
    implementation(libs.gson)
    
    debugImplementation(libs.androidx.ui-tooling)
    debugImplementation(libs.androidx.ui-test-manifest)
}
`);

  // 7. AndroidManifest.xml
  zip.file("app/src/main/AndroidManifest.xml", `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="陈静琳的每日体重记录"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ChenJinglinWeightTracker">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.ChenJinglinWeightTracker">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`);

  // 8. res/values/themes.xml
  zip.file("app/src/main/res/values/themes.xml", `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.ChenJinglinWeightTracker" parent="android:Theme.Material.Light.NoActionBar" />
</resources>
`);

  // Serialize current weight logs as JSON to seed the Android app directly with the user's data!
  const seededLogsJson = JSON.stringify(logs.map(l => ({
    id: l.id,
    date: l.date,
    weight: l.weight,
    mood: l.mood,
    notes: l.notes,
    time: l.time
  })));

  // 9. MainActivity.kt containing fully-featured Jetpack Compose Weight Tracker App
  zip.file("app/src/main/java/com/chenjinglin/weighttracker/MainActivity.kt", `package com.chenjinglin.weighttracker

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.text.SimpleDateFormat
import java.util.*

// Model definitions
data class WeightLog(
    val id: String, // "YYYY-MM-DD"
    val date: String,
    val weight: Float,
    val mood: String,
    val notes: String,
    val time: String
)

class MainActivity : ComponentActivity() {
    private val PREFS_NAME = "WeightPrefs"
    private val KEY_LOGS = "WeightLogs"
    private val KEY_HEIGHT = "UserHeight"
    private val KEY_TARGET = "TargetWeight"
    
    private val gson = Gson()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Load initial data
        val sharedPrefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val savedLogsJson = sharedPrefs.getString(KEY_LOGS, null)
        
        val initialLogs = if (savedLogsJson != null) {
            try {
                val type = object : TypeToken<List<WeightLog>>() {}.type
                gson.fromJson<List<WeightLog>>(savedLogsJson, type)
            } catch (e: Exception) {
                getSeededLogs()
            }
        } else {
            getSeededLogs()
        }

        val savedHeight = sharedPrefs.getFloat(KEY_HEIGHT, ${profile.height}f)
        val savedTarget = sharedPrefs.getFloat(KEY_TARGET, ${profile.targetWeight}f)

        setContent {
            WeightTrackerApp(
                initialLogs = initialLogs,
                initialHeight = savedHeight,
                initialTarget = savedTarget,
                onSaveData = { logs, height, target ->
                    sharedPrefs.edit().apply {
                        putString(KEY_LOGS, gson.toJson(logs))
                        putFloat(KEY_HEIGHT, height)
                        putFloat(KEY_TARGET, target)
                        apply()
                    }
                }
            )
        }
    }

    private fun getSeededLogs(): List<WeightLog> {
        val type = object : TypeToken<List<WeightLog>>() {}.type
        return try {
            gson.fromJson("""${seededLogsJson}""", type)
        } catch (e: Exception) {
            emptyList()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WeightTrackerApp(
    initialLogs: List<WeightLog>,
    initialHeight: Float,
    initialTarget: Float,
    onSaveData: (List<WeightLog>, Float, Float) -> Unit
) {
    var logs by remember { mutableStateOf(initialLogs.sortedByDescending { it.date }) }
    var height by remember { mutableStateOf(initialHeight) }
    var targetWeight by remember { mutableStateOf(initialTarget) }

    // Navigation state
    var selectedTab by remember { mutableStateOf("dashboard") } // dashboard, logs, settings
    var showLogDialogForDate by remember { mutableStateOf<String?>(null) }
    var editingLog by remember { mutableStateOf<WeightLog?>(null) }
    var showProfileDialog by remember { mutableStateOf(false) }

    // Save callback
    LaunchedEffect(logs, height, targetWeight) {
        onSaveData(logs, height, targetWeight)
    }

    // Colors Theme (Soft Elegant Pink / Coral Accent for Chen Jinglin)
    val PrimaryColor = Color(0xFFFF6B81)
    val SecondaryColor = Color(0xFFFFEDF0)
    val BackgroundColor = Color(0xFFFAFAFC)
    val TextDark = Color(0xFF2D3436)
    val TextMuted = Color(0xFF747D8C)

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "陈静琳的每日体重记录",
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 18.sp
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PrimaryColor
                ),
                actions = {
                    IconButton(onClick = { showProfileDialog = true }) {
                        Icon(Icons.Default.Settings, contentDescription = "设置", tint = Color.White)
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = selectedTab == "dashboard",
                    onClick = { selectedTab = "dashboard" },
                    icon = { Icon(Icons.Default.DateRange, contentDescription = "总览") },
                    label = { Text("总览宫格") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PrimaryColor,
                        selectedTextColor = PrimaryColor,
                        indicatorColor = SecondaryColor
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == "logs",
                    onClick = { selectedTab = "logs" },
                    icon = { Icon(Icons.Default.List, contentDescription = "历史") },
                    label = { Text("体重列表") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PrimaryColor,
                        selectedTextColor = PrimaryColor,
                        indicatorColor = SecondaryColor
                    )
                )
            }
        },
        containerColor = BackgroundColor
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (selectedTab) {
                "dashboard" -> DashboardScreen(
                    logs = logs,
                    height = height,
                    targetWeight = targetWeight,
                    onDayClick = { date ->
                        val existing = logs.find { it.date == date }
                        if (existing != null) {
                            editingLog = existing
                        } else {
                            // Pre-fill date
                            val sdf = SimpleDateFormat("HH:mm", Locale.getDefault())
                            editingLog = WeightLog(
                                id = date,
                                date = date,
                                weight = if (logs.isNotEmpty()) logs.first().weight else 50f,
                                mood = "😊",
                                notes = "",
                                time = sdf.format(Date())
                            )
                        }
                        showLogDialogForDate = date
                    },
                    primaryColor = PrimaryColor,
                    secondaryColor = SecondaryColor
                )
                "logs" -> LogsScreen(
                    logs = logs,
                    onEditLog = { log ->
                        editingLog = log
                        showLogDialogForDate = log.date
                    },
                    onDeleteLog = { log ->
                        logs = logs.filter { it.id != log.id }
                    },
                    primaryColor = PrimaryColor
                )
            }

            // Floating Add Action Button
            if (selectedTab == "dashboard") {
                FloatingActionButton(
                    onClick = {
                        val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                        val existing = logs.find { it.date == todayStr }
                        if (existing != null) {
                            editingLog = existing
                        } else {
                            val sdf = SimpleDateFormat("HH:mm", Locale.getDefault())
                            editingLog = WeightLog(
                                id = todayStr,
                                date = todayStr,
                                weight = if (logs.isNotEmpty()) logs.first().weight else 50f,
                                mood = "😊",
                                notes = "",
                                time = sdf.format(Date())
                            )
                        }
                        showLogDialogForDate = todayStr
                    },
                    containerColor = PrimaryColor,
                    contentColor = Color.White,
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(16.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "记录今日")
                }
            }
        }
    }

    // Profile Settings Dialog
    if (showProfileDialog) {
        var tempHeight by remember { mutableStateOf(height.toString()) }
        var tempTarget by remember { mutableStateOf(targetWeight.toString()) }

        AlertDialog(
            onDismissRequest = { showProfileDialog = false },
            title = { Text("陈静琳的个人参数", fontWeight = FontWeight.Bold, color = PrimaryColor) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = tempHeight,
                        onValueChange = { tempHeight = it },
                        label = { Text("身高 (cm)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = tempTarget,
                        onValueChange = { tempTarget = it },
                        label = { Text("目标体重 (kg)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val hVal = tempHeight.toFloatOrNull() ?: height
                        val tVal = tempTarget.toFloatOrNull() ?: targetWeight
                        height = hVal
                        targetWeight = tVal
                        showProfileDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryColor)
                ) {
                    Text("保存")
                }
            },
            dismissButton = {
                TextButton(onClick = { showProfileDialog = false }) {
                    Text("取消", color = TextMuted)
                }
            }
        )
    }

    // Weight Logging Dialog
    editingLog?.let { currentEdit ->
        Dialog(onDismissRequest = { editingLog = null }) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp)
            ) {
                var weightInput by remember { mutableStateOf(currentEdit.weight.toString()) }
                var selectedMood by remember { mutableStateOf(currentEdit.mood) }
                var notesInput by remember { mutableStateOf(currentEdit.notes) }
                
                Column(
                    modifier = Modifier
                        .padding(20.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "记录体重 (日期: \${currentEdit.date})",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryColor
                    )

                    OutlinedTextField(
                        value = weightInput,
                        onValueChange = { weightInput = it },
                        label = { Text("当前体重 (kg)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.fillMaxWidth(),
                        leadingIcon = { Icon(Icons.Default.Star, contentDescription = null, tint = PrimaryColor) }
                    )

                    // Mood selector
                    Text("今日心情", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                    val moods = listOf("😊", "🤩", "😐", "😴", "🍕", "🔥", "😢", "💪")
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        moods.forEach { m ->
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (selectedMood == m) SecondaryColor else Color.Transparent)
                                    .border(
                                        width = 1.dp,
                                        color = if (selectedMood == m) PrimaryColor else Color.LightGray.copy(alpha = 0.5f),
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                    .clickable { selectedMood = m },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(m, fontSize = 20.sp)
                            }
                        }
                    }

                    OutlinedTextField(
                        value = notesInput,
                        onValueChange = { notesInput = it },
                        label = { Text("备注 / 碎碎念") },
                        placeholder = { Text("今天有坚持运动或控制饮食吗？") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(
                            onClick = { editingLog = null }
                        ) {
                            Text("取消", color = TextMuted)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = {
                                val wVal = weightInput.toFloatOrNull() ?: currentEdit.weight
                                val newLog = currentEdit.copy(
                                    weight = wVal,
                                    mood = selectedMood,
                                    notes = notesInput
                                )
                                // Save
                                logs = (logs.filter { it.date != currentEdit.date } + newLog).sortedByDescending { it.date }
                                editingLog = null
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryColor)
                        ) {
                            Text("保存记录")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DashboardScreen(
    logs: List<WeightLog>,
    height: Float,
    targetWeight: Float,
    onDayClick: (String) -> Unit,
    primaryColor: Color,
    secondaryColor: Color
) {
    val scrollState = rememberScrollState()
    
    // Calculate current status
    val latestLog = logs.firstOrNull()
    val currentWeight = latestLog?.weight ?: 50f
    
    // BMI
    val heightInM = height / 100f
    val bmi = if (heightInM > 0) currentWeight / (heightInM * heightInM) else 0f
    val bmiCategory = when {
        bmi < 18.5f -> "偏瘦"
        bmi < 24f -> "正常"
        bmi < 28f -> "偏胖"
        else -> "肥胖"
    }
    val bmiColor = when {
        bmi < 18.5f -> Color(0xFF3498DB)
        bmi < 24f -> Color(0xFF2ECC71)
        bmi < 28f -> Color(0xFFE67E22)
        else -> Color(0xFFE74C3C)
    }

    // Weight delta
    val weightDelta = if (logs.size >= 2) {
        currentWeight - logs[1].weight
    } else {
        0f
    }

    // Weight to Target
    val weightToTarget = currentWeight - targetWeight

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Bento Dashboard Cards
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Current Weight Card
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("当前体重", color = Color.Gray, fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(
                            text = String.format("%.1f", currentWeight),
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = primaryColor
                        )
                        Spacer(modifier = Modifier.width(2.dp))
                        Text("kg", fontSize = 12.sp, color = Color.Gray, modifier = Modifier.padding(bottom = 4.dp))
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = if (weightDelta <= 0) Icons.Default.KeyboardArrowDown else Icons.Default.KeyboardArrowUp,
                            contentDescription = null,
                            tint = if (weightDelta <= 0) Color(0xFF2ECC71) else Color(0xFFE74C3C),
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = String.format("%.1f kg (较上次)", Math.abs(weightDelta)),
                            fontSize = 11.sp,
                            color = if (weightDelta <= 0) Color(0xFF2ECC71) else Color(0xFFE74C3C)
                        )
                    }
                }
            }

            // BMI Status Card
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("BMI 指数", color = Color.Gray, fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = String.format("%.1f", bmi),
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(bmiColor.copy(alpha = 0.15f))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(bmiCategory, color = bmiColor, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Target progress bento
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("目标进度 (目标: \${targetWeight} kg)", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = TextDark)
                    Text(
                        text = if (weightToTarget <= 0) "已达成! 🎉" else "还差 \${String.format("%.1f", weightToTarget)} kg",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = primaryColor
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                // Linear progress
                val startWeight = if (logs.isNotEmpty()) logs.last().weight else 55f
                val progress = if (startWeight != targetWeight) {
                    val numer = startWeight - currentWeight
                    val denom = startWeight - targetWeight
                    if (denom > 0) (numer / denom).coerceIn(0f, 1f) else 1f
                } else {
                    1f
                }
                LinearProgressIndicator(
                    progress = progress,
                    color = primaryColor,
                    trackColor = secondaryColor,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp))
                )
            }
        }

        // 2. Trend Line Chart (Canvas-based)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("体重趋势分析", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)
                Spacer(modifier = Modifier.height(12.dp))
                
                if (logs.size < 2) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("记录 2 次以上体重即可生成趋势图 😊", color = TextMuted, fontSize = 13.sp)
                    }
                } else {
                    // Show custom Canvas chart
                    val chartLogs = logs.take(7).reversed() // Take last 7 records, chronologically
                    val minW = chartLogs.minOf { it.weight } - 0.5f
                    val maxW = chartLogs.maxOf { it.weight } + 0.5f
                    val range = if (maxW - minW > 0) maxW - minW else 1f

                    Canvas(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp)
                    ) {
                        val width = size.width
                        val height = size.height
                        val pointsCount = chartLogs.size
                        val stepX = width / (pointsCount - 1).coerceAtLeast(1)

                        val points = chartLogs.mapIndexed { idx, log ->
                            val x = idx * stepX
                            val y = height - ((log.weight - minW) / range * (height - 40.dp.toPx()) + 20.dp.toPx())
                            Offset(x, y)
                        }

                        // Draw area under line
                        val areaPath = Path().apply {
                            moveTo(points.first().x, height)
                            points.forEach { point ->
                                lineTo(point.x, point.y)
                            }
                            lineTo(points.last().x, height)
                            close()
                        }
                        drawPath(
                            path = areaPath,
                            brush = Brush.verticalGradient(
                                colors = listOf(primaryColor.copy(alpha = 0.25f), Color.Transparent),
                                startY = 0f,
                                endY = height
                            )
                        )

                        // Draw line
                        val linePath = Path().apply {
                            moveTo(points.first().x, points.first().y)
                            for (i in 1 until points.size) {
                                lineTo(points[i].x, points[i].y)
                            }
                        }
                        drawPath(
                            path = linePath,
                            color = primaryColor,
                            style = Stroke(width = 3.dp.toPx())
                        )

                        // Draw dots and text labels
                        points.forEachIndexed { index, point ->
                            drawCircle(
                                color = primaryColor,
                                radius = 4.dp.toPx(),
                                center = point
                            )
                            drawCircle(
                                color = Color.White,
                                radius = 2.dp.toPx(),
                                center = point
                            )
                        }
                    }
                    
                    // X-axis labels
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        chartLogs.forEach { log ->
                            val displayDate = try {
                                log.date.substring(5) // MM-DD
                            } catch (e: Exception) {
                                log.date
                            }
                            Text(displayDate, fontSize = 10.sp, color = TextMuted)
                        }
                    }
                }
            }
        }

        // 3. Overview Grid (日历宫格)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("日历宫格排列总览", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)
                    Text("点击宫格补录/查看", fontSize = 11.sp, color = primaryColor)
                }
                Spacer(modifier = Modifier.height(12.dp))

                // Render a grid of the current month
                val calendar = Calendar.getInstance()
                val currentMonth = calendar.get(Calendar.MONTH)
                val currentMonthName = SimpleDateFormat("yyyy年MM月", Locale.getDefault()).format(calendar.time)
                
                calendar.set(Calendar.DAY_OF_MONTH, 1)
                val firstDayOfWeek = calendar.get(Calendar.DAY_OF_WEEK) - 1 // 0=Sunday, 1=Monday ...
                val daysInMonth = calendar.getActualMaximum(Calendar.DAY_OF_MONTH)
                
                Text(currentMonthName, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = TextDark, modifier = Modifier.padding(bottom = 8.dp))

                // Days headers
                val daysOfWeek = listOf("日", "一", "二", "三", "四", "五", "六")
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    daysOfWeek.forEach { day ->
                        Text(
                            text = day,
                            modifier = Modifier.weight(1f),
                            textAlign = TextAlign.Center,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextMuted
                        )
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))

                // Monthly Grid Cells
                val totalCells = (firstDayOfWeek + daysInMonth)
                val rows = (totalCells + 6) / 7

                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    for (r in 0 until rows) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            for (c in 0..6) {
                                val cellIndex = r * 7 + c
                                val dayNum = cellIndex - firstDayOfWeek + 1
                                
                                if (dayNum in 1..daysInMonth) {
                                    val dateStr = String.format(
                                        Locale.getDefault(),
                                        "%04d-%02d-%02d",
                                        calendar.get(Calendar.YEAR),
                                        currentMonth + 1,
                                        dayNum
                                    )
                                    val logForDay = logs.find { it.date == dateStr }

                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .aspectRatio(1f)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(
                                                if (logForDay != null) primaryColor.copy(alpha = 0.12f)
                                                else Color(0xFFF1F2F6)
                                            )
                                            .border(
                                                width = 1.dp,
                                                color = if (logForDay != null) primaryColor.copy(alpha = 0.5f) else Color.Transparent,
                                                shape = RoundedCornerShape(8.dp)
                                            )
                                            .clickable { onDayClick(dateStr) },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Column(
                                            horizontalAlignment = Alignment.CenterHorizontally,
                                            verticalArrangement = Arrangement.Center,
                                            modifier = Modifier.padding(2.dp)
                                        ) {
                                            Text(
                                                text = dayNum.toString(),
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (logForDay != null) primaryColor else TextDark
                                            )
                                            if (logForDay != null) {
                                                Text(
                                                    text = String.format("%.1f", logForDay.weight),
                                                    fontSize = 9.sp,
                                                    color = primaryColor,
                                                    fontWeight = FontWeight.SemiBold
                                                )
                                                Text(
                                                    text = logForDay.mood,
                                                    fontSize = 9.sp
                                                )
                                            }
                                        }
                                    }
                                } else {
                                    // Empty Spacer cell
                                    Box(modifier = Modifier.weight(1f))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LogsScreen(
    logs: List<WeightLog>,
    onEditLog: (WeightLog) -> Unit,
    onDeleteLog: (WeightLog) -> Unit,
    primaryColor: Color
) {
    if (logs.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text("陈静琳还没有任何体重记录，快点击主页的加号开始记录吧！🌸", color = Color.Gray, modifier = Modifier.padding(32.dp), textAlign = TextAlign.Center)
        }
    } else {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(logs.size) { index ->
                val log = logs[index]
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(log.mood, fontSize = 20.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(log.date, fontWeight = FontWeight.Bold, color = Color(0xFF2D3436))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(log.time, fontSize = 12.sp, color = Color.Gray)
                            }
                            if (log.notes.isNotEmpty()) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = log.notes,
                                    fontSize = 12.sp,
                                    color = Color.Gray,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                        
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = String.format("%.1f", log.weight),
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold,
                                color = primaryColor
                            )
                            Spacer(modifier = Modifier.width(2.dp))
                            Text("kg", fontSize = 12.sp, color = Color.Gray)
                            
                            Spacer(modifier = Modifier.width(16.dp))
                            
                            IconButton(onClick = { onEditLog(log) }) {
                                Icon(Icons.Default.Edit, contentDescription = "编辑", tint = Color.Gray, modifier = Modifier.size(20.dp))
                            }
                            IconButton(onClick = { onDeleteLog(log) }) {
                                Icon(Icons.Default.Delete, contentDescription = "删除", tint = Color(0xFFE74C3C), modifier = Modifier.size(20.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}
`);

  // 10. app-level proguard-rules.pro
  zip.file("app/proguard-rules.pro", `# Add project specific ProGuard rules here.
# You can control what code gets kept or obfuscated during release builds.
`);

  // 11. README instructions inside the ZIP so the user knows exactly how to load it in Android Studio
  zip.file("README_ANDROID_STUDIO.txt", `===========================================================
陈静琳的每日体重记录 (Android Studio Project)
===========================================================

恭喜！这是为您生成的、可直接在 Android Studio 中打开运行的完整的 Jetpack Compose 移动端安卓 App 工程。

如何导入并运行：
1. 解压本 ZIP 压缩包到一个非中文、无空格的本地目录中。
2. 打开 Android Studio (建议使用 2023.1.1 (Iguana) 或更高版本)。
3. 选择 "Open" (打开)，并选择解压出来的根目录 (即含有 settings.gradle 的文件夹)。
4. 等待 Android Studio 自动下载 Gradle 依赖并建立索引 (首次建立索引可能需要几分钟，请保持联网)。
5. 插入安卓手机并开启 USB 调试，或打开虚拟机 (AVD)。
6. 点击右上角的运行按钮 "Run" (绿色三角形图标)，App 就会安装到您的设备中！

应用特点：
- 采用最新的 Android M3 (Material 3) 规范设计。
- 使用纯 Jetpack Compose (非旧版 XML) 进行声明式 UI 构建。
- 本地轻量化 SharedPreferences 存储，安全，不占用多余存储且具有极速响应速度。
- 内含自定义 Canvas 体重趋势线形图。
- 日历宫格总览，点击任意网格即可查看详情或补录对应日期的体重。
- 已直接和您在网页端记录的数据进行了同步，初始安装即包含您的所有记录！

陈静琳，加油，祝你早日达成理想目标体重！✨
===========================================================
`);

  return await zip.generateAsync({ type: "blob" });
}
