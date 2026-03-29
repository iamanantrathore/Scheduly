import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import EventTypes from './pages/EventTypes';
import Availability from './pages/Availability';
import Meetings from './pages/Meetings';
import BookingPage from './pages/BookingPage';
import Confirmation from './pages/Confirmation';
import PublicEventTypes from './pages/PublicEventTypes';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmailTemplates from './pages/EmailTemplates';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book" element={<PublicEventTypes />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="event-types" element={<EventTypes />} />
            <Route path="availability" element={<Availability />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="email-templates" element={<EmailTemplates />} />
          </Route>
          <Route path="/booking/confirm/:bookingId" element={<Confirmation />} />
          <Route path="/:slug" element={<BookingPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
