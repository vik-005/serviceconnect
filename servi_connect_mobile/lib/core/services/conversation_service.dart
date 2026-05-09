import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/dio_client.dart';
import '../constants/api_constants.dart';

final conversationServiceProvider = Provider(
  (ref) => ConversationService(DioClient().dio),
);

class ConversationService {
  final Dio _dio;

  ConversationService(this._dio);

  /// Fetch all conversations for current user
  Future<List<Map<String, dynamic>>> fetchConversations(String token) async {
    try {
      final response = await _dio.get(
        ApiConstants.conversations,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        if (response.data is List) {
          return List<Map<String, dynamic>>.from(response.data);
        } else if (response.data is Map && response.data.containsKey('data')) {
          return List<Map<String, dynamic>>.from(response.data['data']);
        }
        return [];
      }
      throw Exception('Fetch conversations failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Fetch conversations error: $e');
    }
  }

  /// Get specific conversation with messages
  Future<Map<String, dynamic>> getConversation(
    String token,
    String conversationId,
  ) async {
    try {
      final url = ApiConstants.conversationDetail.replaceFirst(
        '{id}',
        conversationId,
      );

      final response = await _dio.get(
        url,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        return response.data;
      }
      throw Exception('Get conversation failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Get conversation error: $e');
    }
  }

  /// Get messages from a conversation
  Future<List<Map<String, dynamic>>> getMessages(
    String token,
    String conversationId, {
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final url = ApiConstants.conversationMessages.replaceFirst(
        '{id}',
        conversationId,
      );

      final response = await _dio.get(
        url,
        queryParameters: {
          'limit': limit,
          'offset': offset,
        },
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        if (response.data is List) {
          return List<Map<String, dynamic>>.from(response.data);
        } else if (response.data is Map && response.data.containsKey('data')) {
          return List<Map<String, dynamic>>.from(response.data['data']);
        }
        return [];
      }
      throw Exception('Get messages failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Get messages error: $e');
    }
  }

  /// Send a message
  Future<Map<String, dynamic>> sendMessage(
    String token,
    String conversationId, {
    required String content,
    String? mediaUrl,
    String? mediaType,
  }) async {
    try {
      final url = ApiConstants.sendMessage.replaceFirst(
        '{id}',
        conversationId,
      );

      final response = await _dio.post(
        url,
        data: {
          'content': content,
          if (mediaUrl != null) 'mediaUrl': mediaUrl,
          if (mediaType != null) 'mediaType': mediaType,
        },
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return response.data;
      }
      throw Exception('Send message failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Send message error: $e');
    }
  }

  /// Create a new conversation
  Future<Map<String, dynamic>> createConversation(
    String token, {
    required String participantId,
    required String firstMessage,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.conversations,
        data: {
          'participantId': participantId,
          'firstMessage': firstMessage,
        },
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return response.data;
      }
      throw Exception('Create conversation failed: ${response.statusCode}');
    } catch (e) {
      throw Exception('Create conversation error: $e');
    }
  }

  /// Mark messages as read
  Future<void> markMessagesAsRead(
    String token,
    String conversationId,
  ) async {
    try {
      final url = ApiConstants.markMessagesAsRead.replaceFirst(
        '{id}',
        conversationId,
      );

      final response = await _dio.post(
        url,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception('Mark as read failed: ${response.statusCode}');
      }
    } catch (e) {
      print('Mark as read error (non-blocking): $e');
      // Non-blocking - just log the error
    }
  }

  /// Send typing indicator
  Future<void> sendTypingIndicator(
    String token,
    String conversationId,
  ) async {
    try {
      final url = ApiConstants.typingIndicator.replaceFirst(
        '{id}',
        conversationId,
      );

      await _dio.post(
        url,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );
    } catch (e) {
      print('Typing indicator error (non-blocking): $e');
      // Non-blocking
    }
  }

  /// Delete a conversation
  Future<void> deleteConversation(
    String token,
    String conversationId,
  ) async {
    try {
      final url = ApiConstants.conversationDetail.replaceFirst(
        '{id}',
        conversationId,
      );

      final response = await _dio.delete(
        url,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception('Delete conversation failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Delete conversation error: $e');
    }
  }
}
