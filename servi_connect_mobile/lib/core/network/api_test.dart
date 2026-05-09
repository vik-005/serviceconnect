/// Fichier de test de la connexion API
/// Ce fichier permet de tester que l'API est bien liée et accessible

import 'package:dio/dio.dart';
import '../constants/api_constants.dart';

class ApiConnectionTest {
  static final Dio _dio = Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'Content-Type': 'application/json'},
  ));

  /// Test la connexion à l'API
  static Future<bool> testConnection() async {
    try {
      print('Testing API connection to: ${ApiConstants.baseUrl}');

      // Test 1: Health check
      final response = await _dio.get('/health');
      print('Health check response: ${response.statusCode}');
      return response.statusCode == 200;
    } catch (e) {
      print('API Connection Test Failed: $e');
      return false;
    }
  }

  /// Test le login avec des identifiants
  static Future<bool> testLogin(String email, String password) async {
    try {
      print('Testing login with email: $email');

      final response = await _dio.post(
        ApiConstants.login,
        data: {
          'email': email,
          'password': password,
        },
      );

      print('Login response: ${response.statusCode}');
      print('Login data: ${response.data}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final token = response.data['token'];
        final refreshToken =
            response.data['refreshToken'] ?? response.data['refresh_token'];

        print('Token received: ${token != null ? 'Yes' : 'No'}');
        print('Refresh token received: ${refreshToken != null ? 'Yes' : 'No'}');

        return token != null;
      }
      return false;
    } catch (e) {
      print('Login Test Failed: $e');
      return false;
    }
  }

  /// Test le fetch des conversations
  static Future<bool> testFetchConversations(String token) async {
    try {
      print('Testing fetch conversations with token');

      final response = await _dio.get(
        ApiConstants.conversations,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      print('Conversations response: ${response.statusCode}');
      print(
          'Conversations count: ${response.data is List ? response.data.length : 'N/A'}');

      return response.statusCode == 200;
    } catch (e) {
      print('Fetch Conversations Test Failed: $e');
      return false;
    }
  }

  /// Test le fetch des prestataires
  static Future<bool> testFetchProviders(String token) async {
    try {
      print('Testing fetch providers with token');

      final response = await _dio.get(
        ApiConstants.providers,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      print('Providers response: ${response.statusCode}');
      print(
          'Providers count: ${response.data is List ? response.data.length : 'N/A'}');

      return response.statusCode == 200;
    } catch (e) {
      print('Fetch Providers Test Failed: $e');
      return false;
    }
  }
}
