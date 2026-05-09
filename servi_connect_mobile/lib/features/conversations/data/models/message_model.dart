enum MessageType { text, audio, image, video }

class MessageModel {
  final String id;
  final String conversationId;
  final String senderId;
  final String content;
  final MessageType type;
  final DateTime createdAt;
  final bool isMe;
  final String? mediaUrl;
  final Duration? duration; // For audio/video

  MessageModel({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.content,
    this.type = MessageType.text,
    required this.createdAt,
    required this.isMe,
    this.mediaUrl,
    this.duration,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json, String currentUserId) {
    return MessageModel(
      id: json['id'],
      conversationId: json['conversationId'],
      senderId: json['senderId'],
      content: json['content'],
      type: _parseType(json['type']),
      createdAt: DateTime.parse(json['createdAt']),
      isMe: json['senderId'] == currentUserId,
      mediaUrl: json['mediaUrl'],
      duration: json['duration'] != null ? Duration(seconds: json['duration']) : null,
    );
  }

  static MessageType _parseType(String? type) {
    switch (type) {
      case 'audio': return MessageType.audio;
      case 'image': return MessageType.image;
      case 'video': return MessageType.video;
      default: return MessageType.text;
    }
  }
}
