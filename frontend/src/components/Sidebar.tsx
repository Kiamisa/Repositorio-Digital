import { 
  LayoutDashboard, 
  Upload, 
  Search, 
  CheckCircle, 
  Users, 
  LogOut,
  FileText
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', label: 'Enviar Documentos', icon: Upload },
    { path: '/consulta', label: 'Consulta', icon: Search },
    // Apenas GESTOR ou ADMIN veem Aprovação
    { path: '/aprovacao', label: 'Aprovação', icon: CheckCircle, restricted: true },
    // Apenas ADMIN ou GESTOR veem Usuários
    { path: '/usuarios', label: 'Usuários', icon: Users, restricted: true },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filtra itens baseados na permissão
  const visibleItems = menuItems.filter(item => {
    if (!item.restricted) return true;
    return user?.perfil === 'ADMIN' || user?.perfil === 'GESTOR';
  });

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold">DocRepo</h1>
            <p className="text-sm text-gray-500">Repositório Digital</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="px-4 mb-4">
            <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.perfil?.toLowerCase()}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}