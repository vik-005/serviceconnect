import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'dart:io';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';
import '../data/models/message_model.dart';
import '../../auth/providers/auth_provider.dart';

final messageProvider = StateNotifierProvider.family<MessageNotifier, AsyncValue<List<MessageModel>>, String>((ref, conversationId) {
  final currentUserId = ref.watch(authProvider).user?.id ?? '';
  return MessageNotifier(conversationId, currentUserId);
});

class MessageNotifier extends StateNotifier<AsyncValue<List<MessageModel>>> {
  final String conversationId;
  final String currentUserId;
  final _dioClient = DioClient();

  MessageNotifier(this.conversationId, this.currentUserId) : super(const AsyncValue.loading()) {
    loadMessages();
  }

  Future<void> loadMessages() async {
    try {
      final response = await _dioClient.get('${ApiConstants.conversations}/$conversationId/messages');

      if (response is List) {
        final messages = response.map((m) => MessageModel.fromJson(m, currentUserId)).toList();
        state = AsyncValue.data(messages);
      } else {
        state = const AsyncValue.data([]);
      }
    } catch (e, stack) {
      // ✅ FIX: Propager l'erreur pour que l'UI puisse l'afficher
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> sendMessage(String content, {String type = 'text', File? media}) async {
    // ✅ FIX: Sauvegarder l'état précédent AVANT de tenter l'envoi
    final previousState = state;

    try {
      dynamic data;
      if (media != null) {
        data = FormData.fromMap({
          'content': content,
          'type': type,
          'media': await MultipartFile.fromFile(
            media.path,
            filename: media.path.split('/').last,
          ),
        });
      } else {
        data = FormData.fromMap({
          'content': content,
          'type': type,
        });
      }

      final response = await _dioClient.post(
        '${ApiConstants.conversations}/$conversationId/messages',
        data: data,
      );

      final newMessage = MessageModel.fromJson(response, currentUserId);
      final currentMessages = state.value ?? [];
      state = AsyncValue.data([...currentMessages, newMessage]);
    } catch (e, stack) {
      // ✅ FIX CRITIQUE: Propager l'erreur au lieu de l'avaler silencieusement
      // Restaurer l'état précédent pour ne pas perdre les messages affichés
      state = previousState;
      // Re-lancer l'erreur pour que l'UI puisse afficher un message d'erreur
      throw AsyncValue.error(e, stack);
    }
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    await loadMessages();
  }
}
