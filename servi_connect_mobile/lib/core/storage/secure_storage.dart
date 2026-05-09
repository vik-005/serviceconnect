import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

class SecureStorage {
  static const FlutterSecureStorage _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      resetOnError: true,
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
accessibility: KeychainAccessibility.first_unlock,
    ),
  );

  // Auth Tokens
  Future<void> saveTokens({
    String? token,
    String? refreshToken,
  }) async {
    if (token != null) await _storage.write(key: 'jwt_token', value: token);
    if (refreshToken != null)
      await _storage.write(key: 'refresh_token', value: refreshToken);
  }

  Future<String?> getToken() => _storage.read(key: 'jwt_token');
  Future<String?> getRefreshToken() => _storage.read(key: 'refresh_token');

  Future<void> clearTokens() async {
    await _storage.delete(key: 'jwt_token');
    await _storage.delete(key: 'refresh_token');
  }

  // User Data
  Future<void> saveUser(Map<String, dynamic> user) =>
      _storage.write(key: 'user', value: jsonEncode(user));

  Future<Map<String, dynamic>?> getUser() async {
    final userString = await _storage.read(key: 'user');
    if (userString == null) return null;
    try {
      return jsonDecode(userString) as Map<String, dynamic>;
    } catch (e) {
      return null;
    }
  }

  Future<void> clearUser() => _storage.delete(key: 'user');

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }

  Future<String?> getRole() async {
    final user = await getUser();
    return user?['role'] as String?;
  }
}
