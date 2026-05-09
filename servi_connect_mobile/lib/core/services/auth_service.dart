import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/dio_client.dart';
import '../constants/api_constants.dart';
import '../../features/auth/models/auth_response.dart';

final authServiceProvider = Provider((ref) => AuthService(DioClient().dio));

class AuthService {
  final Dio _dio;

  AuthService(this._dio);

  /// Register user
  Future<AuthResponse> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String phone,
    String? userType,
    String country = 'BJ',
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.register,
        data: {
          'email': email,
          'password': password,
          'firstName': firstName,
          'lastName': lastName,
          'phone': phone.isEmpty ? null : phone, // Phone optionnel
          'role': userType ?? 'client',
          'country': country,
        },
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return AuthResponse.fromJson(response.data);
      }
      throw Exception('Registration failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Registration error: $e');
    }
  }

  /// Login user
  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.login,
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return AuthResponse.fromJson(response.data);
      }
      throw Exception('Login failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Login error: $e');
    }
  }

  /// Get current user profile
  Future<Map<String, dynamic>> getProfile(String token) async {
    try {
      final response = await _dio.get(
        ApiConstants.profile,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        return response.data;
      }
      throw Exception('Get profile failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Get profile error: $e');
    }
  }

  /// Refresh token
  Future<AuthResponse> refreshToken(String refreshToken) async {
    try {
      final response = await _dio.post(
        ApiConstants.refresh,
        data: {'refresh_token': refreshToken},
      );

      if (response.statusCode == 200) {
        return AuthResponse.fromJson(response.data);
      }
      throw Exception('Token refresh failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Token refresh error: $e');
    }
  }

  /// Logout user
  Future<void> logout(String token) async {
    try {
      await _dio.post(
        ApiConstants.logout,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );
    } catch (e) {
      print('Logout error (non-blocking): $e');
      // Non-blocking - just log the error
    }
  }

  /// Update user profile
  Future<Map<String, dynamic>> updateProfile(
    String token, {
    required String firstName,
    required String lastName,
    required String phone,
    String? address,
    String? city,
    String? zipCode,
  }) async {
    try {
      final response = await _dio.put(
        ApiConstants.updateProfile,
        data: {
          'firstName': firstName,
          'lastName': lastName,
          'phone': phone,
          'address': address,
          'city': city,
          'zipCode': zipCode,
        },
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        return response.data;
      }
      throw Exception('Profile update failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Profile update error: $e');
    }
  }
}
