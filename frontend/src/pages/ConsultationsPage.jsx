import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getStoredUser } from '../../services/api';
import { getClientChatRooms } from '../../services/chatService';

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ConsultationsPage() {
  const user = useMemo(() => getStoredUser(), []);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchRooms = async () => {
      if (!user || user.role !== 'client') {
        setLoading(false);
        return;
      }

      try {
        setError('');
        setLoading(true);
        const response = await getClientChatRooms();

        if (!mounted) {
          return;
        }

        setRooms(Array.isArray(response?.rooms) ? response.rooms : []);
      } catch (apiError) {
        if (!mounted) {
          return;
        }

        setError(apiError?.message || 'Unable to load consultations right now.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchRooms();

    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user || user.role !== 'client') {
    return (
      <AppLayout
        title="Consultation History"
        subtitle="Only client accounts can access saved consultation chats."
      >
        <section className="enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '120ms' }}>
          <p className="text-slate-600">Please login with a client account to view consultation history.</p>
          <Link
            to="/login"
            className="premium-btn mt-4 inline-flex rounded-xl bg-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white"
          >
            Go to Login
          </Link>
        </section>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Consultation History"
      subtitle="Revisit saved advisor suggestions anytime. Chat replies require an active 24-hour unlocked session."
    >
      {error ? (
        <section className="enter-up mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" style={{ animationDelay: '110ms' }}>
          {error}
        </section>
      ) : null}

      <section className="enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '130ms' }}>
        {loading ? (
          <p className="text-slate-600">Loading consultation history...</p>
        ) : rooms.length === 0 ? (
          <div>
            <p className="text-slate-600">No consultation chats found yet.</p>
            <Link
              to="/advisors"
              className="premium-btn mt-4 inline-flex rounded-xl bg-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white"
            >
              Book Consultation
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <article key={room.chatId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{room?.advisor?.name || 'Advisor'}</p>
                    <p className="text-xs text-slate-500">{room?.advisor?.email || 'No email available'}</p>
                  </div>
                  <span
                    className={
                      room?.isSessionActive
                        ? 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700'
                        : 'rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700'
                    }
                  >
                    {room?.isSessionActive ? 'Session Active' : 'Session Expired'}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Access valid until: {formatDateTime(room?.accessExpiresAt)}
                </p>

                {room?.lastMessage ? (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                    {room.lastMessage.senderName ? room.lastMessage.senderName + ': ' : ''}
                    {room.lastMessage.text}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No messages yet.</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={'/chat/' + room.chatId}
                    state={{ advisorName: room?.advisor?.name || 'Advisor' }}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700"
                  >
                    Open Chat History
                  </Link>
                  {!room?.isSessionActive ? (
                    <Link
                      to={'/advisors/' + (room?.advisor?._id || '')}
                      className="premium-btn rounded-xl bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white"
                    >
                      Unlock for 24h
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}

export default ConsultationsPage;
