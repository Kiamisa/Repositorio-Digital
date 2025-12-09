import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginScreen } from "./components/LoginScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { Sidebar } from "./components/Sidebar";
import { UploadScreen } from "./components/UploadScreen"; 
import { SearchScreen } from "./components/SearchScreen"; 
import { ApprovalScreen } from "./components/ApprovalScreen"; 
import { UsersScreen } from "./components/UsersScreen"; 
import { RegisterScreen } from "./components/RegisterScreen";

// Layout para páginas que exigem autenticação
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
};

// Layout para páginas públicas (Login, Registro)
// Se já estiver logado, manda para o Dashboard
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Rota Raiz - Redireciona para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 2. Rotas Públicas (Login e Registro) */}
          <Route path="/login" element={
            <PublicLayout>
              <LoginScreen />
            </PublicLayout>
          } />
          
          <Route path="/register" element={ 
            <PublicLayout>
              <RegisterScreen />
            </PublicLayout>
          } />
          
          {/* 3. Rotas Protegidas (Dashboard, etc) */}
          <Route path="/dashboard" element={<ProtectedLayout><DashboardScreen /></ProtectedLayout>} />
          <Route path="/upload" element={<ProtectedLayout><UploadScreen /></ProtectedLayout>} />
          <Route path="/consulta" element={<ProtectedLayout><SearchScreen /></ProtectedLayout>} />
          <Route path="/aprovacao" element={<ProtectedLayout><ApprovalScreen /></ProtectedLayout>} />
          <Route path="/usuarios" element={<ProtectedLayout><UsersScreen /></ProtectedLayout>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}