// ============================================================
// Batur Tani — App Router
// Main application with routing, auth protection, and layouts
// ============================================================

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import FarmerDashboard from '@/pages/farmer/FarmerDashboard';
import BuyerDashboard from '@/pages/buyer/BuyerDashboard';
import MarketplacePage from '@/pages/buyer/MarketplacePage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// ------------------------------------------------------------
// Route Guards
// ------------------------------------------------------------

/**
 * Protected route wrapper.
 * Redirects to /login if not authenticated.
 * Optionally restricts to specific roles.
 */
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage text="Memuat..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <Navigate
        to={profile.role === 'farmer' ? '/farmer' : '/buyer'}
        replace
      />
    );
  }
  return <>{children}</>;
}

/**
 * Public-only route wrapper.
 * Redirects authenticated users to their dashboard.
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage text="Memuat..." />;
  if (user && profile) {
    return (
      <Navigate
        to={profile.role === 'farmer' ? '/farmer' : '/buyer'}
        replace
      />
    );
  }
  return <>{children}</>;
}

// ------------------------------------------------------------
// App Routes
// ------------------------------------------------------------

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Farmer Routes */}
      <Route
        path="/farmer"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Buyer Routes */}
      <Route
        path="/buyer"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/marketplace"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <MarketplacePage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all → redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ------------------------------------------------------------
// App Root
// ------------------------------------------------------------

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
