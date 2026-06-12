import 'dart:io';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:record/record.dart';
import 'package:just_audio/just_audio.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import '../data/models/message_model.dart';
import '../../../core/constants/app_colors.dart';
import '../providers/message_provider.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final String conversationId;
  final String participantName;
  final String? participantAvatar;

  const ChatScreen({
    super.key,
    required this.conversationId,
    required this.participantName,
    this.participantAvatar,
  });

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen>
    with TickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final AudioRecorder _recorder = AudioRecorder();
  final ImagePicker _imagePicker = ImagePicker();

  bool _isRecording = false;
  bool _hasText = false;
  bool _showAttachMenu = false;
  Duration _recordDuration = Duration.zero;
  Timer? _recordTimer;
  String? _recordingPath;

  late AnimationController _recordPulseController;
  late Animation<double> _recordPulse;

  @override
  void initState() {
    super.initState();
    _messageController.addListener(() {
      final hasText = _messageController.text.trim().isNotEmpty;
      if (hasText != _hasText) setState(() => _hasText = hasText);
    });
    _recordPulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _recordPulse = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _recordPulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _recorder.dispose();
    _recordPulseController.dispose();
    _recordTimer?.cancel();
    super.dispose();
  }

  // ─────────────── scroll ───────────────
  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  // ─────────────── send text ───────────────
  void _sendTextMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;
    ref.read(messageProvider(widget.conversationId).notifier).sendMessage(text);
    _messageController.clear();
    _scrollToBottom();
  }

  // ─────────────── audio ───────────────
  Future<void> _startRecording() async {
    final hasPermission = await _recorder.hasPermission();
    if (!hasPermission) return;

    final dir = await getTemporaryDirectory();
    _recordingPath =
        '${dir.path}/audio_${DateTime.now().millisecondsSinceEpoch}.m4a';

    await _recorder.start(
      RecordConfig(encoder: AudioEncoder.aacLc, bitRate: 128000),
      path: _recordingPath!,
    );

    setState(() {
      _isRecording = true;
      _recordDuration = Duration.zero;
    });
    _recordPulseController.repeat(reverse: true);

    _recordTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _recordDuration += const Duration(seconds: 1));
    });
  }

  Future<void> _stopAndSendRecording() async {
    _recordTimer?.cancel();
    _recordPulseController.stop();
    final path = await _recorder.stop();

    setState(() {
      _isRecording = false;
      _recordDuration = Duration.zero;
    });

    if (path != null) {
      final file = File(path);
      ref
          .read(messageProvider(widget.conversationId).notifier)
          .sendMessage('[Message vocal]', type: 'audio', media: file);
      _scrollToBottom();
    }
  }

  Future<void> _cancelRecording() async {
    _recordTimer?.cancel();
    _recordPulseController.stop();
    await _recorder.stop();
    setState(() {
      _isRecording = false;
      _recordDuration = Duration.zero;
    });
  }

  // ─────────────── media picker ───────────────
  Future<void> _pickImage() async {
    setState(() => _showAttachMenu = false);
    final xFile =
        await _imagePicker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (xFile == null) return;
    ref
        .read(messageProvider(widget.conversationId).notifier)
        .sendMessage('[Image]', type: 'image', media: File(xFile.path));
    _scrollToBottom();
  }

  Future<void> _pickVideo() async {
    setState(() => _showAttachMenu = false);
    final xFile = await _imagePicker.pickVideo(source: ImageSource.gallery);
    if (xFile == null) return;
    ref
        .read(messageProvider(widget.conversationId).notifier)
        .sendMessage('[Vidéo]', type: 'video', media: File(xFile.path));
    _scrollToBottom();
  }

  Future<void> _takePhoto() async {
    setState(() => _showAttachMenu = false);
    final xFile =
        await _imagePicker.pickImage(source: ImageSource.camera, imageQuality: 85);
    if (xFile == null) return;
    ref
        .read(messageProvider(widget.conversationId).notifier)
        .sendMessage('[Photo]', type: 'image', media: File(xFile.path));
    _scrollToBottom();
  }

  String _formatDuration(Duration d) {
    final mm = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final ss = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$mm:$ss';
  }

  // ═══════════════════════════════════════════
  // BUILD
  // ═══════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(messageProvider(widget.conversationId));

    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F8),
      appBar: _buildAppBar(),
      body: Column(
        children: [
          Expanded(
            child: messagesAsync.when(
              data: (messages) {
                WidgetsBinding.instance
                    .addPostFrameCallback((_) => _scrollToBottom());
                if (messages.isEmpty) return _buildEmptyChat();
                return ListView.builder(
                  controller: _scrollController,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  itemCount: messages.length,
                  itemBuilder: (ctx, i) {
                    final msg = messages[i];
                    final showDate = i == 0 ||
                        !_isSameDay(messages[i - 1].createdAt, msg.createdAt);
                    return Column(
                      children: [
                        if (showDate) _buildDateDivider(msg.createdAt),
                        _buildMessageBubble(msg),
                      ],
                    );
                  },
                );
              },
              loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.primary)),
              error: (e, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.wifi_off, size: 48, color: AppColors.textMuted),
                    const SizedBox(height: 12),
                    Text('Impossible de charger les messages',
                        style: TextStyle(color: AppColors.textMuted)),
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      onPressed: () => ref
                          .read(messageProvider(widget.conversationId).notifier)
                          .refresh(),
                      icon: const Icon(Icons.refresh, size: 16),
                      label: const Text('Réessayer'),
                      style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white),
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (_showAttachMenu) _buildAttachMenu(),
          _buildInputBar(),
        ],
      ),
    );
  }

  // ─────────────── AppBar ───────────────
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      titleSpacing: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded,
            size: 18, color: AppColors.textPrimary),
        onPressed: () => Navigator.pop(context),
      ),
      title: Row(
        children: [
          Stack(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: AppColors.primary.withOpacity(0.12),
                backgroundImage: widget.participantAvatar != null
                    ? NetworkImage(widget.participantAvatar!)
                    : null,
                child: widget.participantAvatar == null
                    ? Text(
                        widget.participantName.isNotEmpty
                            ? widget.participantName[0].toUpperCase()
                            : '?',
                        style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w900,
                            fontSize: 18),
                      )
                    : null,
              ),
              Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  width: 11,
                  height: 11,
                  decoration: BoxDecoration(
                    color: AppColors.statusOnline,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(widget.participantName,
                  style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary)),
              const Text('En ligne',
                  style: TextStyle(
                      fontSize: 11,
                      color: AppColors.statusOnline,
                      fontWeight: FontWeight.w600)),
            ],
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.phone_outlined,
              color: AppColors.primary, size: 22),
          onPressed: () {},
        ),
        IconButton(
          icon: const Icon(Icons.videocam_outlined,
              color: AppColors.primary, size: 24),
          onPressed: () {},
        ),
        IconButton(
          icon: const Icon(Icons.more_vert, color: AppColors.textSecondary),
          onPressed: () {},
        ),
      ],
    );
  }

  // ─────────────── Date divider ───────────────
  Widget _buildDateDivider(DateTime date) {
    final now = DateTime.now();
    String label;
    if (_isSameDay(date, now)) {
      label = "Aujourd'hui";
    } else if (_isSameDay(date, now.subtract(const Duration(days: 1)))) {
      label = 'Hier';
    } else {
      label = DateFormat('d MMM yyyy', 'fr_FR').format(date);
    }
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        children: [
          const Expanded(child: Divider()),
          const SizedBox(width: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Text(label,
                style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textMuted,
                    fontWeight: FontWeight.w600)),
          ),
          const SizedBox(width: 12),
          const Expanded(child: Divider()),
        ],
      ),
    );
  }

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  // ─────────────── Empty chat ───────────────
  Widget _buildEmptyChat() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.06),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.chat_bubble_outline_rounded,
                size: 52, color: AppColors.primary),
          ),
          const SizedBox(height: 20),
          const Text('Commencez la conversation',
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary)),
          const SizedBox(height: 6),
          Text('Dites bonjour à ${widget.participantName} !',
              style: const TextStyle(
                  fontSize: 13, color: AppColors.textSecondary)),
        ],
      ),
    );
  }

  // ─────────────── Message bubble ───────────────
  Widget _buildMessageBubble(MessageModel message) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Align(
        alignment:
            message.isMe ? Alignment.centerRight : Alignment.centerLeft,
        child: Column(
          crossAxisAlignment: message.isMe
              ? CrossAxisAlignment.end
              : CrossAxisAlignment.start,
          children: [
            Container(
              constraints: BoxConstraints(
                  maxWidth: MediaQuery.of(context).size.width * 0.72),
              decoration: BoxDecoration(
                color: message.isMe ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(22),
                  topRight: const Radius.circular(22),
                  bottomLeft: Radius.circular(message.isMe ? 22 : 4),
                  bottomRight: Radius.circular(message.isMe ? 4 : 22),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: _buildBubbleContent(message),
            ),
            const SizedBox(height: 3),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  DateFormat('HH:mm').format(message.createdAt),
                  style: const TextStyle(
                      fontSize: 10, color: AppColors.textMuted),
                ),
                if (message.isMe) ...[
                  const SizedBox(width: 4),
                  const Icon(Icons.done_all,
                      size: 13, color: AppColors.primary),
                ],
              ],
            ),
            const SizedBox(height: 6),
          ],
        ),
      ),
    );
  }

  Widget _buildBubbleContent(MessageModel message) {
    switch (message.type) {
      case MessageType.audio:
        return _AudioBubble(
          mediaUrl: message.mediaUrl,
          isMe: message.isMe,
          duration: message.duration ?? const Duration(seconds: 0),
        );
      case MessageType.image:
        return _ImageBubble(
            mediaUrl: message.mediaUrl, isMe: message.isMe);
      case MessageType.video:
        return _VideoBubble(
            mediaUrl: message.mediaUrl, isMe: message.isMe);
      default:
        return Padding(
          padding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Text(
            message.content,
            style: TextStyle(
              color: message.isMe ? Colors.white : AppColors.textPrimary,
              fontSize: 15,
              fontWeight: FontWeight.w500,
              height: 1.4,
            ),
          ),
        );
    }
  }

  // ─────────────── Attach menu ───────────────
  Widget _buildAttachMenu() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _attachButton(
              Icons.image_outlined, 'Galerie', AppColors.primary, _pickImage),
          _attachButton(
              Icons.videocam_outlined, 'Vidéo', AppColors.secondary, _pickVideo),
          _attachButton(
              Icons.camera_alt_outlined, 'Caméra', Colors.teal, _takePhoto),
        ],
      ),
    );
  }

  Widget _attachButton(
      IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 4),
          Text(label,
              style: TextStyle(
                  fontSize: 11, color: color, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  // ─────────────── Input bar ───────────────
  Widget _buildInputBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 16,
              offset: const Offset(0, -4))
        ],
      ),
      child: SafeArea(
        child: _isRecording
            ? _buildRecordingBar()
            : _buildNormalInputBar(),
      ),
    );
  }

  Widget _buildNormalInputBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
      child: Row(
        children: [
          // Attach toggle
          GestureDetector(
            onTap: () =>
                setState(() => _showAttachMenu = !_showAttachMenu),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: _showAttachMenu
                    ? AppColors.primary.withOpacity(0.12)
                    : AppColors.surface,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(
                _showAttachMenu ? Icons.close : Icons.add,
                color: _showAttachMenu
                    ? AppColors.primary
                    : AppColors.textMuted,
                size: 22,
              ),
            ),
          ),
          const SizedBox(width: 10),
          // Text field
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(28),
              ),
              child: TextField(
                controller: _messageController,
                maxLines: 4,
                minLines: 1,
                textCapitalization: TextCapitalization.sentences,
                style: const TextStyle(fontSize: 15),
                decoration: const InputDecoration(
                  hintText: 'Votre message...',
                  hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 15),
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(vertical: 10),
                ),
                onSubmitted: (_) => _sendTextMessage(),
              ),
            ),
          ),
          const SizedBox(width: 10),
          // Send / Record button
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            child: _hasText
                ? _actionButton(
                    key: const ValueKey('send'),
                    icon: Icons.send_rounded,
                    color: AppColors.primary,
                    onTap: _sendTextMessage,
                  )
                : _actionButton(
                    key: const ValueKey('mic'),
                    icon: Icons.mic_none_rounded,
                    color: AppColors.secondary,
                    onTap: _startRecording,
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecordingBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Row(
        children: [
          // Cancel
          GestureDetector(
            onTap: _cancelRecording,
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(Icons.delete_outline,
                  color: Colors.red, size: 22),
            ),
          ),
          const SizedBox(width: 14),
          // Pulse + duration
          Expanded(
            child: Row(
              children: [
                ScaleTransition(
                  scale: _recordPulse,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                        color: Colors.red, shape: BoxShape.circle),
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  _formatDuration(_recordDuration),
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.red),
                ),
                const SizedBox(width: 8),
                Text('Enregistrement...',
                    style: TextStyle(
                        fontSize: 13, color: AppColors.textMuted)),
              ],
            ),
          ),
          // Send recording
          _actionButton(
            key: const ValueKey('sendAudio'),
            icon: Icons.send_rounded,
            color: AppColors.primary,
            onTap: _stopAndSendRecording,
          ),
        ],
      ),
    );
  }

  Widget _actionButton({
    required Key key,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      key: key,
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        child: Icon(icon, color: Colors.white, size: 20),
      ),
    );
  }
}

// ══════════════════════════════════════════════
// Audio Bubble
// ══════════════════════════════════════════════
class _AudioBubble extends StatefulWidget {
  final String? mediaUrl;
  final bool isMe;
  final Duration duration;
  const _AudioBubble(
      {required this.mediaUrl, required this.isMe, required this.duration});
  @override
  State<_AudioBubble> createState() => _AudioBubbleState();
}

class _AudioBubbleState extends State<_AudioBubble> {
  final _player = AudioPlayer();
  bool _isPlaying = false;
  Duration _pos = Duration.zero;

  @override
  void initState() {
    super.initState();
    if (widget.mediaUrl != null) {
      _player.positionStream
          .listen((p) => setState(() => _pos = p));
      _player.playerStateStream.listen((s) {
        if (s.processingState == ProcessingState.completed) {
          setState(() => _isPlaying = false);
        }
      });
    }
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _toggle() async {
    if (widget.mediaUrl == null) return;
    if (_isPlaying) {
      await _player.pause();
      setState(() => _isPlaying = false);
    } else {
      if (_player.duration == null) {
        await _player.setUrl(widget.mediaUrl!);
      }
      await _player.play();
      setState(() => _isPlaying = true);
    }
  }

  String _fmt(Duration d) {
    final mm = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final ss = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$mm:$ss';
  }

  @override
  Widget build(BuildContext context) {
    final total =
        _player.duration ?? widget.duration;
    final progress =
        total.inMilliseconds > 0 ? _pos.inMilliseconds / total.inMilliseconds : 0.0;
    final fgColor = widget.isMe ? Colors.white : AppColors.primary;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onTap: _toggle,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: widget.isMe
                    ? Colors.white.withOpacity(0.2)
                    : AppColors.primary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                  _isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                  size: 22,
                  color: fgColor),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progress.clamp(0.0, 1.0),
                    backgroundColor: fgColor.withOpacity(0.2),
                    color: fgColor,
                    minHeight: 3,
                  ),
                ),
                const SizedBox(height: 4),
                Text(_fmt(_pos),
                    style: TextStyle(
                        fontSize: 10,
                        color: fgColor.withOpacity(0.7),
                        fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          const SizedBox(width: 6),
          Icon(Icons.mic_rounded, size: 14, color: fgColor.withOpacity(0.6)),
        ],
      ),
    );
  }
}

// ══════════════════════════════════════════════
// Image Bubble
// ══════════════════════════════════════════════
class _ImageBubble extends StatelessWidget {
  final String? mediaUrl;
  final bool isMe;
  const _ImageBubble({required this.mediaUrl, required this.isMe});

  @override
  Widget build(BuildContext context) {
    if (mediaUrl == null) {
      return const Padding(
        padding: EdgeInsets.all(12),
        child: Icon(Icons.broken_image_outlined,
            size: 40, color: AppColors.textMuted),
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.only(
        topLeft: const Radius.circular(22),
        topRight: const Radius.circular(22),
        bottomLeft: Radius.circular(isMe ? 22 : 4),
        bottomRight: Radius.circular(isMe ? 4 : 22),
      ),
      child: Image.network(
        mediaUrl!,
        width: 240,
        height: 180,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          width: 240,
          height: 120,
          color: AppColors.surface,
          child: const Icon(Icons.broken_image_outlined,
              size: 40, color: AppColors.textMuted),
        ),
      ),
    );
  }
}

// ══════════════════════════════════════════════
// Video Bubble
// ══════════════════════════════════════════════
class _VideoBubble extends StatelessWidget {
  final String? mediaUrl;
  final bool isMe;
  const _VideoBubble({required this.mediaUrl, required this.isMe});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.only(
        topLeft: const Radius.circular(22),
        topRight: const Radius.circular(22),
        bottomLeft: Radius.circular(isMe ? 22 : 4),
        bottomRight: Radius.circular(isMe ? 4 : 22),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 240,
            height: 160,
            color: Colors.black87,
            child: const Icon(Icons.movie_outlined,
                size: 48, color: Colors.white38),
          ),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.black38,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.play_arrow_rounded,
                size: 28, color: Colors.white),
          ),
        ],
      ),
    );
  }
}
