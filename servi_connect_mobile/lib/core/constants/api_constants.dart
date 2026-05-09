class ApiConstants {
  // API Base URLs - Use environment variables or defaults
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8000',
  );

  static const String mercureUrl = String.fromEnvironment(
    'MERCURE_URL',
    defaultValue: 'http://localhost:3000/.well-known/mercure',
  );

  static const String uploadsUrl = String.fromEnvironment(
    'UPLOADS_BASE_URL',
    defaultValue: 'http://localhost:8000/uploads',
  );

  static const String mapboxToken = String.fromEnvironment(
    'MAPBOX_TOKEN',
    defaultValue: '',
  );

  // Auth
  static const String register = '/api/auth/register';
  static const String login = '/api/auth/login';
  static const String refresh = '/api/auth/refresh';
  static const String logout = '/api/auth/logout';
  static const String profile = '/api/auth/profile';
  static const String updateProfile = '/api/auth/profile';

  // Banners
  static const String banners = '/api/banners';

  // Categories
  static const String categories = '/api/categories';
  static const String categoryDetail = '/api/categories/{id}';

  // Search & Providers
  static const String providers = '/api/providers';
  static const String searchProviders = '/api/search/providers';
  static const String providerSearch = '/api/providers/search';
  static const String providerDetail = '/api/providers/{id}';
  static const String providerReviews = '/api/providers/{id}/reviews';

  // Conversations
  static const String conversations = '/api/conversations';
  static const String conversationDetail = '/api/conversations/{id}';
  static const String conversationMessages = '/api/conversations/{id}/messages';
  static const String sendMessage = '/api/conversations/{id}/messages';
  static const String markMessagesAsRead =
      '/api/conversations/{id}/messages/read';
  static const String typingIndicator = '/api/conversations/{id}/typing';

  // Media
  static const String uploadMedia = '/api/media/upload';
  static const String uploadAudio = '/api/media/audio';
  static const String uploadImage = '/api/media/image';

  // Admin
  static const String adminUsers = '/api/admin/users';
  static const String adminUserDetail = '/api/admin/users/{id}';
  static const String adminBanners = '/api/admin/banners';
  static const String adminBannerDetail = '/api/admin/banners/{id}';
  static const String adminCategories = '/api/admin/categories';
  static const String adminCategoryDetail = '/api/admin/categories/{id}';

  // Reviews
  static const String reviews = '/api/reviews';
  static const String createReview = '/api/reviews';
  static const String updateReview = '/api/reviews/{id}';
  static const String deleteReview = '/api/reviews/{id}';
}
