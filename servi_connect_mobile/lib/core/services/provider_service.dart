import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/dio_client.dart';
import '../constants/api_constants.dart';

final providerServiceProvider = Provider(
  (ref) => ProviderService(DioClient().dio),
);

class ProviderService {
  final Dio _dio;

  ProviderService(this._dio);

  /// Search for providers with filters
  Future<List<Map<String, dynamic>>> searchProviders(
    String token, {
    String? keyword,
    String? category,
    double? latitude,
    double? longitude,
    double? distance,
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final queryParams = {
        if (keyword != null) 'keyword': keyword,
        if (category != null) 'category': category,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        if (distance != null) 'distance': distance,
        'limit': limit,
        'offset': offset,
      };

      final response = await _dio.get(
        ApiConstants.searchProviders,
        queryParameters: queryParams,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        if (response.data is List) {
          return List<Map<String, dynamic>>.from(response.data);
        } else if (response.data is Map && response.data.containsKey('data')) {
          return List<Map<String, dynamic>>.from(response.data['data']);
        }
        return [];
      }
      throw Exception('Search providers failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Search providers error: $e');
    }
  }

  /// Get provider details
  Future<Map<String, dynamic>> getProviderDetail(
    String token,
    String providerId,
  ) async {
    try {
      final url = ApiConstants.providerDetail.replaceFirst('{id}', providerId);

      final response = await _dio.get(
        url,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        return response.data;
      }
      throw Exception('Get provider detail failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Get provider detail error: $e');
    }
  }

  /// Get provider reviews
  Future<List<Map<String, dynamic>>> getProviderReviews(
    String token,
    String providerId, {
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final url = ApiConstants.providerReviews.replaceFirst('{id}', providerId);

      final response = await _dio.get(
        url,
        queryParameters: {
          'limit': limit,
          'offset': offset,
        },
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        if (response.data is List) {
          return List<Map<String, dynamic>>.from(response.data);
        } else if (response.data is Map && response.data.containsKey('data')) {
          return List<Map<String, dynamic>>.from(response.data['data']);
        }
        return [];
      }
      throw Exception('Get provider reviews failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Get provider reviews error: $e');
    }
  }

  /// Get all providers
  Future<List<Map<String, dynamic>>> getAllProviders(
    String token, {
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final response = await _dio.get(
        ApiConstants.providers,
        queryParameters: {
          'limit': limit,
          'offset': offset,
        },
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        if (response.data is List) {
          return List<Map<String, dynamic>>.from(response.data);
        } else if (response.data is Map && response.data.containsKey('data')) {
          return List<Map<String, dynamic>>.from(response.data['data']);
        }
        return [];
      }
      throw Exception('Get all providers failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Get all providers error: $e');
    }
  }

  /// Get categories
  Future<List<Map<String, dynamic>>> getCategories(String token) async {
    try {
      final response = await _dio.get(
        ApiConstants.categories,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        if (response.data is List) {
          return List<Map<String, dynamic>>.from(response.data);
        } else if (response.data is Map && response.data.containsKey('data')) {
          return List<Map<String, dynamic>>.from(response.data['data']);
        }
        return [];
      }
      throw Exception('Get categories failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Get categories error: $e');
    }
  }

  /// Submit a review for a provider
  Future<Map<String, dynamic>> submitReview(
    String token,
    String providerId, {
    required double rating,
    required String comment,
  }) async {
    try {
      final response = await _dio.post(
        '${ApiConstants.providerReviews.replaceFirst('{id}', providerId)}/submit',
        data: {
          'rating': rating,
          'comment': comment,
        },
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return response.data;
      }
      throw Exception('Submit review failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Submit review error: $e');
    }
  }

  /// Get banners
  Future<List<Map<String, dynamic>>> getBanners(String token) async {
    try {
      final response = await _dio.get(
        ApiConstants.banners,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        if (response.data is List) {
          return List<Map<String, dynamic>>.from(response.data);
        } else if (response.data is Map && response.data.containsKey('data')) {
          return List<Map<String, dynamic>>.from(response.data['data']);
        }
        return [];
      }
      throw Exception('Get banners failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Get banners error: $e');
    }
  }
}
