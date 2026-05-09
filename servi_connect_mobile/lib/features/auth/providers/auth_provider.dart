import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
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
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
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
          'phone': phone,
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
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
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
        error: e.toString(),
      );
    }
  }

  Future<void> restoreSession() async {
    state = state.copyWith(isLoading: true);
    try {
      final token = await _storage.read(key: 'jwt_token');
      if (token != null) {
        // Appeler /api/me pour valider le token et récupérer le profil actuel
        final response = await _dio.get('/api/me');
        
        state = state.copyWith(
          isAuthenticated: true,
          isLoading: false,
          user: UserModel.fromJson(response), // response est déjà le JSON du user
          token: token,
        );
      } else {
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      // Si le token est invalide ou expiré, _dio s'occupera d'essayer de le rafraîchir.
      // S'il échoue, l'intercepteur fera un _logout.
      state = state.copyWith(isLoading: false, isAuthenticated: false);
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
