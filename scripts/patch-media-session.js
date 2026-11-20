// ShayariVerse X (SVX) — Native MediaSession Silent, Crash-Proof & Interactive Patch
// Ensures:
// 1. ZERO notification sound / beep / chime / vibration on track changes (IMPORTANCE_LOW, onlyAlertOnce, null sound)
// 2. Beautiful branded album artwork (R.drawable.svx_cover) instead of ugly generic MP3 disc/plate icon
// 3. 100% interactive lock screen and notification action buttons (Play, Pause, Next, Previous) using explicit Service PendingIntents
// 4. Android 14 FOREGROUND_SERVICE_MEDIA_PLAYBACK compliance
// 5. Zero synchronous network blocking on Android main UI thread

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const pluginDir = path.join(ROOT_DIR, 'node_modules', '@jofr', 'capacitor-media-session', 'android', 'src', 'main');

export function applyMediaSessionPatch() {
  const serviceJavaPath = path.join(pluginDir, 'java', 'io', 'github', 'jofr', 'capacitor', 'mediasessionplugin', 'MediaSessionService.java');
  const pluginJavaPath = path.join(pluginDir, 'java', 'io', 'github', 'jofr', 'capacitor', 'mediasessionplugin', 'MediaSessionPlugin.java');
  const pluginManifestPath = path.join(pluginDir, 'AndroidManifest.xml');

  if (!fs.existsSync(pluginDir)) {
    console.log('[SVX Patch] MediaSession plugin directory not found, skipping patch.');
    return;
  }

  // 1. Write enhanced MediaSessionService.java
  const serviceCode = `package io.github.jofr.capacitor.mediasessionplugin;

import android.annotation.SuppressLint;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.IBinder;
import android.os.Binder;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.media.session.MediaButtonReceiver;
import androidx.media.app.NotificationCompat.MediaStyle;

public class MediaSessionService extends Service {
    private static final String TAG = "MediaSessionService";
    private static final int NOTIFICATION_ID = 1;

    private MediaSessionCompat mediaSession;
    private PlaybackStateCompat.Builder playbackStateBuilder;
    private MediaMetadataCompat.Builder mediaMetadataBuilder;
    private NotificationManager notificationManager;
    private NotificationCompat.Builder notificationBuilder;
    private MediaStyle notificationStyle;

    private int playbackState = PlaybackStateCompat.STATE_NONE;
    private String title = "";
    private String artist = "";
    private String album = "";
    private Bitmap artwork = null;
    private long duration = 0;
    private long position = 0;
    private float playbackSpeed = 1.0F;

    private boolean possibleActionsUpdate = true;
    private boolean playbackStateUpdate = false;
    private boolean mediaMetadataUpdate = false;
    private boolean notificationUpdate = false;

    private MediaSessionPlugin plugin;
    private MediaSessionCallback callback;

    private final IBinder binder = new LocalBinder();

    public final class LocalBinder extends Binder {
        MediaSessionService getService() {
            return MediaSessionService.this;
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    @Override
    public boolean onUnbind(Intent intent) {
        this.destroy();
        return super.onUnbind(intent);
    }

    public void connectAndInitialize(MediaSessionPlugin plugin, Intent intent) {
        this.plugin = plugin;
        this.callback = new MediaSessionCallback(plugin);

        mediaSession = new MediaSessionCompat(this, "WebViewMediaSession");
        mediaSession.setCallback(this.callback);
        mediaSession.setActive(true);

        playbackStateBuilder = new PlaybackStateCompat.Builder()
                .setActions(
                    PlaybackStateCompat.ACTION_PLAY |
                    PlaybackStateCompat.ACTION_PAUSE |
                    PlaybackStateCompat.ACTION_PLAY_PAUSE |
                    PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
                    PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS |
                    PlaybackStateCompat.ACTION_STOP
                )
                .setState(PlaybackStateCompat.STATE_PAUSED, position, playbackSpeed);
        mediaSession.setPlaybackState(playbackStateBuilder.build());

        mediaMetadataBuilder = new MediaMetadataCompat.Builder()
                .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, duration);
        mediaSession.setMetadata(mediaMetadataBuilder.build());

        notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel("playback", "Playback", NotificationManager.IMPORTANCE_LOW);
            channel.setSound(null, null);
            channel.enableVibration(false);
            channel.setDescription("ShayariVerse X Silent Background Media Player");
            notificationManager.createNotificationChannel(channel);
        }

        int smallIconId = getResources().getIdentifier("ic_stat_music", "drawable", getPackageName());
        if (smallIconId == 0) {
            smallIconId = R.drawable.ic_baseline_volume_up_24;
        }

        notificationStyle = new MediaStyle().setMediaSession(mediaSession.getSessionToken());
        notificationBuilder = new NotificationCompat.Builder(this, "playback")
                .setStyle(notificationStyle)
                .setSmallIcon(smallIconId)
                .setContentIntent(PendingIntent.getActivity(getApplicationContext(), 0, intent, PendingIntent.FLAG_IMMUTABLE))
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOnlyAlertOnce(true)
                .setSound(null);

        loadDefaultArtwork();
        buildActions();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notificationBuilder.build(), ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIFICATION_ID, notificationBuilder.build());
        }
    }

    private void loadDefaultArtwork() {
        if (this.artwork == null) {
            try {
                int coverId = getResources().getIdentifier("svx_cover", "drawable", getPackageName());
                if (coverId == 0) {
                    coverId = getResources().getIdentifier("ic_launcher", "mipmap", getPackageName());
                }
                if (coverId != 0) {
                    this.artwork = BitmapFactory.decodeResource(getResources(), coverId);
                }
            } catch (Throwable ignored) {}
        }
    }

    @SuppressLint("RestrictedApi")
    private void buildActions() {
        if (notificationBuilder == null) return;
        notificationBuilder.mActions.clear();

        // 1. Previous Track Action
        Intent prevIntent = new Intent(this, MediaSessionService.class).setAction("ACTION_PREV");
        PendingIntent piPrev = PendingIntent.getService(this, 101, prevIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Action actionPrev = new NotificationCompat.Action(
                R.drawable.ic_baseline_skip_previous_24, "Previous", piPrev
        );

        // 2. Play / Pause Toggle Action
        NotificationCompat.Action actionPlayPause;
        if (playbackState == PlaybackStateCompat.STATE_PLAYING) {
            Intent pauseIntent = new Intent(this, MediaSessionService.class).setAction("ACTION_PAUSE");
            PendingIntent piPause = PendingIntent.getService(this, 102, pauseIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            actionPlayPause = new NotificationCompat.Action(
                    R.drawable.ic_baseline_pause_24, "Pause", piPause
            );
        } else {
            Intent playIntent = new Intent(this, MediaSessionService.class).setAction("ACTION_PLAY");
            PendingIntent piPlay = PendingIntent.getService(this, 103, playIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            actionPlayPause = new NotificationCompat.Action(
                    R.drawable.ic_baseline_play_arrow_24, "Play", piPlay
            );
        }

        // 3. Next Track Action
        Intent nextIntent = new Intent(this, MediaSessionService.class).setAction("ACTION_NEXT");
        PendingIntent piNext = PendingIntent.getService(this, 104, nextIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Action actionNext = new NotificationCompat.Action(
                R.drawable.ic_baseline_skip_next_24, "Next", piNext
        );

        notificationBuilder.addAction(actionPrev);
        notificationBuilder.addAction(actionPlayPause);
        notificationBuilder.addAction(actionNext);

        if (notificationStyle != null) {
            notificationStyle.setShowActionsInCompactView(0, 1, 2);
        }
    }

    public void destroy() {
        stopForeground(true);
        stopSelf();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            String act = intent.getAction();
            if ("ACTION_PLAY".equals(act)) {
                if (callback != null) callback.onPlay();
                if (plugin != null) plugin.actionCallback("play");
            } else if ("ACTION_PAUSE".equals(act)) {
                if (callback != null) callback.onPause();
                if (plugin != null) plugin.actionCallback("pause");
            } else if ("ACTION_NEXT".equals(act)) {
                if (callback != null) callback.onSkipToNext();
                if (plugin != null) plugin.actionCallback("nexttrack");
            } else if ("ACTION_PREV".equals(act)) {
                if (callback != null) callback.onSkipToPrevious();
                if (plugin != null) plugin.actionCallback("previoustrack");
            } else if ("ACTION_STOP".equals(act)) {
                if (callback != null) callback.onStop();
                if (plugin != null) plugin.actionCallback("stop");
            } else {
                MediaButtonReceiver.handleIntent(mediaSession, intent);
            }
        }
        return super.onStartCommand(intent, flags, startId);
    }

    public void setPlaybackState(int playbackState) {
        if (this.playbackState != playbackState) {
            this.playbackState = playbackState;
            playbackStateUpdate = true;
            possibleActionsUpdate = true;
        }
    }

    public void setTitle(String title) {
        if (!this.title.equals(title)) {
            this.title = title;
            mediaMetadataUpdate = true;
            notificationUpdate = true;
        }
    }

    public void setArtist(String artist) {
        if (!this.artist.equals(artist)) {
            this.artist = artist;
            mediaMetadataUpdate = true;
            notificationUpdate = true;
        }
    }

    public void setAlbum(String album) {
        if (!this.album.equals(album)) {
            this.album = album;
            mediaMetadataUpdate = true;
            notificationUpdate = true;
        }
    }

    public void setArtwork(Bitmap artwork) {
        this.artwork = artwork;
        loadDefaultArtwork();
        mediaMetadataUpdate = true;
        notificationUpdate = true;
    }

    public void setDuration(long duration) {
        if (this.duration != duration) {
            this.duration = duration;
            mediaMetadataUpdate = true;
            notificationUpdate = true;
        }
    }

    public void setPosition(long position) {
        if (this.position != position) {
            this.position = position;
            playbackStateUpdate = true;
        }
    }

    public void setPlaybackSpeed(float playbackSpeed) {
        if (this.playbackSpeed != playbackSpeed) {
            this.playbackSpeed = playbackSpeed;
            playbackStateUpdate = true;
        }
    }

    public void update() {
        if (possibleActionsUpdate) {
            buildActions();
            possibleActionsUpdate = false;
            playbackStateUpdate = true;
            notificationUpdate = true;
        }

        if (playbackStateUpdate && playbackStateBuilder != null) {
            playbackStateBuilder.setState(this.playbackState, this.position, this.playbackSpeed);
            mediaSession.setPlaybackState(playbackStateBuilder.build());
            playbackStateUpdate = false;
        }

        loadDefaultArtwork();

        if (mediaMetadataUpdate && mediaMetadataBuilder != null) {
            mediaMetadataBuilder
                    .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
                    .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist)
                    .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, album)
                    .putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, artwork)
                    .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, duration);
            mediaSession.setMetadata(mediaMetadataBuilder.build());
            mediaMetadataUpdate = false;
        }

        if (notificationUpdate && notificationBuilder != null) {
            buildActions();
            notificationBuilder
                    .setOnlyAlertOnce(true)
                    .setSound(null)
                    .setContentTitle(title)
                    .setContentText(artist)
                    .setLargeIcon(artwork);
            notificationManager.notify(NOTIFICATION_ID, notificationBuilder.build());
            notificationUpdate = false;
        }
    }

    public void updatePossibleActions() {
        this.possibleActionsUpdate = true;
        this.update();
    }
}
`;
  fs.writeFileSync(serviceJavaPath, serviceCode, 'utf8');
  console.log('[SVX Patch] Enhanced MediaSessionService.java written successfully.');

  // 2. Write enhanced MediaSessionPlugin.java
  const pluginCode = `package io.github.jofr.capacitor.mediasessionplugin;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.IBinder;
import android.support.v4.media.session.PlaybackStateCompat;
import android.util.Base64;
import android.util.Log;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CapacitorPlugin(name = "MediaSession")
public class MediaSessionPlugin extends Plugin {
    private static final String TAG = "MediaSessionPlugin";

    private boolean startServiceOnlyDuringPlayback = true;

    private String title = "";
    private String artist = "";
    private String album = "";
    private Bitmap artwork = null;
    private String playbackState = "none";
    private double duration = 0.0;
    private double position = 0.0;
    private double playbackRate = 1.0;
    private final Map<String, PluginCall> actionHandlers = new HashMap<>();

    private MediaSessionService service = null;

    private final ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName componentName, IBinder iBinder) {
            MediaSessionService.LocalBinder binder = (MediaSessionService.LocalBinder) iBinder;
            service = binder.getService();
            Intent intent = new Intent(getActivity(), getActivity().getClass());
            service.connectAndInitialize(MediaSessionPlugin.this, intent);
            updateServiceMetadata();
            updateServicePlaybackState();
            updateServicePositionState();
            service.updatePossibleActions();
        }

        @Override
        public void onServiceDisconnected(ComponentName componentName) {
            Log.d(TAG, "Disconnected from MediaSessionService");
            service = null;
        }
    };

    @Override
    public void load() {
        super.load();

        final String foregroundServiceConfig = getConfig().getString("foregroundService", "");
        if (foregroundServiceConfig.equals("always")) {
            startServiceOnlyDuringPlayback = false;
        }

        if (!startServiceOnlyDuringPlayback) {
            startMediaService();
        }
    }

    public void startMediaService() {
        Intent intent = new Intent(getActivity(), MediaSessionService.class);
        ContextCompat.startForegroundService(getContext(), intent);
        getContext().bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE);
    }

    private void updateServiceMetadata() {
        if (service != null) {
            service.setTitle(title);
            service.setArtist(artist);
            service.setAlbum(album);
            service.setArtwork(artwork);
            service.update();
        }
    }

    private Bitmap urlToBitmap(String url) {
        if (url == null) return null;
        try {
            int base64Index = url.indexOf(";base64,");
            if (base64Index != -1) {
                String base64Data = url.substring(base64Index + 8);
                byte[] decoded = Base64.decode(base64Data, Base64.DEFAULT);
                return BitmapFactory.decodeByteArray(decoded, 0, decoded.length);
            }
        } catch (Throwable t) {
            Log.w(TAG, "Failed to decode base64 artwork", t);
        }
        return null;
    }

    @PluginMethod
    public void setMetadata(PluginCall call) throws JSONException, IOException {
        title = call.getString("title", title);
        artist = call.getString("artist", artist);
        album = call.getString("album", album);

        final JSArray artworkArray = call.getArray("artwork");
        if (artworkArray != null) {
            final List<JSONObject> artworkList = artworkArray.toList();
            for (JSONObject art : artworkList) {
                if (art.has("src")) {
                    String src = art.getString("src");
                    if (src != null && src.contains(";base64,")) {
                        this.artwork = urlToBitmap(src);
                    }
                }
            }
        }

        updateServiceMetadata();
        call.resolve();
    }

    private void updateServicePlaybackState() {
        if (service != null) {
            if (playbackState.equals("playing")) {
                service.setPlaybackState(PlaybackStateCompat.STATE_PLAYING);
            } else if (playbackState.equals("paused")) {
                service.setPlaybackState(PlaybackStateCompat.STATE_PAUSED);
            } else {
                service.setPlaybackState(PlaybackStateCompat.STATE_NONE);
            }
            service.update();
        }
    }

    @PluginMethod
    public void setPlaybackState(PluginCall call) {
        playbackState = call.getString("playbackState", playbackState);

        final boolean playback = playbackState.equals("playing") || playbackState.equals("paused");
        if (startServiceOnlyDuringPlayback && service == null && playback) {
            startMediaService();
        } else if (startServiceOnlyDuringPlayback && service != null && !playback) {
            try {
                getContext().unbindService(serviceConnection);
            } catch (Throwable ignored) {}
            service = null;
        } else if (service != null) {
            updateServicePlaybackState();
        }
        call.resolve();
    }

    private void updateServicePositionState() {
        if (service != null) {
            service.setDuration(Math.round(duration * 1000));
            service.setPosition(Math.round(position * 1000));
            float speed = playbackRate == 0.0 ? 1.0F : (float) playbackRate;
            service.setPlaybackSpeed(speed);
            service.update();
        }
    }

    @PluginMethod
    public void setPositionState(PluginCall call) {
        duration = call.getDouble("duration", 0.0);
        position = call.getDouble("position", 0.0);
        playbackRate = call.getFloat("playbackRate", 1.0F);

        updateServicePositionState();
        call.resolve();
    }

    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    public void setActionHandler(PluginCall call) {
        call.setKeepAlive(true);
        actionHandlers.put(call.getString("action"), call);

        if (service != null) {
            service.updatePossibleActions();
        }
    }

    public boolean hasActionHandler(String action) {
        return true; // Actions are always active and handled
    }

    public void actionCallback(String action) {
        actionCallback(action, new JSObject());
    }

    public void actionCallback(String action, JSObject data) {
        if (data == null) {
            data = new JSObject();
        }
        data.put("action", action);

        // 1. Send via Capacitor Event Listener bus (persistent and reliable)
        notifyListeners("mediaAction", data);
        notifyListeners(action, data);

        // 2. Also resolve saved callback
        PluginCall call = actionHandlers.get(action);
        if (call != null) {
            call.setKeepAlive(true);
            call.resolve(data);
        }
    }
}
`;
  fs.writeFileSync(pluginJavaPath, pluginCode, 'utf8');
  console.log('[SVX Patch] Enhanced MediaSessionPlugin.java written successfully.');

  // 3. Patch plugin AndroidManifest.xml for Android 14 FOREGROUND_SERVICE_MEDIA_PLAYBACK permission
  if (fs.existsSync(pluginManifestPath)) {
    let manifest = fs.readFileSync(pluginManifestPath, 'utf8');
    if (!manifest.includes('android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK')) {
      manifest = manifest.replace(
        '<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />',
        '<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />\n    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />\n    <uses-permission android:name="android.permission.WAKE_LOCK" />'
      );
      fs.writeFileSync(pluginManifestPath, manifest, 'utf8');
      console.log('[SVX Patch] Plugin AndroidManifest.xml updated with FOREGROUND_SERVICE_MEDIA_PLAYBACK permission.');
    }
  }

  console.log('[SVX Patch] MediaSession enhanced native patch complete.');
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('patch-media-session.js')) {
  applyMediaSessionPatch();
}
