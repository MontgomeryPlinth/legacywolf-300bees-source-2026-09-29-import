import { MemoryRouter as BrowserRouter, Routes, Route, Navigate } from "react-router";
import { RoleSelector } from "./components/RoleSelector";
import { RoleSelectionScreen } from "./components/auth/RoleSelectionScreen";
import { UserLogin } from "./components/auth/UserLogin";
import { NominatedContactLogin } from "./components/auth/NominatedContactLogin";
import { ResponderLogin } from "./components/auth/ResponderLogin";
import { AdminLogin } from "./components/auth/AdminLogin";
import { SignUpWizard } from "./components/auth/SignUpWizard";
import { UserApp } from "./components/user/UserApp";
import { NominatedContactApp } from "./components/nominated-contact/NominatedContactApp";
import { ResponderApp } from "./components/responder/ResponderApp";
import { AdminApp } from "./components/admin/AdminApp";
import { AppProvider, useApp } from "./contexts/AppContext";
import { PinProvider } from "./contexts/PinContext";
import { NotificationProvider } from "./components/notifications/NotificationProvider";
import { Toaster } from "./components/ui/sonner";
import { Component, ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center">
          <div>
            <p className="text-lg font-bold text-destructive mb-2">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{(this.state.error as Error).message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useApp();
  
  if (!session.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { session } = useApp();
  
  return (
    <Routes>
      {/* Public Routes - Landing & Login */}
      <Route 
        path="/" 
        element={session.isAuthenticated ? <Navigate to={`/${session.currentRole}`} replace /> : <RoleSelectionScreen />} 
      />
      <Route path="/login/user" element={session.isAuthenticated ? <Navigate to="/user" replace /> : <UserLogin />} />
      <Route path="/login/contact" element={session.isAuthenticated ? <Navigate to="/nominated-contact" replace /> : <NominatedContactLogin />} />
      <Route path="/login/responder" element={session.isAuthenticated ? <Navigate to="/responder" replace /> : <ResponderLogin />} />
      <Route path="/login/admin" element={session.isAuthenticated ? <Navigate to="/admin" replace /> : <AdminLogin />} />
      
      {/* Sign-up wizard — C1 flow */}
      <Route path="/signup" element={session.isAuthenticated ? <Navigate to="/user" replace /> : <SignUpWizard />} />

      {/* Legacy login route - redirect to role selection */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      
      {/* Role Selector (for switching between views when logged in) */}
      <Route path="/role-selector" element={
        <ProtectedRoute>
          <RoleSelector />
        </ProtectedRoute>
      } />
      
      {/* Protected Routes */}
      <Route path="/user/*" element={
        <ProtectedRoute>
          <UserApp />
        </ProtectedRoute>
      } />
      <Route path="/nominated-contact/*" element={
        <ProtectedRoute>
          <NominatedContactApp />
        </ProtectedRoute>
      } />
      <Route path="/responder/*" element={
        <ProtectedRoute>
          <ResponderApp />
        </ProtectedRoute>
      } />
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <AdminApp />
        </ProtectedRoute>
      } />
      
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <PinProvider>
          <NotificationProvider>
            <BrowserRouter>
              <div className="dark min-h-screen bg-background text-foreground">
                <AppRoutes />
                <Toaster />
              </div>
            </BrowserRouter>
          </NotificationProvider>
        </PinProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}