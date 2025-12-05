import { useState, useEffect } from 'react';
import { UserPlus, User as UserIcon } from 'lucide-react';
import api from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface User {
    id: number;
    nome: string;
    email: string;
    perfil: string;
    ativo: boolean;
}

export function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('FUNCIONARIO');

    const fetchUsers = () => {
        api.get('/usuarios').then(res => setUsers(res.data)).catch(console.error);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

  const handleAddUser = async () => {
    try {
        await api.post('/usuarios', {
            nome: newName,
            email: newEmail,
            senha: newPassword,
            perfil: newRole
        });
        setShowAddDialog(false);
        fetchUsers(); // Recarrega lista
        // Reset form
        setNewName(''); setNewEmail(''); setNewPassword('');
      } catch {
          alert("Erro ao criar usuário.");
      }
  };

  return (
    <div className="p-8 ml-64">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
            <p className="text-gray-600">Gerencie o acesso ao sistema</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Adicionar
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Lista de Usuários</CardTitle></CardHeader>
        <CardContent>
            <div className="space-y-4">
                {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-gray-500"/>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{user.nome}</h3>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant={user.perfil === 'ADMIN' ? 'default' : user.perfil === 'GESTOR' ? 'secondary' : 'outline'}>
                                {user.perfil}
                            </Badge>
                            <Badge variant="outline" className={user.ativo ? 'text-green-600 border-green-200' : 'text-red-600'}>
                                {user.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>

      {/* Dialog Adicionar */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
            <DialogHeader><DialogTitle>Novo Usuário</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Senha</Label>
                    <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Perfil</Label>
                    <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="FUNCIONARIO">Funcionário</SelectItem>
                            <SelectItem value="GESTOR">Gestor</SelectItem>
                            <SelectItem value="ADMIN">Administrador</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
                <Button onClick={handleAddUser}>Salvar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}