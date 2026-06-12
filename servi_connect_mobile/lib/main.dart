import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'core/services/notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load();

  // Initialisation de Firebase avec gestion d'erreur (dégradation gracieuse si config manquante)
  try {
    await Firebase.initializeApp();
    debugPrint('🎉 Firebase initialisé avec succès.');
  } catch (e) {
    debugPrint('⚠️ Échec de l\'initialisation de Firebase (google-services.json probablement manquant) : $e');
  }

  // Initialisation du service de notifications
  try {
    await NotificationService().initialize();
    debugPrint('🔔 NotificationService initialisé.');
  } catch (e) {
    debugPrint('⚠️ Échec de l\'initialisation de NotificationService : $e');
  }

  runApp(
    const ProviderScope(
      child: ServiConnectApp(),
    ),
  );
}

class ServiConnectApp extends ConsumerWidget {
  const ServiConnectApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'ServiConnect',
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.light,
      routerConfig: AppRouter.router,
      debugShowCheckedModeBanner: false,
    );
  }
}
