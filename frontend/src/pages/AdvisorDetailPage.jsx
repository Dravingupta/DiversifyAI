import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { advisors } from '../data/advisors';
import { createPaymentOrder, getStoredUser, verifyPayment } from '../../services/api';
import { useChat } from '../../context/ChatContext';

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
const FALLBACK_TEST_RAZORPAY_KEY = 'rzp_test_your_key';
const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || FALLBACK_TEST_RAZORPAY_KEY;

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function parseConsultationAmount(feeText) {
  const amount = Number(String(feeText || '').replace(/[^0-9]/g, ''));
  return Number.isFinite(amount) && amount > 0 ? amount : 2000;
}

function AdvisorDetailPage() {
  const navigate = useNavigate();
  const { advisorId } = useParams();
  const advisor = advisors.find((item) => item.id === advisorId);
  const { createChat } = useChat();
  const [isPaying, setIsPaying] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const handleStartChat = async () => {
    if (isStartingChat) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to start chat');
      return;
    }

    const selectedAdvisorId = advisor?._id || advisorId;

    if (!selectedAdvisorId) {
      alert('Advisor not found');
      return;
    }

    setIsStartingChat(true);

    try {
      const response = await createChat(selectedAdvisorId);
      const createdChatId = response?.chatId;

      if (!createdChatId) {
        throw new Error('Unable to start chat right now');
      }

      navigate('/chat/' + createdChatId, {
        state: {
          advisorName: advisor?.name || 'Advisor',
        },
      });
    } catch (error) {
      const errorMessage = error?.message || 'Unable to start chat right now';
      const isPaymentError =
        errorMessage.toLowerCase().includes('access denied') ||
        errorMessage.toLowerCase().includes('payment');

      if (isPaymentError) {
        alert('Please complete payment to start chat');
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsStartingChat(false);
    }
  };

  const handlePayment = async () => {
    if (isPaying) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to book a consultation');
      return;
    }

    if (!razorpayKey.startsWith('rzp_test_') || razorpayKey === FALLBACK_TEST_RAZORPAY_KEY) {
      alert('Razorpay test key is not configured on frontend');
      return;
    }

    const selectedAdvisorId = advisor?._id || advisorId;
    console.log('advisorId:', advisor?._id);

    if (!selectedAdvisorId) {
      alert('Advisor not found');
      return;
    }

    let hasOpenedCheckout = false;
    setIsPaying(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Razorpay SDK failed to load');
        return;
      }

      const orderResponse = await createPaymentOrder(
        parseConsultationAmount(advisor?.fee),
        selectedAdvisorId
      );
      const order = orderResponse?.order || orderResponse;

      if (!order?.id || !order?.amount) {
        throw new Error('Server error');
      }

      const user = getStoredUser();

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'PortfolioPilot',
        description: 'Consultation Fee',
        order_id: order.id,
        handler: async function (response) {
          try {
            await verifyPayment({
              ...response,
              advisorId: selectedAdvisorId,
            });
            alert('Payment Successful');
          } catch (error) {
            alert(error?.response?.data?.message || 'Payment verification failed');
          } finally {
            setIsPaying(false);
          }
        },
        prefill: {
          name: user?.name || 'User',
          email: user?.email || 'user@email.com',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (event) => {
        alert(event?.error?.description || 'Payment failed');
        setIsPaying(false);
      });

      hasOpenedCheckout = true;
      rzp.open();
    } catch (error) {
      alert(error?.response?.data?.message || error?.message || 'Server error');
    } finally {
      if (!hasOpenedCheckout) {
        setIsPaying(false);
      }
    }
  };

  if (!advisor) {
    return (
      <AppLayout title="Advisor Not Found" subtitle="The requested consultant profile could not be found.">
        <div className="enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '140ms' }}>
          <p className="text-slate-600">Please go back to the advisor list and select a valid consultant profile.</p>
          <Link to="/advisors" className="premium-btn mt-5 inline-flex rounded-xl bg-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white">
            Back to Advisors
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={`${advisor.name} Profile`}
      subtitle="Detailed consultant view with profile depth, investment focus, and booking actions."
    >
      <section className="enter-up rounded-3xl border border-slate-200 bg-white p-6 md:p-8" style={{ animationDelay: '140ms' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${advisor.avatarTone} text-2xl font-extrabold text-white`}>
              {advisor.initials}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{advisor.specialization}</p>
              <h2 className="mt-1 font-display text-4xl tracking-tight">{advisor.name}</h2>
              <p className="mt-2 text-slate-600">{advisor.bio}</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">Rating {advisor.rating} / 5</span>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Experience</p>
            <p className="mt-1 text-xl font-bold">{advisor.experience}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Clients Guided</p>
            <p className="mt-1 text-xl font-bold">{advisor.clients}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Languages</p>
            <p className="mt-1 text-xl font-bold">{advisor.languages}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Consultation Fee</p>
            <p className="mt-1 text-xl font-bold">{advisor.fee}</p>
          </article>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            className="premium-btn rounded-xl bg-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handlePayment}
            disabled={isPaying}
          >
            {isPaying ? 'Processing...' : 'Book Consultation'}
          </button>
          <button
            className="rounded-xl border border-slate-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleStartChat}
            disabled={isStartingChat}
          >
            {isStartingChat ? 'Starting chat...' : 'Start Chat'}
          </button>
          <Link to="/advisors" className="rounded-xl border border-slate-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
            Back to All Advisors
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}

export default AdvisorDetailPage;
