// App.js - Main application router with protected routes
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import BusinessDashboard from './pages/BusinessDashboard/BusinessDashboard';
import AgencyDashboard from './pages/AgencyDashboard/AgencyDashboard';
import PostRequest from './pages/PostRequest/PostRequest';
import ViewRequests from './pages/ViewRequests/ViewRequests';
import Proposals from './pages/Proposals/Proposals';
import Chat from './pages/Chat/Chat';
import Payments from './pages/Payments/Payments';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import {
  ServiceSelectionPage,
  ServiceListPage,
  BookingFormPage,
} from './pages/ServiceSelection/ServiceSelectionPage';

// Components
import Navbar from './components/Navbar/Navbar';

// ─── Service page wrappers (read URL params and pass as props) ─
const ServiceListPageWrapper = () => {
  const { serviceType } = useParams();
  return <ServiceListPage serviceType={serviceType} />;
};

const BookingFormPageWrapper = () => {
  const [searchParams] = useSearchParams();
  return (
    <BookingFormPage
      serviceType={searchParams.get('service_type')}
      service={searchParams.get('service')}
    />
  );
};

// ─── Protected route wrapper ───────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading Instant...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

// ─── Public-only route (redirect logged-in users) ──────────────
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'business' ? '/dashboard/business' : '/dashboard/agency'} replace />;
  return children;
};

// ─── All routes ────────────────────────────────────────────────
const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>

      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Service Selection (public — no login required) */}
      <Route path="/services" element={<ServiceSelectionPage />} />
      <Route path="/services/:serviceType" element={<ServiceListPageWrapper />} />
      <Route path="/booking" element={<BookingFormPageWrapper />} />

      {/* Business routes */}
      <Route path="/dashboard/business" element={
        <ProtectedRoute roles={['business', 'admin']}>
          <BusinessDashboard />
        </ProtectedRoute>
      } />
      <Route path="/post-request" element={
        <ProtectedRoute roles={['business']}>
          <PostRequest />
        </ProtectedRoute>
      } />

      {/* Agency routes */}
      <Route path="/dashboard/agency" element={
        <ProtectedRoute roles={['agency', 'admin']}>
          <AgencyDashboard />
        </ProtectedRoute>
      } />

      {/* Shared protected routes */}
      <Route path="/requests" element={
        <ProtectedRoute>
          <ViewRequests />
        </ProtectedRoute>
      } />
      <Route path="/proposals" element={
        <ProtectedRoute>
          <Proposals />
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute>
          <Payments />
        </ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/dashboard/admin" element={
        <ProtectedRoute roles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
          <div className="text-center">
            <p className="text-7xl font-bold text-gray-200 mb-4">404</p>
            <p className="text-xl font-semibold text-gray-600 mb-2">Page Not Found</p>
            <a href="/" className="text-blue-600 hover:underline">Go back home</a>
          </div>
        </div>
      } />

    </Routes>
  </>
);

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;