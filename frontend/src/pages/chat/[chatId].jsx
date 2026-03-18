import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useChat } from '../../../context/ChatContext';
import { getStoredUser } from '../../../services/api';

const CHAT_POLL_INTERVAL_MS = 3000;

const formatCurrency = (value) => {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericValue);
};

const parseLegacyPortfolioSnapshot = (messageText) => {
  const text = typeof messageText === 'string' ? messageText : '';
  if (!text) {
    return null;
  }

  const normalized = text.toLowerCase();
  const looksLikeSnapshot =
    normalized.includes('consultation session started') &&
    (normalized.includes('portfolio auto-shared') || normalized.includes('portfolio snapshot'));

  if (!looksLikeSnapshot) {
    return null;
  }

  if (normalized.includes('currently has no stocks')) {
    return {
      holdingsCount: 0,
      totalInvestment: 0,
      totalCurrentValue: 0,
      sectors: [],
      holdings: [],
    };
  }

  const holdingsCountMatch = text.match(/Holdings count:\s*(\d+)/i);
  const investedMatch = text.match(/Estimated invested value:\s*INR\s*([\d,]+)/i);
  const lines = text.split('\n').map((line) => line.trim());

  const holdings = lines
    .filter((line) => line.startsWith('-'))
    .map((line) => {
      const match = line.match(/^-\s*([A-Z0-9._-]+):\s*Qty\s*([\d.]+),\s*Buy\s*([\d.]+),\s*Sector\s*(.+)$/i);
      if (!match) {
        return null;
      }

      const symbol = (match[1] || '').trim();
      const quantity = Number(match[2] || 0);
      const buyPrice = Number(match[3] || 0);
      const sector = (match[4] || 'Misc').trim();
      const currentValue = quantity * buyPrice;

      return {
        symbol,
        quantity,
        buyPrice,
        sector,
        currentValue,
      };
    })
    .filter(Boolean);

  const totalInvestmentFromHeader = Number((investedMatch && investedMatch[1] ? investedMatch[1] : '0').replace(/,/g, ''));
  const totalFromHoldings = holdings.reduce((sum, h) => sum + Number(h.currentValue || 0), 0);
  const totalInvestment = totalInvestmentFromHeader > 0 ? totalInvestmentFromHeader : totalFromHoldings;
  const totalCurrentValue = totalFromHoldings;

  const holdingsWithWeights = holdings
    .map((holding) => ({
      ...holding,
      weight: totalCurrentValue > 0 ? Math.round((holding.currentValue / totalCurrentValue) * 100) : 0,
    }))
    .slice(0, 8);

  const sectorMap = holdingsWithWeights.reduce((acc, holding) => {
    const sectorName = holding.sector || 'Misc';
    acc[sectorName] = (acc[sectorName] || 0) + Number(holding.currentValue || 0);
    return acc;
  }, {});

  const sectors = Object.entries(sectorMap)
    .map(([name, value]) => ({
      name,
      allocation: totalCurrentValue > 0 ? Math.round((value / totalCurrentValue) * 100) : 0,
    }))
    .sort((a, b) => b.allocation - a.allocation)
    .slice(0, 6);

  return {
    holdingsCount: Number(holdingsCountMatch ? holdingsCountMatch[1] : holdings.length),
    totalInvestment,
    totalCurrentValue,
    sectors,
    holdings: holdingsWithWeights,
  };
};

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
  const lastMessageCountRef = useRef(0);
  const isPollingInProgressRef = useRef(false);

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
    const currentCount = Array.isArray(messages) ? messages.length : 0;
    if (currentCount > lastMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    lastMessageCountRef.current = currentCount;
  }, [messages]);

  useEffect(() => {
    if (!chatId) {
      return undefined;
    }

    const intervalId = setInterval(async () => {
      if (isPollingInProgressRef.current) {
        return;
      }

      try {
        isPollingInProgressRef.current = true;
        await fetchMessages(chatId);
      } catch (_pollError) {
        // Keep polling quiet in background; foreground errors are still shown from user actions.
      } finally {
        isPollingInProgressRef.current = false;
      }
    }, CHAT_POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [chatId, fetchMessages]);

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

  const renderPortfolioSnapshotCard = (msg, mine, fallbackPayload) => {
    const payload = msg?.payload || fallbackPayload || {};
    const sectors = Array.isArray(payload?.sectors) ? payload.sectors : [];
    const holdings = Array.isArray(payload?.holdings) ? payload.holdings : [];

    return (
      <div className={mine ? 'max-w-2xl rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm' : 'max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm'}>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Portfolio Snapshot</p>
        <p className="mt-2 text-sm text-slate-700">{msg?.message || 'Portfolio details shared.'}</p>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Holdings</p>
            <p className="mt-1 text-xl font-black text-slate-800">{payload?.holdingsCount || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Invested</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{formatCurrency(payload?.totalInvestment)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Current</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{formatCurrency(payload?.totalCurrentValue)}</p>
          </div>
        </div>

        {sectors.length > 0 ? (
          <div className="mt-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Sector Allocation</p>
            {sectors.map((sector) => (
              <div key={sector.name}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>{sector.name}</span>
                  <span>{sector.allocation}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200">
                  <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${sector.allocation}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {holdings.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-2 py-2 text-left">Stock</th>
                  <th className="px-2 py-2 text-left">Sector</th>
                  <th className="px-2 py-2 text-left">Wt</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr key={holding.symbol} className="border-t border-slate-100 text-slate-700">
                    <td className="px-2 py-2 font-semibold">{holding.symbol}</td>
                    <td className="px-2 py-2">{holding.sector}</td>
                    <td className="px-2 py-2">{holding.weight}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    );
  };

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
              const legacyPayload = parseLegacyPortfolioSnapshot(msg?.message);
              const isPortfolioSnapshot = msg?.messageType === 'portfolio_snapshot' || Boolean(legacyPayload);

              return (
                <div
                  key={msg?._id || index}
                  className={mine ? 'mb-3 flex flex-col items-end gap-1' : 'mb-3 flex flex-col items-start gap-1'}
                >
                  {isPortfolioSnapshot
                    ? renderPortfolioSnapshotCard(msg, mine, legacyPayload)
                    : (
                      <div
                        className={
                          mine
                            ? 'my-message max-w-xs break-words rounded-xl bg-blue-500 px-4 py-2 text-sm text-white shadow-sm sm:max-w-md'
                            : 'other-message max-w-xs break-words rounded-xl bg-gray-200 px-4 py-2 text-sm text-slate-900 shadow-sm sm:max-w-md'
                        }
                      >
                        <p className="whitespace-pre-wrap">{msg?.message || ''}</p>
                      </div>
                    )}
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