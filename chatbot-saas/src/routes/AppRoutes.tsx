import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCompany } from '../hooks/useCompany';
import { Layout } from '../components/Layout';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { Company } from '../pages/Company';
import { Chatbot } from '../pages/Chatbot';
import { Messages } from '../pages/Messages';
import { Analytics } from '../pages/Analytics';
import { Plans } from '../pages/Plans';
import { CompanyProvider } from '../providers/company-provider';
import { ChatbotProvider } from '../providers/chatbot-provider';
import { AnalyticsProvider } from '../providers/analytics-provider';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const CompanyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CompanyProvider>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </CompanyProvider>
  );
};

const ChatbotRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CompanyProvider>
      <ChatbotRouteInner>
        {children}
      </ChatbotRouteInner>
    </CompanyProvider>
  );
};

const ChatbotRouteInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { company } = useCompany();
  
  if (!company?.id) {
    return <div>Carregando empresa...</div>;
  }

  return (
    <ChatbotProvider companyId={company.id}>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </ChatbotProvider>
  );
};

const AnalyticsRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CompanyProvider>
      <AnalyticsRouteInner>
        {children}
      </AnalyticsRouteInner>
    </CompanyProvider>
  );
};

const AnalyticsRouteInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { company } = useCompany();
  
  if (!company?.id) {
    return <div>Carregando empresa...</div>;
  }

  return (
    <AnalyticsProvider companyId={company.id}>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </AnalyticsProvider>
  );
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company"
        element={
          <CompanyRoute>
            <Company />
          </CompanyRoute>
        }
      />
      <Route
        path="/chatbot"
        element={
          <ChatbotRoute>
            <Chatbot />
          </ChatbotRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <AnalyticsRoute>
            <Analytics />
          </AnalyticsRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <ProtectedRoute>
            <Plans />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
