import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  createConversation,
  addMessage,
  getConversationMessages,
  subscribeToMessages,
  CHAT_UNAVAILABLE_MESSAGE,
  isChatUnavailableError,
} from '../utils/chatService';
import { ChatMessage, Conversation } from '../utils/chatService';

const FALLBACK_SUPPORT_MESSAGE =
  'Live chat is offline right now, but you can still leave a message here. Our team will follow up by email or phone.';
const FALLBACK_CONFIRMATION_MESSAGE =
  'Thanks. Your message has been sent to our support team and they will get back to you soon.';
const FALLBACK_SEND_ERROR_MESSAGE =
  'We could not send your message right now. Please use the support page or call our operations line instead.';
const SUPPORT_PHONE = '+234 903 307 1034';

type DeliveryMode = 'live-chat' | 'email-fallback';
type NotificationType = 'initial-inquiry' | 'follow-up';

const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'chat'>('form');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('live-chat');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [formError, setFormError] = useState('');
  const [chatError, setChatError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const fallbackConversationIdRef = useRef(`fallback-${Date.now()}`);

  useGSAP(() => {
    if (!isOpen || !chatWindowRef.current) {
      return;
    }

    gsap.killTweensOf(chatWindowRef.current);
    gsap.from(chatWindowRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      ease: 'back.out',
    });
  }, { dependencies: [isOpen] });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!conversation) return;

    const unsubscribe = subscribeToMessages(conversation.id, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [conversation]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const buildLocalMessage = (
    senderType: 'visitor' | 'bot' | 'admin',
    message: string
  ): ChatMessage => ({
    id: `${senderType}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    conversation_id: conversation?.id || fallbackConversationIdRef.current,
    sender_type: senderType,
    message,
    is_read: senderType !== 'visitor',
    created_at: new Date().toISOString(),
  });

  const sendNotificationEmail = async (
    message: string,
    fallbackMode: boolean,
    notificationType: NotificationType
  ) => {
    const response = await fetch('/api/send-live-chat-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorName: formData.name,
        visitorEmail: formData.email,
        visitorPhone: formData.phone,
        message,
        conversationId: conversation?.id || fallbackConversationIdRef.current,
        fallbackMode,
        notificationType,
      }),
    });

    if (!response.ok) {
      let errorMessage = FALLBACK_SEND_ERROR_MESSAGE;

      try {
        const data = await response.json();
        if (data?.error) {
          errorMessage = data.error;
        }
      } catch {
        // Ignore JSON parsing errors and use the fallback message.
      }

      throw new Error(errorMessage);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setChatError('');

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
      const newConversation = await createConversation(
        formData.name,
        formData.email,
        formData.phone
      );

      setDeliveryMode('live-chat');
      setConversation(newConversation);
      setCurrentStep('chat');

      const initialMessages = await getConversationMessages(newConversation.id);
      setMessages(initialMessages);

      if (initialMessages.length === 0) {
        const botGreeting = await addMessage(
          newConversation.id,
          'bot',
          `Hello ${formData.name}, thanks for reaching out. How can I help you today?`
        );

        if (botGreeting) {
          setMessages([botGreeting]);
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);

      if (isChatUnavailableError(error)) {
        setDeliveryMode('email-fallback');
        setConversation(null);
        setCurrentStep('chat');
        setMessages([buildLocalMessage('bot', FALLBACK_SUPPORT_MESSAGE)]);
        return;
      }

      setFormError(
        error instanceof Error
          ? error.message
          : CHAT_UNAVAILABLE_MESSAGE
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isLoading) return;
    if (deliveryMode === 'live-chat' && !conversation) return;

    setIsLoading(true);
    setChatError('');

    try {
      if (deliveryMode === 'email-fallback') {
        const visitorMessage = buildLocalMessage('visitor', trimmedMessage);
        setMessages((prev) => [...prev, visitorMessage]);
        setInputValue('');

        await sendNotificationEmail(trimmedMessage, true, 'initial-inquiry');

        const botResponse = buildLocalMessage('bot', FALLBACK_CONFIRMATION_MESSAGE);
        setMessages((prev) => [...prev, botResponse]);
        return;
      }

      const isFirstVisitorMessage = !messages.some(
        (msg) => msg.sender_type === 'visitor'
      );

      const visitorMessage = await addMessage(
        conversation!.id,
        'visitor',
        trimmedMessage,
        undefined
      );

      if (!visitorMessage) {
        setIsLoading(false);
        return;
      }

      setMessages((prev) => [...prev, visitorMessage]);
      setInputValue('');

      if (isFirstVisitorMessage) {
        try {
          await sendNotificationEmail(trimmedMessage, false, 'initial-inquiry');
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
        }
      }

      const botResponse = await addMessage(
        conversation!.id,
        'bot',
        isFirstVisitorMessage
          ? 'Thank you for your message. We have sent your inquiry to our admin team and a customer care representative will respond shortly.'
          : 'Thank you for your message. A customer care representative will respond to you shortly via email or phone call.'
      );

      if (botResponse) {
        setMessages((prev) => [...prev, botResponse]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (deliveryMode === 'email-fallback') {
        setChatError(
          error instanceof Error ? error.message : FALLBACK_SEND_ERROR_MESSAGE
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-30 size-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/40 hover:scale-110 transition-transform flex items-center justify-center group sm:bottom-6 sm:right-6 sm:size-14"
        title="Open live chat"
      >
        <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform sm:text-2xl">
          support_agent
        </span>
        <span className="absolute bottom-0 right-0 size-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
      </button>
    );
  }

  return (
    <div
      ref={chatWindowRef}
      className="fixed bottom-4 right-4 z-40 flex w-[calc(100vw-1rem)] max-w-[320px] flex-col rounded-[1.75rem] bg-white shadow-2xl dark:bg-[#0f2015] sm:bottom-6 sm:right-6 sm:max-w-[340px]"
      style={{ height: 'min(460px, calc(100vh - 5rem))' }}
    >
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-3 rounded-t-[1.75rem] flex items-center justify-between shrink-0 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">support_agent</span>
          </div>
          <div>
            <h3 className="font-bold text-sm">Greenlife Support</h3>
            <p className="text-xs text-white/80">
              {deliveryMode === 'email-fallback'
                ? 'Leave a message for our team'
                : 'We typically reply in minutes'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 sm:p-4">
        {currentStep === 'form' ? (
          <form onSubmit={handleFormSubmit} className="space-y-3 mt-2">
            <p className="text-sm text-forest/70 dark:text-white/70 mb-4">
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
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
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
            {deliveryMode === 'email-fallback' && (
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-sm text-forest dark:text-white">
                <p className="font-semibold mb-2">
                  Messages sent here will be emailed to our support team.
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <a
                    href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-1 text-primary font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">phone</span>
                    {SUPPORT_PHONE}
                  </a>
                  <a
                    href="#/support"
                    className="inline-flex items-center gap-1 text-primary font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Support page
                  </a>
                </div>
              </div>
            )}
            {chatError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                {chatError}
              </div>
            )}
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
                    <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 text-[10px]">
                      {msg.sender_type === 'bot' ? 'AI' : 'CC'}
                    </div>
                  )}
                  <div
                    className={`px-3 py-2 rounded-xl text-sm leading-relaxed break-words ${
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

      {currentStep === 'chat' && (
        <div className="border-t border-gray-200 dark:border-white/10 p-3 shrink-0 sm:p-4">
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
              className="size-10 shrink-0 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center"
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
