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
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> sendMessage(String content, {String type = 'text', File? media}) async {
    try {
      final previousState = state.value ?? [];
      
      // Envoi API
      dynamic data;
      if (media != null) {
        data = FormData.fromMap({
          'content': content,
          'type': type,
          'media': await MultipartFile.fromFile(media.path),
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
      state = AsyncValue.data([...previousState, newMessage]);
    } catch (e) {
      // Handle error
    }
  }
}
