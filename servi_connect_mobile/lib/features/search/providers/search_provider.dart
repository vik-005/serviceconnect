import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/provider_service.dart';
import '../../auth/providers/auth_provider.dart';

// Provider model
class ServiceProvider {
  final String id;
  final String name;
  final String? avatar;
  final String category;
  final double rating;
  final int reviewCount;
  final String description;
  final double distance;
  final bool verified;
  final double? latitude;
  final double? longitude;

  ServiceProvider({
    required this.id,
    required this.name,
    this.avatar,
    required this.category,
    required this.rating,
    required this.reviewCount,
    required this.description,
    required this.distance,
    required this.verified,
    this.latitude,
    this.longitude,
  });

  /// Factory constructor to map API JSON response to ServiceProvider
  factory ServiceProvider.fromJson(Map<String, dynamic> json) {
    final categories = json['categories'] as List?;
    final categoryName = (categories != null && categories.isNotEmpty)
        ? (categories.first['name'] as String? ?? '')
        : '';
    final location = json['location'] as Map<String, dynamic>?;

    return ServiceProvider(
      id: json['id']?.toString() ?? '',
      name: '${json['firstName'] ?? ''} ${json['lastName'] ?? ''}'.trim(),
      avatar: json['avatarUrl'] as String?,
      category: categoryName,
      rating: (json['averageRating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: json['reviewCount'] as int? ?? 0,
      description: json['bio'] as String? ?? '',
      distance: (json['distance'] as num?)?.toDouble() ?? 0.0,
      verified: json['isVerified'] as bool? ?? false,
      latitude: (location?['lat'] as num?)?.toDouble(),
      longitude: (location?['lng'] as num?)?.toDouble(),
    );
  }
}

// Search Provider
final searchProvidersProvider = StateNotifierProvider<SearchProvidersNotifier,
    AsyncValue<List<ServiceProvider>>>((ref) {
  return SearchProvidersNotifier(ref);
});

class SearchProvidersNotifier
    extends StateNotifier<AsyncValue<List<ServiceProvider>>> {
  final Ref _ref;
  SearchProvidersNotifier(this._ref) : super(const AsyncValue.data([]));

  Future<void> search({
    required String category,
    String? keyword,
    double? latitude,
    double? longitude,
    double radiusKm = 50,
  }) async {
    state = const AsyncValue.loading();
    try {
      final token = _ref.read(authProvider).token;
      if (token == null) {
        throw Exception('User is not authenticated');
      }

      final providerService = _ref.read(providerServiceProvider);
      // Backend expects radius in meters: convert km to meters
      final radiusMeters = (radiusKm * 1000).toInt();

      final responseList = await providerService.searchProviders(
        token,
        keyword: keyword,
        category: category.isNotEmpty ? category : null,
        latitude: latitude,
        longitude: longitude,
        distance: radiusMeters.toDouble(),
      );

      final providers = responseList
          .map((json) => ServiceProvider.fromJson(json))
          .toList();

      state = AsyncValue.data(providers);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> clearSearch() async {
    state = const AsyncValue.data([]);
  }
}

// Provider detail Provider
final providerDetailProvider =
    FutureProvider.family<ServiceProvider?, String>((ref, providerId) async {
  final token = ref.read(authProvider).token;
  if (token == null) return null;

  final providerService = ref.read(providerServiceProvider);
  final json = await providerService.getProviderDetail(token, providerId);
  return ServiceProvider.fromJson(json);
});

