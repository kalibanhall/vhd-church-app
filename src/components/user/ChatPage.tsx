'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Smile, 
  Users, 
  Hash,
  Lock,
  Megaphone,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Reply,
  Heart,
  ThumbsUp,
  Laugh
} from 'lucide-react';
import { ChatChannel, ChatMessage, OnlineStatus } from '../../types';
import { mockChatChannels, mockChatMessages, mockUsers, mockOnlineStatus } from '../../lib/mockData';

const ChatPage: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(mockChatChannels[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredChannels = mockChatChannels.filter((channel: ChatChannel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const channelMessages = messages.filter(msg => msg.channelId === selectedChannel?.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [channelMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'user1',
      senderName: 'Jean Dupont',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      channelId: selectedChannel.id,
      content: newMessage,
      messageType: 'text',
      timestamp: new Date().toISOString(),
      isEdited: false,
      reactions: [],
      isDeleted: false
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find((r: any) => r.userId === 'user1' && r.emoji === emoji);
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions.filter((r: any) => r.id !== existingReaction.id)
          };
        } else {
          return {
            ...msg,
            reactions: [...msg.reactions, {
              id: `reaction_${Date.now()}`,
              messageId,
              userId: 'user1',
              emoji,
              timestamp: new Date().toISOString()
            }]
          };
        }
      }
      return msg;
    }));
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'public': return <Hash className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      case 'announcement': return <Megaphone className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getOnlineStatus = (userId: string) => {
    const status = mockOnlineStatus.find((s: OnlineStatus) => s.userId === userId);
    return status?.status || 'offline';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd&apos;hui';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    }
    
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Sidebar - Channels */}
      <div className="w-80 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Discussions</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un canal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-y-auto h-full">
          {filteredChannels.map((channel: ChatChannel) => (
            <div
              key={channel.id}
              onClick={() => setSelectedChannel(channel)}
              className={`p-4 cursor-pointer transition-colors hover:bg-white ${
                selectedChannel?.id === channel.id ? 'bg-white border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  channel.type === 'announcement' ? 'bg-red-100 text-red-600' :
                  channel.type === 'private' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {getChannelIcon(channel.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{channel.name}</h3>
                  {channel.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {channel.lastMessage.senderName}: {channel.lastMessage.content}
                    </p>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {channel.lastMessage && formatTime(channel.lastMessage.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedChannel.type === 'announcement' ? 'bg-red-100 text-red-600' :
                    selectedChannel.type === 'private' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {getChannelIcon(selectedChannel.type)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedChannel.name}</h2>
                    {selectedChannel.description && (
                      <p className="text-sm text-gray-500">{selectedChannel.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    {selectedChannel.memberIds.length}
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {channelMessages.map((message, index) => {
                const showDate = index === 0 || 
                  formatDate(message.timestamp) !== formatDate(channelMessages[index - 1].timestamp);
                
                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                          {formatDate(message.timestamp)}
                        </div>
                      </div>
                    )}
                    
                    <div className="group flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg">
                      <div className="relative">
                        <img
                          src={message.senderAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                          alt={message.senderName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          getOnlineStatus(message.senderId) === 'online' ? 'bg-green-500' :
                          getOnlineStatus(message.senderId) === 'away' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-medium text-gray-900">{message.senderName}</span>
                          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                        </div>
                        
                        <div className="text-gray-700 break-words">{message.content}</div>
                        
                        {message.reactions.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {Object.entries(
                              message.reactions.reduce((acc: Record<string, number>, reaction: any) => {
                                acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                            ).map(([emoji, count]: [string, number]) => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(message.id, emoji)}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition-colors"
                              >
                                <span>{emoji}</span>
                                <span className="text-gray-600">{count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <button
                          onClick={() => addReaction(message.id, '👍')}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addReaction(message.id, '❤️')}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                          <Reply className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Tapez votre message..."
                      className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={1}
                    />
                    <div className="absolute right-2 bottom-2 flex gap-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Sélectionnez un canal pour commencer la discussion</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;