const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

const PACKAGE = "com.legacywolf.app";
const source = (name) => path.join("android", "app", "src", "main", "java", ...PACKAGE.split("."), name);

const service = `package ${PACKAGE}

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
`;

const nativeModule = `package ${PACKAGE}

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
`;

const reactPackage = `package ${PACKAGE}

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class LegacyWolfForegroundServicePackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(LegacyWolfForegroundServiceModule(context))
  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
`;

module.exports = function withLegacyWolfForegroundService(config) {
  config = withAndroidManifest(config, (mod) => {
    const app = mod.modResults.manifest.application[0];
    app.service = app.service || [];
    if (!app.service.some((item) => item.$?.["android:name"] === ".LegacyWolfProtectionService")) {
      app.service.push({ $: { "android:name": ".LegacyWolfProtectionService", "android:enabled": "true", "android:exported": "false", "android:foregroundServiceType": "health" } });
    }
    return mod;
  });
  return withDangerousMod(config, ["android", async (mod) => {
    const root = mod.modRequest.projectRoot;
    const files = [
      [source("LegacyWolfProtectionService.kt"), service],
      [source("LegacyWolfForegroundServiceModule.kt"), nativeModule],
      [source("LegacyWolfForegroundServicePackage.kt"), reactPackage],
    ];
    for (const [relative, contents] of files) {
      const target = path.join(root, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, contents);
    }
    const main = path.join(root, source("MainApplication.kt"));
    let text = fs.readFileSync(main, "utf8");
    if (!text.includes("LegacyWolfForegroundServicePackage")) {
      text = text.replace("PackageList(this).packages.apply {", "PackageList(this).packages.apply {\n              add(LegacyWolfForegroundServicePackage())");
      fs.writeFileSync(main, text);
    }
    return mod;
  }]);
};
