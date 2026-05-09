import '../data/models/user_model.dart';

/// Modèle de réponse d'authentification (login/register)
class AuthResponse {
  final String token;
  final String refreshToken;
  final UserModel user;

  AuthResponse({
    required this.token,
    required this.refreshToken,
    required this.user,
  });

  /// Créer depuis JSON
  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    final userData = json['user'] ?? json['data'];

    return AuthResponse(
      token: json['token'] as String? ?? json['accessToken'] as String? ?? '',
      refreshToken: json['refreshToken'] as String? ??
          json['refresh_token'] as String? ??
          '',
      user: UserModel.fromJson(userData is Map<String, dynamic> 
          ? userData 
          : Map<String, dynamic>.from(userData is Map ? userData : {})),
    );
  }

  /// Convertir en JSON
  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'refreshToken': refreshToken,
      'user': user.toJson(),
    };
  }
}
