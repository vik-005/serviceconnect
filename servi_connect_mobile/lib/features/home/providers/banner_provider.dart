import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/provider_service.dart';
import '../../auth/providers/auth_provider.dart';

final homeBannersProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final token = ref.watch(authProvider).token;
  if (token == null) return [];
  
  final providerService = ref.read(providerServiceProvider);
  return await providerService.getBanners(token);
});
