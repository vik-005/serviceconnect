'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../lib/types/message';
import { format } from 'date-fns';
import { CheckCheck, Phone, FileIcon, Play, Pause } from 'lucide-react';

const AudioPlayer: React.FC<{ url?: string; isMine: boolean }> = ({ url, isMine }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={`flex items-center space-x-3 p-2 rounded-xl min-w-[220px] ${
      isMine ? 'bg-blue-700/50 text-white' : 'bg-slate-100 text-slate-800'
    }`}>
      <audio ref={audioRef} src={url} preload="metadata" className="hidden" />
      <button 
        onClick={togglePlay}
        className={`p-2 rounded-full flex items-center justify-center transition-all ${
          isMine ? 'bg-white text-blue-600 hover:scale-105' : 'bg-blue-600 text-white hover:scale-105'
        }`}
      >
        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} className="ml-0.5" fill="currentColor" />}
      </button>
      <div className="flex-1 flex flex-col justify-center">
        <div className={`h-1 rounded-full overflow-hidden w-full ${isMine ? 'bg-white/20' : 'bg-slate-200'}`}>
          <div 
            className={`h-full transition-all duration-100 ${isMine ? 'bg-white' : 'bg-blue-600'}`} 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="flex justify-between items-center mt-1 text-[9px] opacity-75 font-semibold">
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMine }) => {
  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <img 
            src={message.mediaUrl} 
            alt="Media" 
            className="rounded-xl max-w-xs cursor-pointer hover:opacity-90 transition-opacity" 
          />
        );
      case 'audio':
        return <AudioPlayer url={message.mediaUrl} isMine={isMine} />;
      case 'video':
        return (
          <div className="relative rounded-xl overflow-hidden max-w-xs group">
            <video src={message.mediaUrl} className="w-full" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 group-hover:bg-black/40 transition-all">
              <Play size={40} className="text-white fill-white" />
            </div>
          </div>
        );
      case 'call_log':
        return (
          <div className="flex items-center space-x-2 py-1 px-2">
            <Phone size={14} className={isMine ? 'text-white' : 'text-blue-500'} />
            <span className="text-xs font-semibold">Appel lancé • 2:45</span>
          </div>
        );
      default:
        return <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>;
    }
  };

  return (
    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-4 px-4`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isMine
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
        }`}
      >
        {renderContent()}
        <div className={`flex items-center justify-end mt-1 space-x-1 opacity-70`}>
          <span className="text-[10px]">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isMine && <CheckCheck size={12} className={message.isRead ? 'text-cyan-400' : 'text-white/60'} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
