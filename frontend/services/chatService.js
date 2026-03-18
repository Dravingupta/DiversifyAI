import axios from 'axios';

const CHAT_API_BASE_URL = 'http://localhost:5000/api/chat';

const chatApi = axios.create({
  baseURL: CHAT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAuthConfig = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  return {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
};

const getErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

export const createChatRoom = async (advisorId) => {
  if (!advisorId) {
    throw new Error('advisorId is required');
  }

  try {
    const response = await chatApi.post(
      '/create-room',
      { advisorId },
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to create chat room'));
  }
};

export const sendMessage = async (chatId, message) => {
  if (!chatId || !message) {
    throw new Error('chatId and message are required');
  }

  try {
    const response = await chatApi.post(
      '/send',
      { chatId, message },
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to send message'));
  }
};

export const getMessages = async (chatId) => {
  if (!chatId) {
    throw new Error('chatId is required');
  }

  try {
    const response = await chatApi.get('/messages/' + chatId, getAuthConfig());
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to fetch messages'));
  }
};
