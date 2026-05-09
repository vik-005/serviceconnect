import 'package:dio/dio.dart';
import '../network/dio_client.dart';
import '../constants/api_constants.dart';

/// Service de test pour les messages et conversations
class MessageTestService {
  static final Dio _dio = DioClient().dio;

  /// Test complet du flux de messages
  static Future<bool> testCompleteMessageFlow({
    required String token,
    required String conversationId,
  }) async {
    try {
      print('=== Testing Complete Message Flow ===');

      // 1. Fetch conversations
      print('\n1. Fetching conversations...');
      final conversationsResult = await _fetchConversations(token);
      if (!conversationsResult) {
        print('❌ Failed to fetch conversations');
        return false;
      }
      print('✅ Conversations fetched successfully');

      // 2. Get specific conversation
      print('\n2. Getting conversation details...');
      final conversationResult = await _getConversation(token, conversationId);
      if (!conversationResult) {
        print('❌ Failed to get conversation');
        return false;
      }
      print('✅ Conversation details retrieved');

      // 3. Fetch messages
      print('\n3. Fetching messages...');
      final messagesResult = await _getMessages(token, conversationId);
      if (!messagesResult) {
        print('❌ Failed to fetch messages');
        return false;
      }
      print('✅ Messages retrieved');

      // 4. Send a test message
      print('\n4. Sending test message...');
      final sendResult = await _sendMessage(
        token,
        conversationId,
        'Test message from mobile: ${DateTime.now()}',
      );
      if (!sendResult) {
        print('❌ Failed to send message');
        return false;
      }
      print('✅ Message sent successfully');

      // 5. Mark as read
      print('\n5. Marking messages as read...');
      await _markAsRead(token, conversationId);
      print('✅ Messages marked as read');

      print('\n=== All Tests Passed! ===\n');
      return true;
    } catch (e) {
      print('❌ Test failed with error: $e');
      return false;
    }
  }

  /// Test d'envoi multiple de messages
  static Future<bool> testMultipleMessages({
    required String token,
    required String conversationId,
    int count = 3,
  }) async {
    try {
      print('\n=== Testing Multiple Messages (Count: $count) ===');

      for (int i = 1; i <= count; i++) {
        print('\nSending message $i/$count...');
        final result = await _sendMessage(
          token,
          conversationId,
          'Test message #$i: ${DateTime.now()}',
        );

        if (!result) {
          print('❌ Failed to send message $i');
          return false;
        }
        print('✅ Message $i sent');

        // Petit délai entre les messages
        await Future.delayed(const Duration(milliseconds: 500));
      }

      print('\n=== All Messages Sent! ===\n');
      return true;
    } catch (e) {
      print('❌ Multiple messages test failed: $e');
      return false;
    }
  }

  // ============== Helper Methods ==============

  static Future<bool> _fetchConversations(String token) async {
    try {
      final response = await _dio.get(
        ApiConstants.conversations,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (response.statusCode == 200) {
        final data =
            response.data is List ? response.data : response.data['data'] ?? [];
        print('   Found ${(data is List ? data.length : 0)} conversations');
        return true;
      }
      return false;
    } catch (e) {
      print('   Error: $e');
      return false;
    }
  }

  static Future<bool> _getConversation(
      String token, String conversationId) async {
    try {
      final url =
          ApiConstants.conversationDetail.replaceFirst('{id}', conversationId);
      final response = await _dio.get(
        url,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (response.statusCode == 200) {
        print('   Conversation ID: ${response.data['id'] ?? conversationId}');
        print(
            '   Participant: ${response.data['participant']?['name'] ?? 'N/A'}');
        return true;
      }
      return false;
    } catch (e) {
      print('   Error: $e');
      return false;
    }
  }

  static Future<bool> _getMessages(String token, String conversationId) async {
    try {
      final url = ApiConstants.conversationMessages
          .replaceFirst('{id}', conversationId);
      final response = await _dio.get(
        url,
        queryParameters: {'limit': 10, 'offset': 0},
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (response.statusCode == 200) {
        final messages =
            response.data is List ? response.data : response.data['data'] ?? [];
        print('   Found ${(messages is List ? messages.length : 0)} messages');
        return true;
      }
      return false;
    } catch (e) {
      print('   Error: $e');
      return false;
    }
  }

  static Future<bool> _sendMessage(
    String token,
    String conversationId,
    String content,
  ) async {
    try {
      final url = ApiConstants.sendMessage.replaceFirst('{id}', conversationId);
      final response = await _dio.post(
        url,
        data: {'content': content},
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        print('   Message sent: ${response.data['id'] ?? 'unknown'}');
        return true;
      }
      return false;
    } catch (e) {
      print('   Error: $e');
      return false;
    }
  }

  static Future<void> _markAsRead(String token, String conversationId) async {
    try {
      final url =
          ApiConstants.markMessagesAsRead.replaceFirst('{id}', conversationId);
      await _dio.post(
        url,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
    } catch (e) {
      print('   Error: $e');
    }
  }

  /// Test de création de conversation
  static Future<String?> testCreateConversation({
    required String token,
    required String participantId,
    required String firstMessage,
  }) async {
    try {
      print('\n=== Testing Create Conversation ===');

      final response = await _dio.post(
        ApiConstants.conversations,
        data: {
          'participantId': participantId,
          'firstMessage': firstMessage,
        },
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final conversationId = response.data['id'];
        print('✅ Conversation created: $conversationId');
        return conversationId;
      }
      print('❌ Failed to create conversation');
      return null;
    } catch (e) {
      print('❌ Create conversation error: $e');
      return null;
    }
  }
}
