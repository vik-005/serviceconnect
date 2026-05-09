/// Modèle pour un prestataire (provider)
class ServiceProvider {
  final String id;
  final String name;
  final String category;
  final String? avatar;
  final double rating;
  final int reviewCount;
  final double distance;
  final bool verified;
  final String? description;
  final List<String>? skills;
  final String? phone;
  final bool? isOnline;

  ServiceProvider({
    required this.id,
    required this.name,
    required this.category,
    this.avatar,
    this.rating = 0.0,
    this.reviewCount = 0,
    this.distance = 0.0,
    this.verified = false,
    this.description,
    this.skills,
    this.phone,
    this.isOnline = false,
  });

  /// Créer depuis JSON
  factory ServiceProvider.fromJson(Map<String, dynamic> json) {
    return ServiceProvider(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Unknown',
      category: json['category'] as String? ?? '',
      avatar: json['avatar'] as String? ?? json['avatarUrl'] as String?,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount:
          json['reviewCount'] as int? ?? json['review_count'] as int? ?? 0,
      distance: (json['distance'] as num?)?.toDouble() ?? 0.0,
      verified: json['verified'] as bool? ?? false,
      description: json['description'] as String?,
      skills: json['skills'] != null
          ? List<String>.from(json['skills'] as List)
          : null,
      phone: json['phone'] as String?,
      isOnline: json['isOnline'] as bool? ?? json['is_online'] as bool?,
    );
  }

  /// Convertir en JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'avatar': avatar,
      'rating': rating,
      'reviewCount': reviewCount,
      'distance': distance,
      'verified': verified,
      'description': description,
      'skills': skills,
      'phone': phone,
      'isOnline': isOnline,
    };
  }
}
