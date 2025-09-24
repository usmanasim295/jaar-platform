'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatMessage, Chat } from '@/components/modals/type';
import { MessageSkeleton, EmptyState } from './ChatSkeleton';
import {
  MessageCircle,
  Send,
  Paperclip,
  Mic,
  Image as ImageIcon,
  MicIcon,
} from 'lucide-react';
import { socketService } from '@/lib/socket';

interface ChatMessagesProps {
  chat: Chat | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onSendMessage: (
    content: string,
    type?: 'TEXT' | 'IMAGE' | 'VOICE_NOTE' | 'FILE'
  ) => Promise<void>;
  onUploadFile: (file: File, content: string) => Promise<void>;
  onLoadMore: () => void;
  currentUserId?: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  chat,
  messages,
  loading,
  error,
  hasMore,
  messagesEndRef,
  onSendMessage,
  onUploadFile,
  onLoadMore,
  currentUserId,
}) => {
  const { t } = useTranslation();
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Handle typing indicators
  const handleTypingStart = () => {
    if (!chat || !isTyping) {
      setIsTyping(true);
      socketService.startTyping(chat?.id || '');
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 3000);
  };

  const handleTypingStop = () => {
    if (isTyping) {
      setIsTyping(false);
      socketService.stopTyping(chat?.id || '');
    }
  };

  // Handle message input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    handleTypingStart();
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !chat) return;

    try {
      await onSendMessage(messageInput.trim());
      setMessageInput('');
      handleTypingStop();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chat) return;

    setIsUploading(true);
    try {
      await onUploadFile(file, `Shared ${file.name}`);
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      // Check if MediaRecorder is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported');
      }

      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder API not supported');
      }

      // Request microphone access with better audio quality
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      // Determine the best supported audio format
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      }

      console.log('Using audio format:', mimeType);

      // Create MediaRecorder with proper options
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000, // 128 kbps for good quality
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        console.log('Audio data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');

        if (audioChunksRef.current.length === 0) {
          console.error('No audio data recorded');
          alert('No audio was recorded. Please try again.');
          return;
        }

        // Create blob with the detected mime type
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log(
          'Audio blob created:',
          audioBlob.size,
          'bytes, type:',
          audioBlob.type
        );

        // Determine file extension based on mime type
        let extension = 'webm';
        if (mimeType.includes('mp4')) extension = 'mp4';
        else if (mimeType.includes('wav')) extension = 'wav';

        const audioFile = new File(
          [audioBlob],
          `voice-note-${Date.now()}.${extension}`,
          {
            type: mimeType,
          }
        );

        try {
          // Upload the audio file
          await onUploadFile(audioFile, 'Voice note');
          console.log('Voice note uploaded successfully');
        } catch (uploadError) {
          console.error('Failed to upload voice note:', uploadError);
          alert('Failed to upload voice note. Please try again.');
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = event => {
        console.error('MediaRecorder error:', event);
        alert('Recording error occurred. Please try again.');
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      };

      // Start recording with timeslice for better data handling
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);

      let errorMessage = 'Could not access microphone. ';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Please allow microphone access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No microphone found. Please connect a microphone.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage += 'Audio recording is not supported in this browser.';
        } else {
          errorMessage +=
            'Please check your microphone permissions and try again.';
        }
      } else {
        errorMessage +=
          'Please check your microphone permissions and try again.';
      }

      alert(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        console.log('Stopping recording...');
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setRecordingTime(0);

        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
        setRecordingTime(0);

        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      }
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get message display content
  const getMessageContent = (message: ChatMessage) => {
    // Handle both string and object content formats
    if (typeof message.content === 'string') {
      return message.content;
    }
    if (typeof message.content === 'object' && message.content !== null) {
      return message.content.en || message.content.ar || '';
    }
    return '';
  };

  // Check if message is from current user
  const isCurrentUserMessage = (message: ChatMessage) => {
    return message.senderServiceProviderId === currentUserId;
  };

  // Format message time
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get sender name
  const getSenderName = (message: ChatMessage) => {
    if (message.senderServiceProvider) {
      return (
        message.senderServiceProvider.name?.en ||
        message.senderServiceProvider.name?.ar ||
        'Service Provider'
      );
    }
    if (message.sender) {
      return message.sender.nationalId || 'User';
    }
    return 'Unknown';
  };

  // Get sender avatar
  const getSenderAvatar = (message: ChatMessage) => {
    if (message.senderServiceProvider) {
      const name =
        message.senderServiceProvider.name?.en ||
        message.senderServiceProvider.name?.ar ||
        'Service Provider';
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    }
    if (message.sender) {
      const name = message.sender.nationalId || 'User';
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    }
    return `https://ui-avatars.com/api/?name=User&background=random`;
  };

  // Render message content based on type
  const renderMessageContent = (message: ChatMessage) => {
    switch (message.type) {
      case 'IMAGE':
        return (
          <div className="space-y-2">
            <img
              src={message.fileUrl}
              alt="Shared image"
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
            {getMessageContent(message) && (
              <p className="text-sm">{getMessageContent(message)}</p>
            )}
          </div>
        );

      case 'VOICE_NOTE':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
              <button
                onClick={() => {
                  const audio = new Audio(message.fileUrl);
                  audio.play().catch(console.error);
                }}
                className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              >
                <Mic className="w-4 h-4" />
              </button>
              <div className="flex-1">
                <span className="text-sm font-medium">Voice note</span>
                {message.fileName && (
                  <p className="text-xs text-gray-500">{message.fileName}</p>
                )}
              </div>
            </div>
            {getMessageContent(message) && (
              <p className="text-sm">{getMessageContent(message)}</p>
            )}
          </div>
        );

      case 'FILE':
        const isVideo = message.mimeType?.startsWith('video/');
        const isAudio = message.mimeType?.startsWith('audio/');
        const isImage = message.mimeType?.startsWith('image/');

        if (isVideo) {
          return (
            <div className="space-y-2">
              <video
                src={message.fileUrl}
                controls
                className="max-w-xs rounded-lg"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
              {getMessageContent(message) && (
                <p className="text-sm">{getMessageContent(message)}</p>
              )}
            </div>
          );
        }

        if (isAudio) {
          return (
            <div className="space-y-2">
              <audio
                src={message.fileUrl}
                controls
                className="w-full max-w-xs"
                preload="metadata"
              >
                Your browser does not support the audio tag.
              </audio>
              {getMessageContent(message) && (
                <p className="text-sm">{getMessageContent(message)}</p>
              )}
            </div>
          );
        }

        if (isImage) {
          return (
            <div className="space-y-2">
              <img
                src={message.fileUrl}
                alt={message.fileName || 'Shared image'}
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.fileUrl, '_blank')}
              />
              {getMessageContent(message) && (
                <p className="text-sm">{getMessageContent(message)}</p>
              )}
            </div>
          );
        }

        // Generic file
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
              <Paperclip className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <span className="text-sm font-medium">{message.fileName}</span>
                {message.fileSize && (
                  <p className="text-xs text-gray-500">
                    {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <button
                onClick={() => window.open(message.fileUrl, '_blank')}
                className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
              >
                Download
              </button>
            </div>
            {getMessageContent(message) && (
              <p className="text-sm">{getMessageContent(message)}</p>
            )}
          </div>
        );

      case 'POLL':
        return (
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">📊 Poll</p>
              <p className="text-sm text-blue-700">
                {getMessageContent(message)}
              </p>
            </div>
          </div>
        );

      default:
        return <p className="break-words">{getMessageContent(message)}</p>;
    }
  };

  // Setup typing indicators
  useEffect(() => {
    if (!chat) return;

    const handleUserTyping = (data: {
      chatId: string;
      userId: string;
      isTyping: boolean;
      timestamp: string;
    }) => {
      if (data.chatId === chat.id && data.userId !== currentUserId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      }
    };

    socketService.onUserTyping(handleUserTyping);

    return () => {
      socketService.offUserTyping();
    };
  }, [chat, currentUserId]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  if (loading && messages.length === 0) {
    return <MessageSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Messages"
        description={error}
        icon={MessageCircle}
      />
    );
  }

  if (!chat) {
    return (
      <EmptyState
        title="Select a Chat"
        description="Choose a conversation from the sidebar to start messaging."
        icon={MessageCircle}
      />
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <EmptyState
          title="No Messages Yet"
          description="Start the conversation by sending a message."
          icon={MessageCircle}
        />

        {/* Message Input */}
        <div className="p-3 border-t border-gray-200 flex items-center gap-2">
          <div className="flex items-center p-2 rounded-full bg-gray-100 gap-2 flex-1 h-[50px]">
            <input
              type="text"
              placeholder={t('Type your message...')}
              className="flex-1 rounded-full border-none outline-none text-sm px-4"
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isUploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer p-1 hover:bg-gray-200 rounded"
              disabled={isUploading}
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isUploading}
            className="bg-orange-500 p-2 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {hasMore && (
          <button
            onClick={onLoadMore}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Load more messages
          </button>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`flex items-start gap-2 ${
              isCurrentUserMessage(message) ? 'justify-end' : 'justify-start'
            }`}
          >
            {!isCurrentUserMessage(message) && (
              <img
                src={getSenderAvatar(message)}
                alt={getSenderName(message)}
                width={24}
                height={24}
                className="rounded-full shrink-0"
              />
            )}

            <div
              className={`max-w-[85%] p-3 rounded-xl typo-body font-normal break-words leading-5 ${
                isCurrentUserMessage(message)
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {renderMessageContent(message)}

              <div
                className={`typo-small mt-2.5 leading-4 ${
                  isCurrentUserMessage(message)
                    ? 'text-white/80'
                    : 'text-gray-500'
                }`}
              >
                {formatMessageTime(message.createdAt)}
              </div>
            </div>
          </div>
        ))}

        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-start gap-2 justify-end">
            <div className="max-w-[85%] p-3 rounded-xl bg-red-100 border border-red-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-700 font-medium">
                  Recording... {formatRecordingTime(recordingTime)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Typing indicators */}
        {typingUsers.size > 0 && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
            <div className="bg-gray-100 p-3 rounded-xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-gray-200 flex items-center gap-2">
        <div className="flex items-center p-2 rounded-full bg-gray-100 gap-2 flex-1 h-[50px]">
          <input
            type="text"
            placeholder={t('Type your message...')}
            className="flex-1 rounded-full border-none outline-none text-sm px-4"
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isUploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer p-1 hover:bg-gray-200 rounded"
            disabled={isUploading || isRecording}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`cursor-pointer p-2 rounded-full transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'hover:bg-gray-200 text-gray-600'
            }`}
            disabled={isUploading}
            title={
              isRecording
                ? `Recording... ${formatRecordingTime(recordingTime)}`
                : 'Hold to record voice note'
            }
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
          </button>
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!messageInput.trim() || isUploading}
          className="bg-orange-500 p-2 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  );
};
