import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useChat } from '../../../context/ChatContext';
import { getStoredUser } from '../../../services/api';

function ChatHistoryPage() {
  const { chatId } = useParams();
  const location = useLocation();
  const { messages, fetchMessages, sendNewMessage } = useChat();
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const user = useMemo(() => getStoredUser(), []);
  const userId = user?.id || user?._id || null;
  const isClient = (user?.role || 'client') === 'client';

  const isMyMessage = (msg) => {
    const senderId = msg?.sender?._id || msg?.sender?.id || null;

    if (senderId && userId) {
      return String(senderId) === String(userId);
    }

    return msg?.sender?.name === 'You' || msg?.sender?.name === user?.name;
  };

  const advisorName = useMemo(() => {
    const nameFromNavigation = location.state?.advisorName;
    if (nameFromNavigation) {
      return nameFromNavigation;
    }

    const advisorMessage = messages.find((msg) => !isMyMessage(msg));
    return advisorMessage?.sender?.name || 'Advisor';
  }, [location.state, messages]);

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      if (!chatId) {
        return;
      }

      try {
        setError('');
        setIsFetchingMessages(true);
        await fetchMessages(chatId);
      } catch (fetchError) {
        console.error('Failed to fetch chat messages:', fetchError);
        if (isMounted) {
          setError(fetchError?.message || 'Unable to load chat messages right now.');
        }
      } finally {
        if (isMounted) {
          setIsFetchingMessages(false);
        }
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [chatId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [chatId]);

  const formatTime = (value) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput || isSending) {
      return;
    }

    try {
      setError('');
      setSessionExpired(false);
      setIsSending(true);
      await sendNewMessage(trimmedInput);
      setInput('');
      inputRef.current?.focus();
    } catch (sendError) {
      console.error('Failed to send chat message:', sendError);
      const sendErrorMessage = sendError?.message || 'Message failed. Try again.';
      const isExpiryError = sendErrorMessage.toLowerCase().includes('expired');

      if (isExpiryError) {
        setSessionExpired(true);
      }

      setError(sendErrorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const backRoute = isClient ? '/consultations' : '/advisor/dashboard';

  return (
    <div className="chat-page flex h-screen flex-col bg-slate-50">
      <header className="chat-header border-b border-slate-200 bg-white px-4 py-3 shadow-sm md:px-6">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{advisorName} Chat</h2>
            <p className="text-sm text-emerald-600">Consultation Active</p>
          </div>
          <Link
            to={backRoute}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700 hover:bg-slate-100"
          >
            Back
          </Link>
        </div>
      </header>

      {sessionExpired && isClient ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          Session expired. You can still revisit suggestions, but send new messages after unlocking consultation again.
          {' '}
          <Link to="/advisors" className="font-semibold underline">Unlock now</Link>
        </div>
      ) : null}

      <div className="messages-area flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col">
          {isFetchingMessages ? (
            <p className="py-12 text-center text-slate-600">Loading chat...</p>
          ) : messages.length === 0 ? (
            <p className="py-12 text-center text-gray-500">Start your consultation with the advisor.</p>
          ) : (
            messages.map((msg, index) => {
              const mine = isMyMessage(msg);
              const senderName = msg?.sender?.name || 'Unknown';
              const messageTime = formatTime(msg?.createdAt);

              return (
                <div
                  key={msg?._id || index}
                  className={mine ? 'mb-3 flex flex-col items-end gap-1' : 'mb-3 flex flex-col items-start gap-1'}
                >
                  <div
                    className={
                      mine
                        ? 'my-message max-w-xs break-words rounded-xl bg-blue-500 px-4 py-2 text-sm text-white shadow-sm sm:max-w-md'
                        : 'other-message max-w-xs break-words rounded-xl bg-gray-200 px-4 py-2 text-sm text-slate-900 shadow-sm sm:max-w-md'
                    }
                  >
                    <p className="whitespace-pre-wrap">{msg?.message || ''}</p>
                  </div>
                  <small className="text-[11px] text-slate-500">
                    {senderName}
                    {messageTime ? ' - ' + messageTime : ''}
                  </small>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef}></div>
        </div>
      </div>

      <div className="input-area border-t border-slate-200 bg-white p-3 md:p-4">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-slate-300 p-2.5 text-sm outline-none transition focus:border-blue-500"
            disabled={isSending || isFetchingMessages || !chatId || (isClient && sessionExpired)}
          />

          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isSending || isFetchingMessages || !chatId || (isClient && sessionExpired)}
            className="rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>

        {error ? (
          <p className="mx-auto mt-2 w-full max-w-4xl text-sm text-red-600">{error}</p>
        ) : null}
      </div>
    </div>
  );
}

export default ChatHistoryPage;