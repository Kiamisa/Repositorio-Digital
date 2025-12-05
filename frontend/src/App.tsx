import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginScreen } from "./components/LoginScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { Sidebar } from "./components/Sidebar";
import { UploadScreen } from "./components/UploadScreen"; 
import { SearchScreen } from "./components/SearchScreen"; 
import { ApprovalScreen } from "./components/ApprovalScreen"; 
import { UsersScreen } from "./components/UsersScreen"; 

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

// Layout para a tela de Login
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
          {/* 1. Rota Raiz */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 2. Tela de Login */}
          <Route path="/login" element={
            <PublicLayout>
              <LoginScreen />
            </PublicLayout>
          } />
          
          {/* 3. Rotas Protegidas */}
          <Route path="/dashboard" element={<ProtectedLayout><DashboardScreen /></ProtectedLayout>} />
          <Route path="/upload" element={<ProtectedLayout><UploadScreen /></ProtectedLayout>} />
          <Route path="/consulta" element={<ProtectedLayout><SearchScreen /></ProtectedLayout>} />
          <Route path="/aprovacao" element={<ProtectedLayout><ApprovalScreen /></ProtectedLayout>} />
          <Route path="/usuarios" element={<ProtectedLayout><UsersScreen /></ProtectedLayout>} />

          {/* 4. Rota Coringa */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}