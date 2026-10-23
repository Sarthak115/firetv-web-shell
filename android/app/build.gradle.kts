import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Everything app-specific comes from local.properties (see local.properties.example),
// so the template itself never needs editing to ship your own web app.
val props = Properties().apply {
    val f = rootProject.file("local.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}
fun prop(key: String, default: String) = props.getProperty(key, default).trim()

val shellAppId = prop("shell.appId", "dev.firetvwebshell.demo")
val shellAppName = prop("shell.appName", "Web Shell")
val shellDevUrl = prop("shell.devUrl", "http://192.168.1.10:3000/example/")
val shellReleaseUrl = prop("shell.releaseUrl", "https://example.com/")

android {
    namespace = "dev.firetvwebshell"
    compileSdk = 35

    defaultConfig {
        applicationId = shellAppId
        minSdk = 22 // Fire OS 5 (Fire TV Stick 2nd gen) and up
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        manifestPlaceholders["appName"] = shellAppName
    }

    buildTypes {
        debug {
            buildConfigField("String", "WEB_URL", "\"$shellDevUrl\"")
            manifestPlaceholders["usesCleartext"] = "true" // LAN dev server over plain HTTP
        }
        release {
            isMinifyEnabled = false
            buildConfigField("String", "WEB_URL", "\"$shellReleaseUrl\"")
            manifestPlaceholders["usesCleartext"] = "false"
            // Debug-signed so it can be sideloaded with `adb install`.
            // Use your own signing config before submitting to the Amazon Appstore.
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}
