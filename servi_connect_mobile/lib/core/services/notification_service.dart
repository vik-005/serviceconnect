import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

/// Service de notifications gérant Firebase et les notifications locales.
/// Si Firebase n'est pas configuré (google-services.json manquant),
/// le service se dégrade gracieusement sans crash.
class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  bool _initialized = false;
  String? _fcmToken;

  String? get fcmToken => _fcmToken;

  /// Initialise les notifications locales et tente Firebase.
  Future<void> initialize() async {
    if (_initialized) return;

    await _initLocalNotifications();
    await _initFirebase();

    _initialized = true;
  }

  // ─────────────────────────────────────────────
  // Notifications locales (flutter_local_notifications)
  // ─────────────────────────────────────────────
  Future<void> _initLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Créer le canal de notification Android
    if (Platform.isAndroid) {
      const channel = AndroidNotificationChannel(
        'serviconnect_main',
        'ServiConnect Notifications',
        description: 'Notifications pour messages et activités ServiConnect',
        importance: Importance.high,
        playSound: true,
        enableVibration: true,
      );

      await _localNotifications
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(channel);
    }
  }

  void _onNotificationTapped(NotificationResponse response) {
    // Gérer la navigation lors du tap sur une notification
    debugPrint('Notification tapped: ${response.payload}');
  }

  // ─────────────────────────────────────────────
  // Firebase Messaging (optionnel - nécessite google-services.json)
  // ─────────────────────────────────────────────
  Future<void> _initFirebase() async {
    try {
      // Import dynamique pour éviter le crash si Firebase n'est pas configuré
      await _tryInitFirebaseMessaging();
    } catch (e) {
      debugPrint(
        '⚠️ Firebase Messaging non initialisé: $e\n'
        'Pour activer les notifications push:\n'
        '1. Créez un projet Firebase sur https://console.firebase.google.com\n'
        '2. Téléchargez google-services.json\n'
        '3. Placez-le dans android/app/\n'
        '4. Ajoutez le plugin dans android/build.gradle.kts',
      );
    }
  }

  Future<void> _tryInitFirebaseMessaging() async {
    // Ce try/catch permet à l'app de fonctionner même sans Firebase configuré
    try {
      // ignore: avoid_dynamic_calls
      final messaging = _getFirebaseMessaging();
      if (messaging == null) return;

      // Demander permission (iOS / Android 13+)
      await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      // Obtenir le token FCM
      _fcmToken = await messaging.getToken();
      debugPrint('✅ FCM Token: $_fcmToken');

      // Écouter les messages en premier plan
      messaging.onMessage.listen(_handleForegroundMessage);

      // Écouter les mises à jour du token
      messaging.onTokenRefresh.listen((token) {
        _fcmToken = token;
        debugPrint('🔄 FCM Token mis à jour: $token');
      });
    } catch (e) {
      rethrow;
    }
  }

  /// Retourne l'instance FirebaseMessaging ou null si non disponible.
  dynamic _getFirebaseMessaging() {
    try {
      // Utilisation de reflection-like pattern pour éviter crash compile-time
      return _FirebaseMessagingWrapper.getInstance();
    } catch (_) {
      return null;
    }
  }

  void _handleForegroundMessage(dynamic message) {
    try {
      final notification = message.notification;
      if (notification == null) return;

      showLocalNotification(
        title: notification.title ?? 'ServiConnect',
        body: notification.body ?? '',
      );
    } catch (e) {
      debugPrint('Erreur traitement message: $e');
    }
  }

  // ─────────────────────────────────────────────
  // Afficher une notification locale
  // ─────────────────────────────────────────────
  Future<void> showLocalNotification({
    required String title,
    required String body,
    String? payload,
    int id = 0,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'serviconnect_main',
      'ServiConnect Notifications',
      channelDescription: 'Notifications pour messages et activités',
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
      styleInformation: BigTextStyleInformation(''),
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(id, title, body, details, payload: payload);
  }

  /// Annuler toutes les notifications
  Future<void> cancelAll() async {
    await _localNotifications.cancelAll();
  }
}

/// Wrapper pour éviter les erreurs de compilation si Firebase n'est pas configuré
class _FirebaseMessagingWrapper {
  static FirebaseMessaging getInstance() {
    return FirebaseMessaging.instance;
  }
}
