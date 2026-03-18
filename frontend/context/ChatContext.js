import React, { createContext, useContext, useEffect, useState } from 'react';
import { createChatRoom, getMessages, sendMessage } from '../services/chatService';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
    }
  }, [chatId]);

  const createChat = async (advisorId) => {
    setLoading(true);

    try {
      const response = await createChatRoom(advisorId);
      const nextChatId = response?.chatId || null;

      if (!nextChatId) {
        throw new Error('Unable to initialize chat room');
      }

      setChatId(nextChatId);
      return response;
    } catch (error) {
      const errorMessage =
        error?.message || 'Please complete payment to start consultation chat';
      console.error('createChat error:', error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (targetChatId) => {
    const activeChatId = targetChatId || chatId;

    if (!activeChatId) {
      setMessages([]);
      return [];
    }

    setLoading(true);

    try {
      const chatMessages = await getMessages(activeChatId);
      setChatId(activeChatId);
      setMessages(Array.isArray(chatMessages) ? chatMessages : []);
      return chatMessages;
    } catch (error) {
      const errorMessage = error?.message || 'Unable to load messages right now';
      console.error('fetchMessages error:', error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendNewMessage = async (message) => {
    if (!chatId) {
      const error = new Error('No active chat. Please create a chat room first.');
      console.error('sendNewMessage error:', error);
      throw error;
    }

    const trimmedMessage = typeof message === 'string' ? message.trim() : '';

    if (!trimmedMessage) {
      const error = new Error('Message cannot be empty');
      console.error('sendNewMessage error:', error);
      throw error;
    }

    setLoading(true);

    try {
      await sendMessage(chatId, trimmedMessage);

      const localMessage = {
        message: trimmedMessage,
        sender: { name: 'You' },
        createdAt: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, localMessage]);
      return localMessage;
    } catch (error) {
      const errorMessage = error?.message || 'Unable to send message right now';
      console.error('sendNewMessage error:', error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    ChatContext.Provider,
    {
      value: {
        chatId,
        messages,
        loading,
        createChat,
        fetchMessages,
        sendNewMessage,
      },
    },
    children
  );
};

export const useChat = () => useContext(ChatContext);
