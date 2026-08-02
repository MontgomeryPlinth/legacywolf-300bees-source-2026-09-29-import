package com.legacywolf.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class LegacyWolfProtectionService : Service() {
  override fun onCreate() {
    super.onCreate()
    val manager = getSystemService(NotificationManager::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      manager.createNotificationChannel(NotificationChannel(CHANNEL_ID, "Legacy Wolf protection", NotificationManager.IMPORTANCE_LOW).apply {
        description = "Keeps Motion Timer protection active"
        setShowBadge(false)
      })
    }
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val notification = NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setContentTitle("Legacy Wolf protection is active")
      .setContentText("Motion Timer signals are being monitored.")
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setCategory(NotificationCompat.CATEGORY_SERVICE)
      .build()
    startForeground(NOTIFICATION_ID, notification)
    return START_STICKY
  }

  override fun onBind(intent: Intent?): IBinder? = null

  companion object {
    const val CHANNEL_ID = "legacy_wolf_protection"
    const val NOTIFICATION_ID = 2401
  }
}
