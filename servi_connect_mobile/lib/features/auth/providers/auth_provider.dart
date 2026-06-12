import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/services/notification_service.dart';
import '../data/models/user_model.dart';

class AuthState {
  final bool isAuthenticated;
  final UserModel? user;
  final String? error;
  final bool isLoading;
  final String? token;

  AuthState({
    this.isAuthenticated = false,
    this.user,
    this.error,
    this.isLoading = false,
    this.token,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    UserModel? user,
    String? error,
    bool? isLoading,
    String? token,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      error: error ?? this.error,
      isLoading: isLoading ?? this.isLoading,
      token: token ?? this.token,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final _storage = const FlutterSecureStorage();
  final _dio = DioClient();

  AuthNotifier() : super(AuthState()) {
    restoreSession();
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.post(
        ApiConstants.login,
        data: {'email': email, 'password': password},
      );

      final token = response['token'];
      final refreshToken = response['refreshToken'];
      final userData = response['user'];

      await _storage.write(key: 'jwt_token', value: token);
      await _storage.write(key: 'refresh_token', value: refreshToken);

      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        user: UserModel.fromJson(userData),
        token: token,
      );

      // Envoi du token FCM au serveur après connexion
      _sendFcmTokenToBackend();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseError(e),
      );
    }
  }

  Future<void> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String phone,
    required String role,
    String country = 'BJ',
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.post(
        ApiConstants.register,
        data: {
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'password': password,
          'phone': phone.isEmpty ? null : phone,
          'role': role,
          'country': country,
        },
      );

      final token = response['token'];
      final refreshToken = response['refreshToken'];
      final userData = response['user'];

      await _storage.write(key: 'jwt_token', value: token);
      await _storage.write(key: 'refresh_token', value: refreshToken);

      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        user: UserModel.fromJson(userData),
        token: token,
      );

      // Envoi du token FCM au serveur après inscription
      _sendFcmTokenToBackend();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseError(e),
      );
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    try {
      await _storage.deleteAll();
      state = AuthState();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseError(e),
      );
    }
  }

  Future<bool> forgotPassword(String email) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _dio.post(
        ApiConstants.forgotPassword,
        data: {'email': email},
      );
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseError(e),
      );
      return false;
    }
  }

  Future<bool> resetPassword(String token, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _dio.post(
        ApiConstants.resetPassword,
        data: {
          'token': token,
          'password': password,
        },
      );
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseError(e),
      );
      return false;
    }
  }

  Future<void> deleteAccount() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _dio.delete('/api/me');
      await _storage.deleteAll();
      state = AuthState();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseError(e),
      );
      rethrow;
    }
  }

  Future<void> restoreSession() async {
    state = state.copyWith(isLoading: true);
    try {
      final token = await _storage.read(key: 'jwt_token');
      if (token != null) {
        final response = await _dio.get('/api/me');
        
        state = state.copyWith(
          isAuthenticated: true,
          isLoading: false,
          user: UserModel.fromJson(response),
          token: token,
        );

        // Envoyer le token FCM si disponible
        _sendFcmTokenToBackend();
      } else {
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, isAuthenticated: false);
    }
  }

  /// Envoie le token FCM enregistré localement au serveur Symfony.
  Future<void> _sendFcmTokenToBackend() async {
    try {
      // Attendre un court instant pour s'assurer que le service de notifications est initialisé
      await Future.delayed(const Duration(milliseconds: 500));
      final fcmToken = NotificationService().fcmToken;
      if (fcmToken != null && state.isAuthenticated) {
        debugPrint('🔔 Tentative d\'envoi du token FCM au backend: $fcmToken');
        await _dio.patch(
          '/api/me/fcm-token',
          data: {'fcmToken': fcmToken},
        );
        debugPrint('✅ Token FCM enregistré avec succès sur le serveur.');
      } else {
        debugPrint('⚠️ Token FCM nul ou utilisateur non authentifié. Envoi annulé.');
      }
    } catch (e) {
      debugPrint('❌ Erreur lors de l\'envoi du token FCM au serveur: $e');
    }
  }

  /// Parse exception to user-friendly message
  String _parseError(dynamic e) {
    // DioException - parse HTTP status and body
    if (e is DioException) {
      final status = e.response?.statusCode;
      final data = e.response?.data;

      // Try to extract API message from response body
      if (data is Map) {
        final msg = data['message'] ?? data['detail'] ?? data['error'];
        if (msg != null && msg.toString().isNotEmpty) {
          // Translate common English API messages
          final s = msg.toString().toLowerCase();
          if (s.contains('already exist') || s.contains('already used') || s.contains('duplicate')) {
            return 'Un compte existe déjà avec cet email.';
          }
          if (s.contains('invalid credentials') || s.contains('bad credentials')) {
            return 'Email ou mot de passe incorrect.';
          }
          if (s.contains('not found')) {
            return 'Ressource introuvable.';
          }
          return msg.toString();
        }

        // Symfony validation errors
        final errors = data['errors'];
        if (errors is List && errors.isNotEmpty) {
          return errors.map((e) => e.toString()).join('\n');
        }
        if (errors is Map) {
          return errors.values.map((e) => e.toString()).join('\n');
        }
      }

      switch (status) {
        case 400:
          return 'Requête invalide. Vérifiez les données saisies.';
        case 401:
          return 'Email ou mot de passe incorrect.';
        case 404:
          return 'Service introuvable (404). Vérifiez la configuration du serveur.';
        case 409:
          return 'Un compte existe déjà avec cet email.';
        case 422:
          return 'Données invalides. Vérifiez les champs du formulaire.';
        case 500:
        case 502:
        case 503:
          return 'Erreur serveur. Réessayez dans quelques instants.';
        default:
          if (e.type == DioExceptionType.connectionTimeout ||
              e.type == DioExceptionType.receiveTimeout ||
              e.type == DioExceptionType.sendTimeout) {
            return 'Le serveur met trop de temps à répondre. Vérifiez votre connexion.';
          }
          if (e.type == DioExceptionType.connectionError) {
            return 'Impossible de contacter le serveur. Vérifiez votre connexion internet et que l\'API est démarrée.';
          }
      }
    }

    final raw = e.toString().toLowerCase();
    if (raw.contains('socketexception') ||
        raw.contains('connection refused') ||
        raw.contains('failed host lookup') ||
        raw.contains('network')) {
      return 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
    }

    return 'Une erreur est survenue. Veuillez réessayer.';
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
