import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';

// Conversation model
class Conversation {
  final String id;
  final String participantId;
  final String participantName;
  final String? participantAvatar;
  final String lastMessage;
  final DateTime lastMessageTime;
  final bool unread;
  final int unreadCount;

  Conversation({
    required this.id,
    required this.participantId,
    required this.participantName,
    this.participantAvatar,
    required this.lastMessage,
    required this.lastMessageTime,
    required this.unread,
    this.unreadCount = 0,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id']?.toString() ?? '',
      participantId: json['participantId']?.toString() ?? '',
      participantName: json['participantName'] ?? 'Utilisateur',
      participantAvatar: json['participantAvatar'],
      lastMessage: json['lastMessage'] ?? '',
      lastMessageTime: json['lastMessageTime'] != null
          ? DateTime.parse(json['lastMessageTime'])
          : DateTime.now(),
      unread: json['unread'] ?? false,
      unreadCount: json['unreadCount'] ?? 0,
    );
  }
}

// Conversations Provider
final conversationsProvider = StateNotifierProvider<ConversationsNotifier,
    AsyncValue<List<Conversation>>>((ref) {
  return ConversationsNotifier();
});

class ConversationsNotifier
    extends StateNotifier<AsyncValue<List<Conversation>>> {
  // ✅ FIX: DioClient instancié une seule fois comme champ de classe
  final _dioClient = DioClient();

  ConversationsNotifier() : super(const AsyncValue.loading()) {
    _loadConversations();
  }

  Future<void> _loadConversations() async {
    try {
      final response = await _dioClient.get(ApiConstants.conversations);

      // ✅ FIX CRITIQUE: L'API Symfony retourne directement un tableau [],
      // pas un objet {data: []}. On gère les deux cas pour être robuste.
      if (response is List) {
        final conversations = (response as List)
            .map((json) => Conversation.fromJson(json as Map<String, dynamic>))
            .toList();
        state = AsyncValue.data(conversations);
      } else if (response is Map && response['data'] != null) {
        // Fallback si l'API wrappait dans {data: []}
        final conversations = (response['data'] as List)
            .map((json) => Conversation.fromJson(json as Map<String, dynamic>))
            .toList();
        state = AsyncValue.data(conversations);
      } else {
        state = const AsyncValue.data([]);
      }
    } catch (e, stack) {
      // ✅ FIX: Propager l'erreur avec la stack trace complète
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> refreshConversations() async {
    state = const AsyncValue.loading();
    await _loadConversations();
  }
}
