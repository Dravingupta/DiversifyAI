import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getStoredUser, getAdvisorEarnings } from '../../services/api';
import { getAdvisorChatRooms } from '../../services/chatService';

function formatCurrency(value, currency = 'INR') {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatDate(dateValue) {
  if (!dateValue) {
    return '-';
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function AdvisorDashboardPage() {
  const user = useMemo(() => getStoredUser(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalEarnings: 0,
    paidConsultations: 0,
    uniqueClients: 0,
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchAdvisorData = async () => {
      if (!user || user.role !== 'advisor') {
        setLoading(false);
        return;
      }

      try {
        setError('');
        setLoading(true);

        const [earningsResponse, roomsResponse] = await Promise.all([
          getAdvisorEarnings(),
          getAdvisorChatRooms(),
        ]);

        if (!mounted) {
          return;
        }

        setStats(earningsResponse?.stats || {
          totalEarnings: 0,
          paidConsultations: 0,
          uniqueClients: 0,
        });
        setRecentPayments(Array.isArray(earningsResponse?.recentPayments) ? earningsResponse.recentPayments : []);
        setRooms(Array.isArray(roomsResponse?.rooms) ? roomsResponse.rooms : []);
      } catch (apiError) {
        if (!mounted) {
          return;
        }

        setError(apiError?.message || 'Unable to load advisor dashboard right now.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAdvisorData();

    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user || user.role !== 'advisor') {
    return (
      <AppLayout
        title="Advisor Access"
        subtitle="Only advisor accounts can view advisor dashboard and consultation earnings."
      >
        <section className="enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '120ms' }}>
          <p className="text-slate-600">Please login with an advisor account to access this page.</p>
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
      title="Advisor Dashboard"
      subtitle="Track your consultation earnings and manage client conversations in one workspace."
    >
      {error ? (
        <section className="enter-up mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" style={{ animationDelay: '110ms' }}>
          {error}
        </section>
      ) : null}

      <section className="enter-up grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ animationDelay: '130ms' }}>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Total Earnings</p>
          <p className="mt-2 text-3xl font-black text-emerald-700">{formatCurrency(stats.totalEarnings)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Paid Consultations</p>
          <p className="mt-2 text-3xl font-black text-slate-800">{stats.paidConsultations}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Unique Clients</p>
          <p className="mt-2 text-3xl font-black text-slate-800">{stats.uniqueClients}</p>
        </article>
      </section>

      <section className="enter-up mt-6 grid gap-6 lg:grid-cols-2" style={{ animationDelay: '160ms' }}>
        <article className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">Client Chats</h2>
          <p className="mt-1 text-sm text-slate-600">Open conversations from clients who booked your service.</p>

          {loading ? (
            <p className="mt-6 text-sm text-slate-600">Loading chats...</p>
          ) : rooms.length === 0 ? (
            <p className="mt-6 text-sm text-slate-600">No active client chats yet.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {rooms.map((room) => (
                <Link
                  key={room.chatId}
                  to={'/chat/' + room.chatId}
                  state={{ advisorName: room?.client?.name || 'Client' }}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{room?.client?.name || 'Client'}</p>
                      <p className="text-xs text-slate-500">{room?.client?.email || 'No email'}</p>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">Open Chat</span>
                  </div>
                  {room?.lastMessage ? (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {room.lastMessage.senderName ? room.lastMessage.senderName + ': ' : ''}
                      {room.lastMessage.text}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No messages yet.</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">Recent Payments</h2>
          <p className="mt-1 text-sm text-slate-600">Latest consultation payments credited to your account.</p>

          {loading ? (
            <p className="mt-6 text-sm text-slate-600">Loading earnings...</p>
          ) : recentPayments.length === 0 ? (
            <p className="mt-6 text-sm text-slate-600">No paid consultations yet.</p>
          ) : (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Client</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {recentPayments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-4 py-3 text-slate-700">{payment?.user?.name || 'Client'}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">
                        {formatCurrency(payment?.amount, payment?.currency || 'INR')}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(payment?.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </AppLayout>
  );
}

export default AdvisorDashboardPage;
