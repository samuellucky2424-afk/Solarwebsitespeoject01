import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { createConversation, addMessage, getConversationMessages, subscribeToMessages } from '../utils/chatService';
import { ChatMessage, Conversation } from '../utils/chatService';

const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'chat'>('form');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [formError, setFormError] = useState('');

  // GSAP animations
  useGSAP(() => {
    if (isOpen && containerRef.current) {
      gsap.from('.live-chat-window', {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: 'back.out'
      });
    }
  }, { dependencies: [isOpen], scope: containerRef });

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to messages when conversation is created
  useEffect(() => {
    if (!conversation) return;

    const unsubscribe = subscribeToMessages(conversation.id, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [conversation]);

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.name.trim()) {
      setFormError('Please enter your full name');
      return;
    }
    if (!validateEmail(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Please enter your phone number');
      return;
    }

    setIsLoading(true);

    try {
      // Create conversation
      const newConversation = await createConversation(
        formData.name,
        formData.email,
        formData.phone
      );

      if (!newConversation) {
        setFormError('Failed to start chat. Please try again.');
        setIsLoading(false);
        return;
      }

      setConversation(newConversation);
      setShowForm(false);
      setCurrentStep('chat');

      // Load initial messages
      const initialMessages = await getConversationMessages(newConversation.id);
      setMessages(initialMessages);

      // If no messages yet, add bot greeting
      if (initialMessages.length === 0) {
        const botGreeting = await addMessage(
          newConversation.id,
          'bot',
          `Hello ${formData.name}, Good morning! 👋 How may I help you today?`
        );
        if (botGreeting) {
          setMessages([botGreeting]);
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      setFormError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle message send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !conversation || isLoading) return;

    setIsLoading(true);

    try {
      // Add visitor message
      const visitorMessage = await addMessage(
        conversation.id,
        'visitor',
        inputValue,
        undefined
      );

      if (!visitorMessage) {
        setIsLoading(false);
        return;
      }

      setMessages((prev) => [...prev, visitorMessage]);
      setInputValue('');

      // Send email notification to admin
      try {
        await fetch('/api/send-live-chat-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorName: formData.name,
            visitorEmail: formData.email,
            message: inputValue,
            conversationId: conversation.id
          })
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't block the chat if email fails
      }

      // Add bot response about waiting for admin
      const botResponse = await addMessage(
        conversation.id,
        'bot',
        `Thank you for your message! ✨ A customer care representative will respond to you shortly via email or phone call. We appreciate your patience!`
      );

      if (botResponse) {
        setMessages((prev) => [...prev, botResponse]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 size-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/40 hover:scale-110 transition-transform flex items-center justify-center group"
        title="Open live chat"
      >
        <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
          support_agent
        </span>
        <span className="absolute bottom-0 right-0 size-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-40 w-full max-w-[420px] h-[600px] flex flex-col bg-white dark:bg-[#0f2015] rounded-3xl shadow-2xl live-chat-window"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-4 rounded-t-3xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-base">support_agent</span>
          </div>
          <div>
            <h3 className="font-bold text-sm">Greenlife Support</h3>
            <p className="text-xs text-white/80">We typically reply in minutes</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Messages or Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentStep === 'form' ? (
          <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
            <p className="text-sm text-forest/70 dark:text-white/70 mb-6">
              Please provide your details to start chatting with us.
            </p>

            <div>
              <label className="block text-xs font-bold text-forest dark:text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/20 text-forest dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest dark:text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/20 text-forest dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="john@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest dark:text-white mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/20 text-forest dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+234 803 123 4567"
                disabled={isLoading}
              />
            </div>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 text-xs">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Starting chat...
                </>
              ) : (
                <>
                  <span>Start Chat</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender_type === 'visitor' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-2 max-w-[85%] ${
                    msg.sender_type === 'visitor'
                      ? 'flex-row-reverse'
                      : 'flex-row'
                  }`}
                >
                  {msg.sender_type !== 'visitor' && (
                    <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 text-xs">
                      {msg.sender_type === 'bot' ? '🤖' : '👤'}
                    </div>
                  )}
                  <div
                    className={`px-3 py-2 rounded-xl text-sm break-words ${
                      msg.sender_type === 'visitor'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-white/10 text-forest dark:text-white rounded-bl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      {currentStep === 'chat' && (
        <div className="border-t border-gray-200 dark:border-white/10 p-4 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-black/20 text-forest dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="size-10 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LiveChatWidget;
