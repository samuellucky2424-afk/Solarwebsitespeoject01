import { supabase } from '../config/supabaseClient';

export interface Conversation {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  status: 'active' | 'closed' | 'waiting_admin';
  created_at: string;
  updated_at: string;
  assigned_admin_id?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'visitor' | 'bot' | 'admin';
  sender_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Create a new conversation
export const createConversation = async (
  name: string,
  email: string,
  phone: string
): Promise<Conversation | null> => {
  try {
    const { data, error } = await supabase
      .from('live_chat_conversations')
      .insert({
        visitor_name: name,
        visitor_email: email,
        visitor_phone: phone,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return data as Conversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
};

// Get conversation by ID
export const getConversation = async (
  conversationId: string
): Promise<Conversation | null> => {
  try {
    const { data, error } = await supabase
      .from('live_chat_conversations')
      .select()
      .eq('id', conversationId)
      .single();

    if (error) throw error;
    return data as Conversation;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
};

// Get all messages for a conversation
export const getConversationMessages = async (
  conversationId: string
): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('live_chat_messages')
      .select()
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as ChatMessage[];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Add a message to conversation
export const addMessage = async (
  conversationId: string,
  senderType: 'visitor' | 'bot' | 'admin',
  message: string,
  senderId?: string
): Promise<ChatMessage | null> => {
  try {
    const { data, error } = await supabase
      .from('live_chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_type: senderType,
        sender_id: senderId || null,
        message
      })
      .select()
      .single();

    if (error) throw error;
    
    // Mark conversation as waiting for admin if visitor message
    if (senderType === 'visitor') {
      await supabase
        .from('live_chat_conversations')
        .update({ status: 'waiting_admin', updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    return data as ChatMessage;
  } catch (error) {
    console.error('Error adding message:', error);
    return null;
  }
};

// Subscribe to messages for a conversation (real-time)
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  const subscription = supabase
    .from(`live_chat_messages:conversation_id=eq.${conversationId}`)
    .on('*', (payload) => {
      // Fetch all messages when there's a change
      getConversationMessages(conversationId).then(callback);
    })
    .subscribe();

  return () => subscription.unsubscribe();
};

// Get all conversations (for admin)
export const getAllConversations = async (): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from('live_chat_conversations')
      .select()
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as Conversation[];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

// Update conversation status
export const updateConversationStatus = async (
  conversationId: string,
  status: 'active' | 'closed' | 'waiting_admin'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('live_chat_conversations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating conversation status:', error);
    return false;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  conversationId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('live_chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('is_read', false);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

// Get unread count for admin
export const getUnreadCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('live_chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('sender_type', 'visitor');

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
};
