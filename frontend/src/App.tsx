import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginScreen } from "./components/LoginScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { Sidebar } from "./components/Sidebar";
import { UploadScreen } from "./components/UploadScreen"; 
import { SearchScreen } from "./components/SearchScreen"; 
import { ApprovalScreen } from "./components/ApprovalScreen"; 
import { UsersScreen } from "./components/UsersScreen"; 

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" />;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          
          <Route path="/dashboard" element={<ProtectedLayout><DashboardScreen /></ProtectedLayout>} />
          <Route path="/upload" element={<ProtectedLayout><UploadScreen /></ProtectedLayout>} />
          <Route path="/consulta" element={<ProtectedLayout><SearchScreen /></ProtectedLayout>} />
          <Route path="/aprovacao" element={<ProtectedLayout><ApprovalScreen /></ProtectedLayout>} />
          <Route path="/usuarios" element={<ProtectedLayout><UsersScreen /></ProtectedLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}