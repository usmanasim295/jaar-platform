// 'use client';

// import React, { useState, useRef, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
// import { ChatMessage, Chat } from '@/components/modals/type';
// import { MessageSkeleton, EmptyState } from './ChatSkeleton';
// import {
//   MessageCircle,
//   Send,
//   Paperclip,
//   Mic,
//   Image as ImageIcon,
//   MicIcon,
// } from 'lucide-react';
// import { socketService } from '@/lib/socket';
// // import { AudioPlayer } from './AudioPlayer'; // Commented out for testing video approach
// import { ImageModal } from './ImageModal';
// import { VideoModal } from './VideoModal';
// import ImageCollage from './ImageCollage';

// interface ChatMessagesProps {
//   chat: Chat | null;
//   messages: ChatMessage[];
//   loading: boolean;
//   error: string | null;
//   hasMore: boolean;
//   messagesEndRef: React.RefObject<HTMLDivElement | null>;
//   onSendMessage: (
//     content: string,
//     type?: 'TEXT' | 'IMAGE' | 'VOICE_NOTE' | 'FILE'
//   ) => Promise<void>;
//   onUploadFile: (file: File, content: string) => Promise<void>;
//   onLoadMore: () => void;
//   currentUserId?: string;
// }

// export const ChatMessages: React.FC<ChatMessagesProps> = ({
//   chat,
//   messages,
//   loading,
//   error,
//   hasMore,
//   messagesEndRef,
//   onSendMessage,
//   onUploadFile,
//   onLoadMore,
//   currentUserId,
// }) => {
//   const { t } = useTranslation();
//   const [messageInput, setMessageInput] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
//   const [isUploading, setIsUploading] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordingTime, setRecordingTime] = useState(0);
//   const [isSending, setIsSending] = useState(false);
//   const [pendingMessage, setPendingMessage] = useState<string>('');
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);
//   const recordingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
//   const recordingTimeRef = useRef(0);

//   // Modal states
//   const [imageModal, setImageModal] = useState<{
//     isOpen: boolean;
//     src: string;
//     alt?: string;
//     fileName?: string;
//   }>({ isOpen: false, src: '', alt: '', fileName: '' });

//   const [videoModal, setVideoModal] = useState<{
//     isOpen: boolean;
//     src: string;
//     fileName?: string;
//   }>({ isOpen: false, src: '', fileName: '' });

//   // Handle typing indicators
//   const handleTypingStart = () => {
//     if (!chat) return;

//     // Only send typing start if we're not already typing
//     if (!isTyping) {
//       setIsTyping(true);
//       socketService.startTyping(chat.id);
//     }

//     // Clear existing timeout
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     // Set timeout to stop typing
//     typingTimeoutRef.current = setTimeout(() => {
//       handleTypingStop();
//     }, 3000);
//   };

//   const handleTypingStop = () => {
//     if (isTyping && chat) {
//       setIsTyping(false);
//       socketService.stopTyping(chat.id);
//     }

//     // Clear the timeout
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//       typingTimeoutRef.current = undefined;
//     }
//   };

//   // Handle message input change
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setMessageInput(e.target.value);
//     handleTypingStart();
//   };

//   // Handle send message
//   const handleSendMessage = async () => {
//     if (!messageInput.trim() || !chat || isSending) return;

//     const messageContent = messageInput.trim();

//     try {
//       // Store the message content and clear input immediately
//       setPendingMessage(messageContent);
//       setMessageInput('');
//       setIsSending(true);

//       // Stop typing before sending message
//       handleTypingStop();
//       await onSendMessage(messageContent);
//     } catch (error) {
//       console.error('Failed to send message:', error);
//       // Restore the message to input if sending failed
//       setMessageInput(messageContent);
//     } finally {
//       setIsSending(false);
//       setPendingMessage('');
//     }
//   };

//   // Handle file upload
//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files || !chat) return;

//     setIsUploading(true);
//     try {
//       // Upload all selected files
//       for (let i = 0; i < files.length; i++) {
//         const file = files[i];
//         await onUploadFile(file, `Shared ${file.name}`);
//       }
//     } catch (error) {
//       console.error('Failed to upload files:', error);
//     } finally {
//       setIsUploading(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     }
//   };

//   // Handle key press
//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   // Audio recording functions
//   const startRecording = async () => {
//     try {
//       // Check if MediaRecorder is supported
//       if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//         throw new Error('MediaDevices API not supported');
//       }

//       if (!window.MediaRecorder) {
//         throw new Error('MediaRecorder API not supported');
//       }

//       // Request microphone access with better audio quality
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//           sampleRate: 44100,
//         },
//       });

//       // Determine the best supported audio format
//       let mimeType = 'audio/webm';
//       if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
//         mimeType = 'audio/webm;codecs=opus';
//       } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
//         mimeType = 'audio/mp4';
//       } else if (MediaRecorder.isTypeSupported('audio/wav')) {
//         mimeType = 'audio/wav';
//       }

//       // Create MediaRecorder with proper options
//       const mediaRecorder = new MediaRecorder(stream, {
//         mimeType: mimeType,
//         audioBitsPerSecond: 128000, // 128 kbps for good quality
//       });

//       mediaRecorderRef.current = mediaRecorder;
//       audioChunksRef.current = [];

//       mediaRecorder.ondataavailable = event => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorder.onstop = async () => {
//         // Clear the recording state - timer will be cleared by useEffect
//         setIsRecording(false);
//         setRecordingTime(0);
//         recordingTimeRef.current = 0;

//         if (audioChunksRef.current.length === 0) {
//           console.error('No audio data recorded');
//           alert('No audio was recorded. Please try again.');
//           return;
//         }

//         // Create blob with the detected mime type
//         const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

//         // Determine file extension based on mime type
//         let extension = 'webm';
//         if (mimeType.includes('mp4')) extension = 'mp4';
//         else if (mimeType.includes('wav')) extension = 'wav';

//         const audioFile = new File(
//           [audioBlob],
//           `voice-note-${Date.now()}.${extension}`,
//           {
//             type: mimeType,
//           }
//         );

//         try {
//           // Upload the audio file
//           await onUploadFile(audioFile, 'Voice note');
//         } catch (uploadError) {
//           console.error('Failed to upload voice note:', uploadError);
//           alert('Failed to upload voice note. Please try again.');
//         }

//         // Stop all tracks
//         stream.getTracks().forEach(track => track.stop());
//       };

//       mediaRecorder.onerror = event => {
//         console.error('MediaRecorder error:', event);
//         alert('Recording error occurred. Please try again.');
//         setIsRecording(false);
//         setRecordingTime(0);
//         recordingTimeRef.current = 0;
//         // Timer will be cleared by useEffect
//       };

//       // Start recording with timeslice for better data handling
//       mediaRecorder.start(1000); // Collect data every second
//       setIsRecording(true);
//       setRecordingTime(0);
//       recordingTimeRef.current = 0;
//     } catch (error) {
//       console.error('Error starting recording:', error);

//       let errorMessage = 'Could not access microphone. ';
//       if (error instanceof Error) {
//         if (error.name === 'NotAllowedError') {
//           errorMessage += 'Please allow microphone access and try again.';
//         } else if (error.name === 'NotFoundError') {
//           errorMessage += 'No microphone found. Please connect a microphone.';
//         } else if (error.name === 'NotSupportedError') {
//           errorMessage += 'Audio recording is not supported in this browser.';
//         } else {
//           errorMessage +=
//             'Please check your microphone permissions and try again.';
//         }
//       } else {
//         errorMessage +=
//           'Please check your microphone permissions and try again.';
//       }

//       alert(errorMessage);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       try {
//         mediaRecorderRef.current.stop();
//         // Don't set isRecording to false here - let the onstop event handle it
//         // This ensures the timer keeps running until the recording is actually processed
//       } catch (error) {
//         console.error('Error stopping recording:', error);
//         setIsRecording(false);
//         setRecordingTime(0);
//         recordingTimeRef.current = 0;

//         if (recordingIntervalRef.current) {
//           clearInterval(recordingIntervalRef.current);
//         }
//       }
//     }
//   };

//   const formatRecordingTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Get message display content
//   const getMessageContent = (message: ChatMessage) => {
//     // Handle both string and object content formats
//     if (typeof message.content === 'string') {
//       return message.content;
//     }
//     if (typeof message.content === 'object' && message.content !== null) {
//       return message.content.en || message.content.ar || '';
//     }
//     return '';
//   };

//   // Check if message is from current user
//   const isCurrentUserMessage = (message: ChatMessage) => {
//     return message.senderServiceProviderId === currentUserId;
//   };

//   // Format message time
//   const formatMessageTime = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   // Get sender name
//   const getSenderName = (message: ChatMessage) => {
//     if (message.senderServiceProvider) {
//       return (
//         message.senderServiceProvider.name?.en ||
//         message.senderServiceProvider.name?.ar ||
//         'Service Provider'
//       );
//     }
//     if (message.sender) {
//       return message.sender.nationalId || 'User';
//     }
//     return 'Unknown';
//   };

//   // Get sender avatar
//   const getSenderAvatar = (message: ChatMessage) => {
//     if (message.senderServiceProvider) {
//       const name =
//         message.senderServiceProvider.name?.en ||
//         message.senderServiceProvider.name?.ar ||
//         'Service Provider';
//       return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
//     }
//     if (message.sender) {
//       const name = message.sender.nationalId || 'User';
//       return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
//     }
//     return `https://ui-avatars.com/api/?name=User&background=random`;
//   };

//   // Group consecutive image messages for collage display
//   const groupConsecutiveImages = (messages: ChatMessage[]) => {
//     const grouped: (ChatMessage | ChatMessage[])[] = [];
//     let currentImageGroup: ChatMessage[] = [];

//     for (let i = 0; i < messages.length; i++) {
//       const message = messages[i];
//       const isImage = message.type === 'IMAGE';
//       const isFromSameUser =
//         currentImageGroup.length > 0 &&
//         isCurrentUserMessage(message) ===
//           isCurrentUserMessage(currentImageGroup[0]);

//       if (isImage && isFromSameUser) {
//         currentImageGroup.push(message);
//       } else {
//         if (currentImageGroup.length > 0) {
//           grouped.push(currentImageGroup);
//           currentImageGroup = [];
//         }

//         if (isImage) {
//           currentImageGroup = [message];
//         } else {
//           grouped.push(message);
//         }
//       }
//     }

//     if (currentImageGroup.length > 0) {
//       grouped.push(currentImageGroup);
//     }

//     return grouped;
//   };

//   // Render message content based on type
//   const renderMessageContent = (message: ChatMessage) => {
//     switch (message.type) {
//       case 'IMAGE':
//         return (
//           <div className="space-y-2">
//             <img
//               src={message.fileUrl}
//               alt={message.fileName || 'Shared image'}
//               className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
//               onClick={() =>
//                 setImageModal({
//                   isOpen: true,
//                   src: message.fileUrl || '',
//                   alt: message.fileName || 'Shared image',
//                   fileName: message.fileName || 'image',
//                 })
//               }
//             />
//             {getMessageContent(message) && (
//               <p className="text-sm">{getMessageContent(message)}</p>
//             )}
//           </div>
//         );

//       case 'VOICE_NOTE':
//         return (
//           <div className="space-y-2">
//             {/* AudioPlayer - commented out for testing video approach */}
//             {/* <AudioPlayer
//               src={message.fileUrl || ''}
//               fileName={message.fileName || 'Voice Note'}
//               className="max-w-xs"
//             /> */}

//             {/* Video element for audio playback - browser handles WebM audio better */}
//             <video
//               controls
//               className="max-w-xs rounded-lg"
//               style={{
//                 height: '40px',
//                 width: '250px',
//                 backgroundColor: '#f3f4f6',
//               }}
//             >
//               <source
//                 src={message.fileUrl || ''}
//                 type={message.mimeType || 'audio/webm'}
//               />
//               Your browser does not support the audio element.
//             </video>

//             {getMessageContent(message) && (
//               <p className="text-sm">{getMessageContent(message)}</p>
//             )}
//           </div>
//         );

//       case 'FILE':
//         const isVideo = message.mimeType?.startsWith('video/');
//         const isAudio = message.mimeType?.startsWith('audio/');
//         const isImage = message.mimeType?.startsWith('image/');

//         if (isVideo) {
//           return (
//             <div className="space-y-2">
//               <video
//                 src={message.fileUrl}
//                 controls
//                 className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
//                 preload="metadata"
//                 onClick={() =>
//                   setVideoModal({
//                     isOpen: true,
//                     src: message.fileUrl || '',
//                     fileName: message.fileName || 'Video',
//                   })
//                 }
//               >
//                 Your browser does not support the video tag.
//               </video>
//               {getMessageContent(message) && (
//                 <p className="text-sm">{getMessageContent(message)}</p>
//               )}
//             </div>
//           );
//         }

//         if (isAudio) {
//           return (
//             <div className="space-y-2">
//               {/* AudioPlayer - commented out for testing video tag */}
//               {/* <AudioPlayer
//                 src={message.fileUrl || ''}
//                 fileName={message.fileName || 'Voice Note'}
//                 className="max-w-xs"
//               /> */}

//               {/* Video element for audio playback - browser handles WebM audio better */}
//               <video
//                 controls
//                 className="max-w-xs rounded-lg"
//                 style={{
//                   height: '40px',
//                   width: '250px',
//                   backgroundColor: '#f3f4f6',
//                 }}
//               >
//                 <source
//                   src={message.fileUrl || ''}
//                   type={message.mimeType || 'audio/webm'}
//                 />
//                 Your browser does not support the audio element.
//               </video>

//               {getMessageContent(message) && (
//                 <p className="text-sm">{getMessageContent(message)}</p>
//               )}
//             </div>
//           );
//         }

//         if (isImage) {
//           return (
//             <div className="space-y-2">
//               <img
//                 src={message.fileUrl}
//                 alt={message.fileName || 'Shared image'}
//                 className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
//                 onClick={() =>
//                   setImageModal({
//                     isOpen: true,
//                     src: message.fileUrl || '',
//                     alt: message.fileName || 'Shared image',
//                     fileName: message.fileName || 'image',
//                   })
//                 }
//               />
//               {getMessageContent(message) && (
//                 <p className="text-sm">{getMessageContent(message)}</p>
//               )}
//             </div>
//           );
//         }

//         // Generic file
//         return (
//           <div className="space-y-2">
//             <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
//               <Paperclip className="w-5 h-5 text-gray-600" />
//               <div className="flex-1">
//                 <span className="text-sm font-medium">{message.fileName}</span>
//                 {message.fileSize && (
//                   <p className="text-xs text-gray-500">
//                     {(message.fileSize / 1024 / 1024).toFixed(2)} MB
//                   </p>
//                 )}
//               </div>
//               <button
//                 onClick={() => window.open(message.fileUrl, '_blank')}
//                 className="px-3 py-1 bg-(--primary) text-white text-xs rounded hover:opacity-90 transition-colors"
//               >
//                 Download
//               </button>
//             </div>
//             {getMessageContent(message) && (
//               <p className="text-sm">{getMessageContent(message)}</p>
//             )}
//           </div>
//         );

//       case 'POLL':
//         return (
//           <div className="space-y-2">
//             <div className="p-3 bg-blue-50 rounded-lg">
//               <p className="font-medium text-blue-900">📊 Poll</p>
//               <p className="text-sm text-blue-700">
//                 {getMessageContent(message)}
//               </p>
//             </div>
//           </div>
//         );

//       default:
//         return <p className="break-words">{getMessageContent(message)}</p>;
//     }
//   };

//   // Setup typing indicators
//   useEffect(() => {
//     if (!chat) return;

//     const handleUserTyping = (data: {
//       chatId: string;
//       userId: string;
//       isTyping: boolean;
//       timestamp: string;
//     }) => {
//       if (data.chatId === chat.id && data.userId !== currentUserId) {
//         setTypingUsers(prev => {
//           const newSet = new Set(prev);
//           if (data.isTyping) {
//             newSet.add(data.userId);
//           } else {
//             newSet.delete(data.userId);
//           }
//           return newSet;
//         });
//       }
//     };

//     socketService.onUserTyping(handleUserTyping);

//     return () => {
//       socketService.offUserTyping();
//     };
//   }, [chat, currentUserId]);

//   // Reset typing state when chat changes
//   useEffect(() => {
//     // Reset local typing state when chat changes
//     setIsTyping(false);
//     setTypingUsers(new Set());

//     // Clear any existing timeout
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//       typingTimeoutRef.current = undefined;
//     }
//   }, [chat?.id]);

//   // Cleanup typing timeout
//   useEffect(() => {
//     return () => {
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//     };
//   }, []);

//   // Timer effect for recording
//   useEffect(() => {
//     let intervalId: NodeJS.Timeout | undefined;

//     if (isRecording) {
//       intervalId = setInterval(() => {
//         recordingTimeRef.current += 1;
//         setRecordingTime(recordingTimeRef.current);
//       }, 1000);
//     }

//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };
//   }, [isRecording]);

//   useEffect(() => {
//     if (isRecording || typingUsers.size > 0 || isSending) {
//       setTimeout(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//       }, 100);
//     }
//   }, [isRecording, typingUsers.size, isSending]);

//   useEffect(() => {
//     if (messages.length > 0) {
//       setTimeout(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//       }, 100);
//     }
//   }, [messages.length]);

//   // Cleanup recording on unmount
//   useEffect(() => {
//     return () => {
//       if (isRecording) {
//         stopRecording();
//       }
//       if (recordingIntervalRef.current) {
//         clearInterval(recordingIntervalRef.current);
//       }
//     };
//   }, [isRecording]);

//   if (loading && messages.length === 0) {
//     return <MessageSkeleton />;
//   }

//   if (error) {
//     return (
//       <EmptyState
//         title="Error Loading Messages"
//         description={error}
//         icon={MessageCircle}
//       />
//     );
//   }

//   if (!chat) {
//     return (
//       <EmptyState
//         title="Select a Chat"
//         description="Choose a conversation from the sidebar to start messaging."
//         icon={MessageCircle}
//       />
//     );
//   }

//   if (messages.length === 0) {
//     return (
//       <div className="flex flex-col h-full justify-between">
//         <EmptyState
//           title="No Messages Yet"
//           description="Start the conversation by sending a message."
//           icon={MessageCircle}
//         />

//         {/* Message Input */}
//         <div className="p-3 border-t border-gray-200 flex items-center gap-2">
//           <div className="flex items-center p-2 rounded-full bg-gray-100 gap-2 flex-1 h-[50px]">
//             <input
//               type="text"
//               placeholder={t('Type your message...')}
//               className="flex-1 rounded-full border-none outline-none text-sm px-4"
//               value={messageInput}
//               onChange={handleInputChange}
//               onKeyPress={handleKeyPress}
//               disabled={isUploading}
//             />
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               className="cursor-pointer p-1 hover:bg-gray-200 rounded"
//               disabled={isUploading}
//             >
//               <Paperclip className="w-5 h-5" />
//             </button>
//           </div>
//           <button
//             onClick={handleSendMessage}
//             disabled={!messageInput.trim() || isUploading || isSending}
//             className="bg-(--primary) p-2 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isSending ? (
//               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//             ) : (
//               <Send className="w-5 h-5 text-white" />
//             )}
//           </button>
//         </div>

//         <input
//           ref={fileInputRef}
//           type="file"
//           className="hidden"
//           onChange={handleFileUpload}
//           accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.wmv,.mp4,.mov,.avi"
//           multiple
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full justify-between">
//       {/* Messages */}
//       <div className="flex-1 p-6 space-y-4 overflow-y-auto">
//         {hasMore && (
//           <button
//             onClick={onLoadMore}
//             className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
//           >
//             Load more messages
//           </button>
//         )}

//         {groupConsecutiveImages([...messages].reverse()).map(
//           (messageOrGroup, index) => {
//             // Handle grouped images
//             if (Array.isArray(messageOrGroup)) {
//               const firstMessage = messageOrGroup[0];
//               const isCurrentUser = isCurrentUserMessage(firstMessage);

//               return (
//                 <div
//                   key={`group-${firstMessage.id}`}
//                   className={`flex items-start gap-2 ${
//                     isCurrentUser ? 'justify-end' : 'justify-start'
//                   }`}
//                 >
//                   {!isCurrentUser && (
//                     <img
//                       src={getSenderAvatar(firstMessage)}
//                       alt={getSenderName(firstMessage)}
//                       width={24}
//                       height={24}
//                       className="rounded-full shrink-0"
//                     />
//                   )}

//                   <div
//                     className={`max-w-[85%] p-3 rounded-xl typo-body font-normal break-words leading-5 ${
//                       isCurrentUser
//                         ? 'bg-(--primary) text-white'
//                         : 'bg-gray-100 text-gray-900'
//                     }`}
//                   >
//                     <ImageCollage
//                       images={messageOrGroup.map(msg => ({
//                         src: msg.fileUrl || '',
//                         alt: msg.fileName || 'Shared image',
//                         fileName: msg.fileName || 'image',
//                       }))}
//                       className="max-w-xs"
//                     />

//                     <div
//                       className={`typo-small mt-2.5 leading-4 text-end ${
//                         isCurrentUser ? 'text-white/80' : 'text-gray-500'
//                       }`}
//                     >
//                       {formatMessageTime(firstMessage.createdAt)}
//                     </div>
//                   </div>
//                 </div>
//               );
//             }

//             // Handle single message
//             const message = messageOrGroup;
//             return (
//               <div
//                 key={message.id}
//                 className={`flex items-start gap-2 ${
//                   isCurrentUserMessage(message)
//                     ? 'justify-end'
//                     : 'justify-start'
//                 }`}
//               >
//                 {!isCurrentUserMessage(message) && (
//                   <img
//                     src={getSenderAvatar(message)}
//                     alt={getSenderName(message)}
//                     width={24}
//                     height={24}
//                     className="rounded-full shrink-0"
//                   />
//                 )}

//                 <div
//                   className={`max-w-[85%] p-3 rounded-xl typo-body font-normal break-words leading-5 ${
//                     isCurrentUserMessage(message)
//                       ? 'bg-(--primary) text-white'
//                       : 'bg-gray-100 text-gray-900'
//                   }`}
//                 >
//                   {renderMessageContent(message)}

//                   <div
//                     className={`text-[11px] mt-2.5 leading-0 text-end ${
//                       isCurrentUserMessage(message)
//                         ? 'text-white/80'
//                         : 'text-gray-500'
//                     }`}
//                   >
//                     {formatMessageTime(message.createdAt)}
//                   </div>
//                 </div>
//               </div>
//             );
//           }
//         )}

//         {/* Recording indicator - aligned with chat messages */}
//         {isRecording && (
//           <div className="flex items-start gap-2 justify-end">
//             <div className="max-w-[85%] p-3 rounded-xl bg-red-100 border border-red-200">
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
//                 <span className="text-sm text-red-700 font-medium">
//                   Recording... {formatRecordingTime(recordingTime)}
//                 </span>
//                 <button
//                   onClick={stopRecording}
//                   className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
//                 >
//                   Stop
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Sending indicator - aligned with chat messages */}
//         {isSending && pendingMessage && (
//           <div className="flex items-start gap-2 justify-end">
//             <div className="max-w-[85%] p-3 rounded-xl bg-[#2d6a87]">
//               <div className="space-y-2">
//                 <p className="text-white text-sm break-words">
//                   {pendingMessage}
//                 </p>
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 bg-(--primary) rounded-full animate-pulse" />
//                   <span className="text-xs text-blue-200 font-medium">
//                     Sending...
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Typing indicators */}
//         {typingUsers.size > 0 && (
//           <div className="flex items-start gap-2">
//             <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
//             <div className="bg-gray-100 p-3 rounded-xl">
//               <div className="flex space-x-1">
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
//                 <div
//                   className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                   style={{ animationDelay: '0.1s' }}
//                 />
//                 <div
//                   className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                   style={{ animationDelay: '0.2s' }}
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Message Input */}
//       <div className="p-3 border-t border-gray-200 flex items-center gap-2">
//         <div className="flex items-center p-2 rounded-full bg-gray-100 gap-2 flex-1 h-[50px]">
//           <input
//             type="text"
//             placeholder={t('Type your message...')}
//             className="flex-1 rounded-full border-none outline-none text-sm px-4"
//             value={messageInput}
//             onChange={handleInputChange}
//             onKeyPress={handleKeyPress}
//             disabled={isUploading}
//           />
//           <button
//             onClick={() => fileInputRef.current?.click()}
//             className="cursor-pointer p-1 hover:bg-gray-200 rounded"
//             disabled={isUploading || isRecording}
//           >
//             <Paperclip className="w-5 h-5" />
//           </button>
//           <div className="relative">
//             <button
//               onMouseDown={startRecording}
//               onMouseUp={stopRecording}
//               onMouseLeave={stopRecording}
//               onTouchStart={startRecording}
//               onTouchEnd={stopRecording}
//               className={`cursor-pointer p-2 rounded-full transition-all duration-200 ${
//                 isRecording
//                   ? 'bg-red-500 text-white animate-pulse'
//                   : 'hover:bg-gray-200 text-gray-600'
//               }`}
//               disabled={isUploading}
//               title={
//                 isRecording
//                   ? `Recording... ${formatRecordingTime(recordingTime)} - Click Stop to finish`
//                   : 'Hold to record voice note'
//               }
//             >
//               <Mic
//                 className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`}
//               />
//             </button>
//             {isRecording && (
//               <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
//                 {formatRecordingTime(recordingTime)}
//               </span>
//             )}
//           </div>
//         </div>
//         <button
//           onClick={handleSendMessage}
//           disabled={!messageInput.trim() || isUploading || isSending}
//           className="bg-(--primary) p-2 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {isUploading || isSending ? (
//             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//           ) : (
//             <Send className="w-5 h-5 text-white" />
//           )}
//         </button>
//       </div>

//       <input
//         ref={fileInputRef}
//         type="file"
//         className="hidden"
//         onChange={handleFileUpload}
//         accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.wmv,.mp4,.mov,.avi"
//         multiple
//       />

//       {/* Image Modal */}
//       <ImageModal
//         isOpen={imageModal.isOpen}
//         onClose={() => setImageModal(prev => ({ ...prev, isOpen: false }))}
//         src={imageModal.src}
//         alt={imageModal.alt}
//         fileName={imageModal.fileName}
//       />

//       {/* Video Modal */}
//       <VideoModal
//         isOpen={videoModal.isOpen}
//         onClose={() => setVideoModal(prev => ({ ...prev, isOpen: false }))}
//         src={videoModal.src}
//         fileName={videoModal.fileName}
//       />
//     </div>
//   );
// };

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
import { ImageModal } from './ImageModal';
import { VideoModal } from './VideoModal';
import ImageCollage from './ImageCollage';
import { toast } from 'react-toastify';

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
  const [isSending, setIsSending] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const recordingTimeRef = useRef(0);
  const isRecordingInProgressRef = useRef(false);

  // Modal states
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    src: string;
    alt?: string;
    fileName?: string;
  }>({ isOpen: false, src: '', alt: '', fileName: '' });

  const [videoModal, setVideoModal] = useState<{
    isOpen: boolean;
    src: string;
    fileName?: string;
  }>({ isOpen: false, src: '', fileName: '' });

  // Handle typing indicators
  const handleTypingStart = () => {
    if (!chat) return;

    // Only send typing start if we're not already typing
    if (!isTyping) {
      setIsTyping(true);
      socketService.startTyping(chat.id);
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
    if (isTyping && chat) {
      setIsTyping(false);
      socketService.stopTyping(chat.id);
    }

    // Clear the timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = undefined;
    }
  };

  // Handle message input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    handleTypingStart();
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !chat || isSending) return;

    const messageContent = messageInput.trim();

    try {
      // Store the message content and clear input immediately
      setPendingMessage(messageContent);
      setMessageInput('');
      setIsSending(true);

      // Stop typing before sending message
      handleTypingStop();
      await onSendMessage(messageContent);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore the message to input if sending failed
      setMessageInput(messageContent);
    } finally {
      setIsSending(false);
      setPendingMessage('');
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !chat) return;

    // Validate file sizes (5MB limit per file)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const filesArray = Array.from(files);
    const oversizedFiles = filesArray.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast.error(t('File too large. Please choose a file smaller than 5MB.'));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);
    try {
      // Upload all selected files
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        await onUploadFile(file, `Shared ${file.name}`);
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
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
    // Prevent multiple simultaneous recordings
    if (isRecordingInProgressRef.current || isRecording) {
      return;
    }

    isRecordingInProgressRef.current = true;

    try {
      // Clean up any existing recording first
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        // Wait for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 300));
      }

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

      // Prioritize M4A, then MP3, then fallback to WebM
      let mimeType = 'audio/mp4'; // Default to M4A
      let extension = 'm4a';
      if (!MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mpeg'; // Try MP3
        extension = 'mp3';
        if (!MediaRecorder.isTypeSupported('audio/mpeg')) {
          mimeType = 'audio/webm;codecs=opus'; // Fallback to WebM with Opus
          extension = 'webm';
          if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm';
            extension = 'webm';
            if (!MediaRecorder.isTypeSupported('audio/webm')) {
              throw new Error('No supported audio format available');
            }
          }
        }
      }

      // Create MediaRecorder with proper options
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000, // 128 kbps for good quality
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Clear the recording state - timer will be cleared by useEffect
        setIsRecording(false);
        setRecordingTime(0);
        recordingTimeRef.current = 0;

        // Store chunks in a local variable to prevent race conditions
        const audioChunks = [...audioChunksRef.current];

        if (audioChunks.length === 0) {
          alert('No audio was recorded. Please try again.');
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        // Create blob with the detected mime type
        const audioBlob = new Blob(audioChunks, { type: mimeType });

        const audioFile = new File(
          [audioBlob],
          `voice-note-${Date.now()}.${extension}`,
          {
            type: mimeType,
          }
        );

        try {
          // Set uploading state
          setIsUploadingAudio(true);
          // Upload the audio file
          await onUploadFile(audioFile, 'Voice note');
        } catch (uploadError) {
          console.error('Failed to upload voice note:', uploadError);
          alert('Failed to upload voice note. Please try again.');
        } finally {
          // Clear uploading state
          setIsUploadingAudio(false);
          // Always stop all tracks and clean up
          stream.getTracks().forEach(track => track.stop());
          // Clear references after a short delay to avoid race conditions
          setTimeout(() => {
            // Only clear if this is still the same MediaRecorder
            if (mediaRecorderRef.current === mediaRecorder) {
              mediaRecorderRef.current = null;
            }
            audioChunksRef.current = [];
            isRecordingInProgressRef.current = false;
          }, 500);
        }
      };

      mediaRecorder.onerror = event => {
        console.error('MediaRecorder error:', event);
        alert('Recording error occurred. Please try again.');
        setIsRecording(false);
        setRecordingTime(0);
        recordingTimeRef.current = 0;
        // Stop all tracks and clean up
        stream.getTracks().forEach(track => track.stop());
        // Clear references after a short delay to avoid race conditions
        setTimeout(() => {
          // Only clear if this is still the same MediaRecorder
          if (mediaRecorderRef.current === mediaRecorder) {
            mediaRecorderRef.current = null;
          }
          audioChunksRef.current = [];
          isRecordingInProgressRef.current = false;
        }, 500);
        // Timer will be cleared by useEffect
      };

      // Start recording with timeslice for better data handling
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;
    } catch (error) {
      console.error('Error starting recording:', error);
      isRecordingInProgressRef.current = false;

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
    if (isRecording) {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === 'recording'
      ) {
        try {
          mediaRecorderRef.current.stop();
          // Don't set isRecording to false here - let the onstop event handle it
          // This ensures the timer keeps running until the recording is actually processed
        } catch (error) {
          console.error('Error stopping recording:', error);
          setIsRecording(false);
          setRecordingTime(0);
          recordingTimeRef.current = 0;
          isRecordingInProgressRef.current = false;

          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
          }
        }
      } else {
        // Force stop if MediaRecorder is not available
        setIsRecording(false);
        setRecordingTime(0);
        recordingTimeRef.current = 0;
        isRecordingInProgressRef.current = false;

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

  // Group consecutive image messages for collage display
  const groupConsecutiveImages = (messages: ChatMessage[]) => {
    const grouped: (ChatMessage | ChatMessage[])[] = [];
    let currentImageGroup: ChatMessage[] = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const isImage = message.type === 'IMAGE';
      const isFromSameUser =
        currentImageGroup.length > 0 &&
        isCurrentUserMessage(message) ===
          isCurrentUserMessage(currentImageGroup[0]);

      if (isImage && isFromSameUser) {
        currentImageGroup.push(message);
      } else {
        if (currentImageGroup.length > 0) {
          grouped.push(currentImageGroup);
          currentImageGroup = [];
        }

        if (isImage) {
          currentImageGroup = [message];
        } else {
          grouped.push(message);
        }
      }
    }

    if (currentImageGroup.length > 0) {
      grouped.push(currentImageGroup);
    }

    return grouped;
  };

  // Render message content based on type
  const renderMessageContent = (message: ChatMessage) => {
    switch (message.type) {
      case 'IMAGE':
        return (
          <div className="space-y-1.5 sm:space-y-2">
            <img
              src={message.fileUrl}
              alt={message.fileName || 'Shared image'}
              className="max-w-[200px] sm:max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() =>
                setImageModal({
                  isOpen: true,
                  src: message.fileUrl || '',
                  alt: message.fileName || 'Shared image',
                  fileName: message.fileName || 'image',
                })
              }
            />
            {getMessageContent(message) && (
              <p className="text-xs sm:text-sm">{getMessageContent(message)}</p>
            )}
          </div>
        );

      case 'VOICE_NOTE':
        return (
          <div className="space-y-1.5 sm:space-y-2">
            <video
              controls
              className="max-w-[250px] sm:max-w-xs rounded-lg"
              style={{
                height: '36px',
                width: '250px',
                backgroundColor: '#f3f4f6',
              }}
            >
              <source
                src={message.fileUrl || ''}
                type={message.mimeType || 'audio/mp4'}
              />
              Your browser does not support the audio element.
            </video>

            {getMessageContent(message) && (
              <p className="text-xs sm:text-sm">{getMessageContent(message)}</p>
            )}
          </div>
        );

      case 'FILE':
        const isVideo = message.mimeType?.startsWith('video/');
        const isAudio = message.mimeType?.startsWith('audio/');
        const isImage = message.mimeType?.startsWith('image/');

        if (isVideo) {
          return (
            <div className="space-y-1.5 sm:space-y-2">
              <video
                src={message.fileUrl}
                controls
                className="max-w-[200px] sm:max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                preload="metadata"
                onClick={() =>
                  setVideoModal({
                    isOpen: true,
                    src: message.fileUrl || '',
                    fileName: message.fileName || 'Video',
                  })
                }
              >
                Your browser does not support the video tag.
              </video>
              {getMessageContent(message) && (
                <p className="text-xs sm:text-sm">
                  {getMessageContent(message)}
                </p>
              )}
            </div>
          );
        }

        if (isAudio) {
          return (
            <div className="space-y-1.5 sm:space-y-2">
              <video
                controls
                className="max-w-[250px] sm:max-w-sm rounded-lg"
                style={{
                  height: '36px',
                  width: '250px',
                  backgroundColor: '#f3f4f6',
                }}
              >
                <source
                  src={message.fileUrl || ''}
                  type={message.mimeType || 'audio/mp4'}
                />
                Your browser does not support the audio element.
              </video>

              {getMessageContent(message) && (
                <p className="text-xs sm:text-sm">
                  {getMessageContent(message)}
                </p>
              )}
            </div>
          );
        }

        if (isImage) {
          return (
            <div className="space-y-1.5 sm:space-y-2">
              <img
                src={message.fileUrl}
                alt={message.fileName || 'Shared image'}
                className="max-w-[200px] sm:max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() =>
                  setImageModal({
                    isOpen: true,
                    src: message.fileUrl || '',
                    alt: message.fileName || 'Shared image',
                    fileName: message.fileName || 'image',
                  })
                }
              />
              {getMessageContent(message) && (
                <p className="text-xs sm:text-sm">
                  {getMessageContent(message)}
                </p>
              )}
            </div>
          );
        }

        // Generic file
        return (
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-100 rounded-lg">
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-medium truncate block">
                  {message.fileName}
                </span>
                {message.fileSize && (
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <button
                onClick={() => window.open(message.fileUrl, '_blank')}
                className="px-2 sm:px-3 py-0.5 sm:py-1 bg-(--primary) text-white text-[10px] sm:text-xs rounded hover:opacity-90 transition-colors flex-shrink-0"
              >
                {t('Download')}
              </button>
            </div>
            {getMessageContent(message) && (
              <p className="text-xs sm:text-sm">{getMessageContent(message)}</p>
            )}
          </div>
        );

      case 'POLL':
        return (
          <div className="space-y-1.5 sm:space-y-2">
            <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-xs sm:text-sm text-blue-900">
                📊 {t('Poll')}
              </p>
              <p className="text-xs sm:text-sm text-blue-700">
                {getMessageContent(message)}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <p className="break-words text-xs sm:text-sm">
            {getMessageContent(message)}
          </p>
        );
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

  // Reset typing state when chat changes
  useEffect(() => {
    // Reset local typing state when chat changes
    setIsTyping(false);
    setTypingUsers(new Set());

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = undefined;
    }
  }, [chat?.id]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Timer effect for recording
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isRecording) {
      intervalId = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime(recordingTimeRef.current);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (isRecording || typingUsers.size > 0 || isSending) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isRecording, typingUsers.size, isSending]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length]);

  // Cleanup recording on unmount or chat change
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      // Clean up MediaRecorder and audio chunks
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
      }
      audioChunksRef.current = [];
      isRecordingInProgressRef.current = false;
    };
  }, [chat?.id]);

  // Additional cleanup when recording state changes
  useEffect(() => {
    if (!isRecording && mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      // Don't clear the reference here, let the onstop event handle it
    }
  }, [isRecording]);

  if (loading && messages.length === 0) {
    return <MessageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <EmptyState
          title={t('Error Loading Messages')}
          description={error}
          icon={MessageCircle}
        />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <EmptyState
          title={t('Select a Chat')}
          description={t(
            'Choose a conversation from the sidebar to start messaging.'
          )}
          icon={MessageCircle}
        />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            title={t('No Messages Yet')}
            description={t('Start the conversation by sending a message.')}
            icon={MessageCircle}
          />
        </div>

        {/* Message Input */}
        <div className="p-2 sm:p-3 border-t border-gray-200 flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="flex items-center p-1.5 sm:p-2 rounded-full bg-gray-100 gap-1 sm:gap-2 flex-1 h-10 sm:h-12 md:h-[50px]">
            <input
              type="text"
              placeholder={t('Type your message...')}
              className="flex-1 rounded-full border-none outline-none text-xs sm:text-sm px-2 sm:px-3 md:px-4 bg-transparent"
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isUploading || isUploadingAudio}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer p-1 hover:bg-gray-200 rounded flex-shrink-0"
              disabled={isUploading || isUploadingAudio}
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={
              !messageInput.trim() ||
              isUploading ||
              isSending ||
              isUploadingAudio
            }
            className="bg-(--primary) p-2 sm:p-2.5 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isSending || isUploadingAudio ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            )}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.wmv,.mp4,.mov,.avi"
          multiple
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        className="flex-1 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 overflow-y-auto min-h-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 #F7FAFC',
        }}
      >
        {hasMore && (
          <button
            onClick={onLoadMore}
            className="w-full py-1.5 sm:py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700"
          >
            {t('Load more messages')}
          </button>
        )}

        {groupConsecutiveImages([...messages].reverse()).map(
          (messageOrGroup, index) => {
            // Handle grouped images
            if (Array.isArray(messageOrGroup)) {
              const firstMessage = messageOrGroup[0];
              const isCurrentUser = isCurrentUserMessage(firstMessage);

              return (
                <div
                  key={`group-${firstMessage.id}`}
                  className={`flex items-start gap-1.5 sm:gap-2 ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isCurrentUser && (
                    <img
                      src={getSenderAvatar(firstMessage)}
                      alt={getSenderName(firstMessage)}
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-[24px] md:h-[24px] rounded-full shrink-0"
                    />
                  )}

                  <div
                    className={`max-w-[90%] sm:max-w-[85%] p-2 sm:p-2.5 md:p-3 rounded-xl text-sm sm:typo-body font-normal break-words leading-5 ${
                      isCurrentUser
                        ? 'bg-(--primary) text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <ImageCollage
                      images={messageOrGroup.map(msg => ({
                        src: msg.fileUrl || '',
                        alt: msg.fileName || 'Shared image',
                        fileName: msg.fileName || 'image',
                      }))}
                      className="max-w-[200px] sm:max-w-xs"
                    />

                    <div
                      className={`text-[10px] sm:typo-small mt-2 sm:mt-2.5 leading-4 text-end ${
                        isCurrentUser ? 'text-white/80' : 'text-gray-500'
                      }`}
                    >
                      {formatMessageTime(firstMessage.createdAt)}
                    </div>
                  </div>
                </div>
              );
            }

            // Handle single message
            const message = messageOrGroup;
            return (
              <div
                key={message.id}
                className={`flex items-start gap-1.5 sm:gap-2 ${
                  isCurrentUserMessage(message)
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                {!isCurrentUserMessage(message) && (
                  <img
                    src={getSenderAvatar(message)}
                    alt={getSenderName(message)}
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-[24px] md:h-[24px] rounded-full shrink-0"
                  />
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[85%] p-2 sm:p-2.5 md:p-3 rounded-xl text-sm sm:typo-body font-normal break-words leading-5 ${
                    isCurrentUserMessage(message)
                      ? 'bg-(--primary) text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {renderMessageContent(message)}

                  <div
                    className={`text-[10px] sm:text-[11px] mt-2 sm:mt-2.5 leading-0 text-end ${
                      isCurrentUserMessage(message)
                        ? 'text-white/80'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          }
        )}

        {/* Recording indicator - aligned with chat messages */}
        {isRecording && (
          <div className="flex items-start gap-1.5 sm:gap-2 justify-end">
            <div className="max-w-[90%] sm:max-w-[85%] p-2 sm:p-3 rounded-xl bg-red-100 border border-red-200">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm text-red-700 font-medium">
                  {t('Recording...')} {formatRecordingTime(recordingTime)}
                </span>
                <button
                  onClick={stopRecording}
                  className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500 text-white text-[10px] sm:text-xs rounded hover:bg-red-600 transition-colors"
                >
                  {t('Stop')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Audio uploading indicator - aligned with chat messages */}
        {isUploadingAudio && (
          <div className="flex items-start gap-1.5 sm:gap-2 justify-end">
            <div className="max-w-[90%] sm:max-w-[85%] p-2 sm:p-3 rounded-xl bg-blue-100 border border-blue-200">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs sm:text-sm text-blue-700 font-medium">
                  {t('Uploading audio...')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sending indicator - aligned with chat messages */}
        {isSending && pendingMessage && (
          <div className="flex items-start gap-1.5 sm:gap-2 justify-end">
            <div className="max-w-[90%] sm:max-w-[85%] p-2 sm:p-2.5 md:p-3 rounded-xl bg-[#2d6a87]">
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-white text-xs sm:text-sm break-words">
                  {pendingMessage}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-(--primary) rounded-full animate-pulse" />
                  <span className="text-[10px] sm:text-xs text-blue-200 font-medium">
                    {t('Sending...')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Typing indicators */}
        {typingUsers.size > 0 && (
          <div className="flex items-start gap-1.5 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 rounded-full animate-pulse" />
            <div className="bg-gray-100 p-2 sm:p-3 rounded-xl">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-2 sm:p-3 border-t border-gray-200 flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <div className="flex items-center p-1.5 sm:p-2 rounded-full bg-gray-100 gap-1 sm:gap-2 flex-1 h-10 sm:h-12 md:h-[50px]">
          <input
            type="text"
            placeholder={t('Type your message...')}
            className="flex-1 rounded-full border-none outline-none text-xs sm:text-sm px-2 sm:px-3 md:px-4 bg-transparent"
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isUploading || isUploadingAudio}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer p-1 hover:bg-gray-200 rounded flex-shrink-0"
            disabled={isUploading || isRecording || isUploadingAudio}
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="relative flex-shrink-0">
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`cursor-pointer p-1 sm:p-2 rounded-full transition-all duration-200 ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
              disabled={isUploading}
              title={
                isRecording
                  ? `${t('Recording...')} ${formatRecordingTime(recordingTime)} - ${t('Click Stop to finish')}`
                  : t('Hold to record voice note')
              }
            >
              <Mic
                className={`w-4 h-4 sm:w-5 sm:h-5 ${isRecording ? 'animate-pulse' : ''}`}
              />
            </button>
            {isRecording && (
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap z-10">
                {formatRecordingTime(recordingTime)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleSendMessage}
          disabled={
            !messageInput.trim() || isUploading || isSending || isUploadingAudio
          }
          className="bg-(--primary) p-2 sm:p-2.5 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {isUploading || isSending || isUploadingAudio ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.wmv,.mp4,.mov,.avi"
        multiple
      />

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal(prev => ({ ...prev, isOpen: false }))}
        src={imageModal.src}
        alt={imageModal.alt}
        fileName={imageModal.fileName}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal(prev => ({ ...prev, isOpen: false }))}
        src={videoModal.src}
        fileName={videoModal.fileName}
      />
    </div>
  );
};
