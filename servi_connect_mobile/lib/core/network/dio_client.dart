import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:io';
import '../constants/api_constants.dart';
import 'api_response.dart';

class DioClient {
  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  DioClient() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(CookieManager(CookieJar()));
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'jwt_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (err, handler) async {
        if (err.response?.statusCode == 401) {
          try {
            final refreshToken = await _storage.read(key: 'refresh_token');
            if (refreshToken == null) {
              _logout();
              return handler.reject(err);
            }

            final refreshResponse = await Dio().post(
              '${ApiConstants.baseUrl}${ApiConstants.refresh}',
              data: {'refresh_token': refreshToken},
            );

            final newToken = refreshResponse.data['token'];
            await _storage.write(key: 'jwt_token', value: newToken);
            await _storage.write(
                key: 'refresh_token', value: refreshResponse.data['refreshToken']);

            // Retry original request
            final options = err.requestOptions;
            options.headers['Authorization'] = 'Bearer $newToken';
            final retryResponse = await _dio.fetch(options);
            return handler.resolve(retryResponse);
          } catch (e) {
            _logout();
            return handler.reject(err);
          }
        }
        return handler.reject(err);
      },
    ));
    _dio.interceptors.add(LogInterceptor(
      requestHeader: true,
      requestBody: true,
      responseHeader: false,
      responseBody: true,
      error: true,
      logPrint: (obj) => print('DIO: $obj'),
    ));
  }

  Future<void> _logout() async {
    await _storage.deleteAll();
    // Emit logout event or navigate to login via global key
  }

  Dio get dio => _dio;

  Future<dynamic> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    final response =
        await _dio.post(path, data: data, queryParameters: queryParameters);
    return response.data;
  }

  Future<dynamic> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    final response = await _dio.get(path, queryParameters: queryParameters);
    return response.data;
  }

  Future<dynamic> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    final response = await _dio.delete(path, data: data, queryParameters: queryParameters);
    return response.data;
  }

  Future<FormData> createFormData(
    Map<String, dynamic> fields,
    Map<String, File> files,
  ) async {
    final formData = FormData();

    // Add fields
    for (final entry in fields.entries) {
      formData.fields.add(MapEntry(entry.key, entry.value.toString()));
    }

    // Add files
    for (final entry in files.entries) {
      final multipartFile = await MultipartFile.fromFile(
        entry.value.path,
        filename: entry.value.path.split('/').last,
      );
      formData.files.add(MapEntry(entry.key, multipartFile));
    }

    return formData;
  }
}
