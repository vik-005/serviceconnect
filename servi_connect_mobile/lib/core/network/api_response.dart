/// Réponse API générique pour tous les endpoints
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final List<String> errors;

  ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.errors = const [],
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] ?? false,
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      message: json['message'] as String?,
      errors: List<String>.from(json['errors'] as List? ?? []),
    );
  }

  Map<String, dynamic> toJson(Object? Function(T value) toJsonT) {
    return {
      'success': success,
      'data': data != null ? toJsonT(data as T) : null,
      'message': message,
      'errors': errors,
    };
  }
}

extension ApiResponseX<T> on ApiResponse<T> {
  bool get isLoading => false; // Use AsyncValue for loading in providers
  bool get hasError => !success && errors.isNotEmpty;
  T? get valueOrNull => success ? data : null;
}
