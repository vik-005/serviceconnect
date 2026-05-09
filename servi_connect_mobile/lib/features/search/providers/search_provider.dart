import 'package:flutter_riverpod/flutter_riverpod.dart';

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
}

// Search Provider
final searchProvidersProvider = StateNotifierProvider<SearchProvidersNotifier,
    AsyncValue<List<ServiceProvider>>>((ref) {
  return SearchProvidersNotifier();
});

class SearchProvidersNotifier
    extends StateNotifier<AsyncValue<List<ServiceProvider>>> {
  SearchProvidersNotifier() : super(const AsyncValue.data([]));

  Future<void> search({
    required String category,
    String? keyword,
    double? latitude,
    double? longitude,
    double radiusKm = 50,
  }) async {
    state = const AsyncValue.loading();
    try {
      // TODO: Search providers from API
      // final dioClient = DioClient();
      // final response = await dioClient.get(
      //   ApiConstants.providerSearch,
      //   queryParameters: {
      //     'category': category,
      //     'keyword': keyword,
      //     'latitude': latitude,
      //     'longitude': longitude,
      //     'radius': radiusKm,
      //   },
      // );
      // final providers = (response['data'] as List)
      //   .map((json) => ServiceProvider.fromJson(json))
      //   .toList();
      state = const AsyncValue.data([]);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> clearSearch() async {
    state = const AsyncValue.data([]);
  }
}

// Provider detail Provider
final providerDetailProvider =
    FutureProvider.family<ServiceProvider?, String>((ref, providerId) async {
  // TODO: Load provider details from API
  // final dioClient = DioClient();
  // final response = await dioClient.get(
  //   ApiConstants.providerDetail.replaceFirst('{id}', providerId),
  // );
  // return ServiceProvider.fromJson(response['data']);
  return null;
});
