import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';

export function RegisterScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Chama a rota pública definida no UsuarioController
      await api.post('/usuarios/registro-publico', {
        ...formData,
        perfil: 'FUNCIONARIO' // Padrão para solicitação
      });
      alert('Solicitação enviada! Aguarde a aprovação do administrador.');
      navigate('/'); // Volta para o login
    } catch (error) {
      console.error(error);
      alert('Erro ao solicitar acesso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">U</span>
          </div>
          <CardTitle>Solicitar Acesso</CardTitle>
          <CardDescription>Preencha seus dados para cadastro</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input 
                required 
                onChange={e => setFormData({...formData, nome: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Email Institucional</Label>
              <Input 
                type="email" 
                required 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input 
                type="password" 
                required 
                onChange={e => setFormData({...formData, senha: e.target.value})} 
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
            <div className="text-center text-sm text-gray-500">
              Já tem conta? <Link to="/" className="text-blue-600 hover:underline">Fazer Login</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}