import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import AnalysisPage from './pages/AnalysisPage';
import AdvisorsPage from './pages/AdvisorsPage';
import AdvisorDetailPage from './pages/AdvisorDetailPage';
import ChatHistoryPage from './pages/chat/[chatId]';
import AdvisorDashboardPage from './pages/AdvisorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ConsultationsPage from './pages/ConsultationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/advisors" element={<AdvisorsPage />} />
        <Route path="/advisors/:advisorId" element={<AdvisorDetailPage />} />
        <Route path="/consultations" element={<ConsultationsPage />} />
        <Route path="/advisor/dashboard" element={<AdvisorDashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/chat/:chatId" element={<ChatHistoryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
