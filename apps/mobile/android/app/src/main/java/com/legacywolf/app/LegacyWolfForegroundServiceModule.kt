package com.legacywolf.app

import android.content.Intent
import android.os.Build
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class LegacyWolfForegroundServiceModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "LegacyWolfForegroundService"

  @ReactMethod fun start() {
    val intent = Intent(context, LegacyWolfProtectionService::class.java)
    ContextCompat.startForegroundService(context, intent)
  }

  @ReactMethod fun stop() {
    context.stopService(Intent(context, LegacyWolfProtectionService::class.java))
  }
}
