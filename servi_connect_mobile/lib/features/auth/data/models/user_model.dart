/// Modèle utilisateur pour l'authentification et le profil
class UserModel {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? phone;
  final String? avatarUrl;
  final String role; // 'client', 'provider', 'admin'
  final bool isActive;
  final double? latitude;
  final double? longitude;
  final String? city;
  final String? country;
  final String? fcmToken;
  final bool isVerified;

  UserModel({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.phone,
    this.avatarUrl,
    required this.role,
    this.isActive = true,
    this.latitude,
    this.longitude,
    this.city,
    this.country,
    this.fcmToken,
    this.isVerified = false,
  });

  /// Convertir depuis JSON
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      role: json['role'] as String? ?? 'client',
      isActive: json['isActive'] as bool? ?? true,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      city: json['city'] as String?,
      country: json['country'] as String?,
      fcmToken: json['fcmToken'] as String?,
      isVerified: json['isVerified'] as bool? ?? false,
    );
  }

  /// Convertir vers JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'phone': phone,
      'avatarUrl': avatarUrl,
      'role': role,
      'isActive': isActive,
      'latitude': latitude,
      'longitude': longitude,
      'city': city,
      'country': country,
      'fcmToken': fcmToken,
      'isVerified': isVerified,
    };
  }

  /// Obtenir le nom complet
  String get fullName => '$firstName $lastName';

  /// Vérifier si c'est un prestataire
  bool get isProvider => role == 'provider';

  /// Vérifier si c'est un admin
  bool get isAdmin => role == 'admin';

  /// Copier avec changements
  UserModel copyWith({
    String? id,
    String? firstName,
    String? lastName,
    String? email,
    String? phone,
    String? avatarUrl,
    String? role,
    bool? isActive,
    double? latitude,
    double? longitude,
    String? city,
    String? country,
    String? fcmToken,
    bool? isVerified,
  }) {
    return UserModel(
      id: id ?? this.id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      role: role ?? this.role,
      isActive: isActive ?? this.isActive,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      city: city ?? this.city,
      country: country ?? this.country,
      fcmToken: fcmToken ?? this.fcmToken,
      isVerified: isVerified ?? this.isVerified,
    );
  }
}
