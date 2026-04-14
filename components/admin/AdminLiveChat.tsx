import React, { useState, useEffect, useRef } from 'react';
import { getAllConversations, getConversationMessages, addMessage, updateConversationStatus, subscribeToMessages } from '../../utils/chatService';
import { Conversation, ChatMessage } from '../../utils/chatService';

const AdminLiveChat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Subscribe to selected conversation messages
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = subscribeToMessages(
      selectedConversation.id,
      (newMessages) => {
        setMessages(newMessages);
      }
    );

    return () => unsubscribe();
  }, [selectedConversation]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    const allConversations = await getAllConversations();
    setConversations(allConversations);

    // If a conversation is selected, refresh its messages
    if (selectedConversation) {
      const updatedMessages = await getConversationMessages(
        selectedConversation.id
      );
      setMessages(updatedMessages);
    }
  };

  const handleOpenConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    const conversationMessages = await getConversationMessages(conversation.id);
    setMessages(conversationMessages);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyInput.trim() || !selectedConversation || isLoading) return;

    setIsLoading(true);

    try {
      const adminMessage = await addMessage(
        selectedConversation.id,
        'admin',
        replyInput
      );

      if (adminMessage) {
        setMessages((prev) => [...prev, adminMessage]);
        setReplyInput('');

        // Update conversation status
        await updateConversationStatus(
          selectedConversation.id,
          'active'
        );
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
      active: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓' },
      waiting_admin: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: '⏳'
      },
      closed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '×' }
    };

    const config = statusConfig[status] || statusConfig['active'];
    return (
      <span className={`px-2 py-1 text-xs font-bold rounded ${config.bg} ${config.text}`}>
        {config.icon} {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const unreadCount = conversations.filter(
    (c) => c.status === 'waiting_admin'
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-forest dark:text-white">
            Live Chat Support
          </h2>
          <p className="text-forest/60 dark:text-white/60 text-sm mt-1">
            Manage customer conversations in real-time
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 px-4 py-2 rounded-lg">
            <p className="text-red-700 dark:text-red-400 font-bold">
              {unreadCount} Unread {unreadCount === 1 ? 'Message' : 'Messages'}
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-white dark:bg-[#152a17] rounded-2xl border border-forest/5 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-forest dark:text-white">
              Conversations ({conversations.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-white/10">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <span className="material-symbols-outlined text-4xl block mb-2">
                  chat_bubble_outline
                </span>
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleOpenConversation(conv)}
                  className={`w-full text-left p-4 transition-all hover:bg-gray-50 dark:hover:bg-white/5 ${
                    selectedConversation?.id === conv.id
                      ? 'bg-primary/10 border-l-4 border-primary'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-bold text-sm text-forest dark:text-white line-clamp-1">
                      {conv.visitor_name}
                    </p>
                    {conv.status === 'waiting_admin' && (
                      <span className="size-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {conv.visitor_email}
                  </p>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(conv.status)}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat View */}
        <div className="lg:col-span-2 bg-white dark:bg-[#152a17] rounded-2xl border border-forest/5 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-forest dark:text-white">
                      {selectedConversation.visitor_name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedConversation.visitor_email}
                    </p>
                  </div>
                  {getStatusBadge(selectedConversation.status)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Phone: {selectedConversation.visitor_phone}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] flex gap-2 ${msg.sender_type === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {msg.sender_type !== 'admin' && (
                        <div className="size-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                          {msg.sender_type === 'bot' ? '🤖' : '👤'}
                        </div>
                      )}
                      <div
                        className={`px-4 py-2 rounded-xl text-sm break-words ${
                          msg.sender_type === 'admin'
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-gray-100 dark:bg-white/10 text-forest dark:text-white rounded-tl-none'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <div className="border-t border-gray-200 dark:border-white/10 p-4">
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder="Type your reply..."
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/20 text-forest dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!replyInput.trim() || isLoading}
                    className="size-10 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 block mb-4">
                  chat_bubble_outline
                </span>
                <p className="text-gray-500 dark:text-gray-400">
                  Select a conversation to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLiveChat;
