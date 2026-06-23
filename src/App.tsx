// ============================================================
// Batur Tani — App Router
// Main application with routing, auth protection, and layouts
// ============================================================

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import FarmerDashboard from '@/pages/farmer/FarmerDashboard';
import CommoditiesPage from '@/pages/farmer/CommoditiesPage';
import CommodityFormPage from '@/pages/farmer/CommodityFormPage';
import FarmerOrdersPage from '@/pages/farmer/FarmerOrdersPage';
import FarmerWeatherPage from '@/pages/farmer/FarmerWeatherPage';
import BuyerDashboard from '@/pages/buyer/BuyerDashboard';
import MarketplacePage from '@/pages/buyer/MarketplacePage';
import CommodityDetailPage from '@/pages/buyer/CommodityDetailPage';
import CheckoutPage from '@/pages/buyer/CheckoutPage';
import BuyerOrdersPage from '@/pages/buyer/BuyerOrdersPage';
import BuyerHistoryPage from '@/pages/buyer/BuyerHistoryPage';
import FinancePage from '@/pages/farmer/FinancePage';
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
      <Route
        path="/farmer/commodities"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <CommoditiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/commodities/new"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <CommodityFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/commodities/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <CommodityFormPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/farmer/orders"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerOrdersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farmer/weather"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerWeatherPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farmer/finance"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FinancePage />
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
      <Route
        path="/buyer/marketplace/:id"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <CommodityDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/checkout/:commodityId"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/orders"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/history"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerHistoryPage />
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
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
            },
          }} 
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
