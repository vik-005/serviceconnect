'use client';

import React, { useState, useRef, useEffect } from 'react';
import { sendTyping } from '../../lib/api/conversations';
import { Send, Paperclip, Mic, X, Image as ImageIcon, Video, Music } from 'lucide-react';
import Button from '../ui/Button';

interface MessageInputProps {
  onSend: (text: string, file?: File) => void | Promise<void>;
  conversationId?: number;
  isDisabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, conversationId, isDisabled = false }) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced typing emit
  useEffect(() => {
    if (!conversationId) return;

    if (text.trim() && !isTyping) {
      setIsTyping(true);
      {sendTyping(conversationId, true).catch(console.error);}
    } else if (!text.trim() && isTyping) {
      setIsTyping(false);
      {sendTyping(conversationId, false).catch(console.error);}
    }

    // Auto stop typing after inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        {sendTyping(conversationId, false).catch(console.error);}
      }
    }, 3000);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [text, conversationId, isTyping]);

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice_message.webm', { type: 'audio/webm' });
        
        setIsSending(true);
        try {
          await onSend('', audioFile);
        } finally {
          setIsSending(false);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur accès au microphone:', error);
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    setIsSending(true);
    try {
      await onSend(text);
      setText('');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsSending(true);
    try {
      await onSend('', file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isDisabled && !isSending) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDisabledState = isDisabled || isSending || isRecording;

  return (
    <div className="p-4 bg-white border-t border-gray-100">
      <div className="flex items-end space-x-3 max-w-7xl mx-auto">
        <div className="flex space-x-1 mb-1">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabledState}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Paperclip size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*"
          />
          
          <button 
            disabled={isDisabledState}
            className={`p-2 transition-all rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => isRecording ? stopRecording() : startRecording()}
            title={isRecording ? 'Arrêter enregistrement' : 'Commencer enregistrement'}
          >
            <Mic size={20} />
          </button>
        </div>

        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              // Send typing indicator
              if (conversationId && e.target.value.trim()) {
                sendTyping(conversationId, true).catch(console.error);
                // Reset typing timeout
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                  sendTyping(conversationId, false).catch(console.error);
                }, 1000);
              }
            }}
            onKeyDown={handleKeyPress}
            placeholder="Écrivez votre message..."
            rows={1}
            disabled={isDisabledState}
            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none max-h-32 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <Button 
          onClick={handleSend}
          disabled={!text.trim() || isDisabledState}
          isLoading={isSending}
          className="mb-1 rounded-full p-3 h-11 w-11 flex items-center justify-center"
        >
          <Send size={20} />
        </Button>
      </div>
      
      {isRecording && (
        <div className="mt-2 flex items-center justify-center space-x-4 bg-red-50 p-2 rounded-xl animate-in slide-in-from-bottom duration-300">
          <div className="flex space-x-1 items-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1 bg-red-500 rounded-full animate-bounce" style={{ height: `${Math.random() * 20 + 5}px`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <span className="text-xs font-bold text-red-600">Enregistrement en cours...</span>
          <button 
            onClick={stopRecording} 
            className="text-red-400 hover:text-red-600"
            title="Annuler"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
