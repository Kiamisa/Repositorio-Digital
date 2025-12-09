import { useEffect, useState } from "react";
import { FileText, Download, Trash2, Edit } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { EditDocumentModal } from "./EditDocumentModal";

// 1. Definindo a interface Documento
interface Documento {
  id: number;
  titulo: string;
  descricao: string;
  tipo: string;
  dataPublicacao: string;
  nomeAutor: string;
  urlDownload: string;
  programaId?: number;
  status?: string;
}

// Componente DashboardScreen
export function DashboardScreen() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  // 2. Estados para controlar o Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Documento | null>(null);

  // 3. Transformamos a busca em função para poder recarregar após editar
  const loadDocuments = () => {
    api.get("/documentos")
      .then((response) => {
        setDocuments(response.data);
        const docs = response.data;
        setStats({
          total: docs.length,
          pending: 0,
          approved: docs.length,
          rejected: 0
        });
      })
      .catch((err) => console.error("Erro ao carregar dashboard", err));
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // 4. Atualiza função handleEdit para abrir o modal com os dados
  const handleEdit = (doc: Documento) => {
    setEditingDoc(doc);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este documento?")) {
      try {
        await api.delete(`/documentos/${id}`);
        setDocuments(documents.filter(doc => doc.id !== id));
        alert("Documento excluído!");
      } catch (error) {
        console.error("Erro ao deletar", error);
      }
    }
  };

  return (
    <div className="p-8 ml-64">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2 text-2xl font-bold">Olá, {user?.email}!</h1>
        <p className="text-gray-600">Bem-vindo ao painel de controle</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Total</CardTitle>
            <FileText className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.slice(0, 5).map((doc) => (
              <div key={doc.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-[#2B3C50]/10 text-[#2B3C50] rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="text-gray-900 font-medium truncate">{doc.titulo}</h3>
                    <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">Aprovado</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{doc.descricao}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{doc.tipo}</span>
                      <span>•</span>
                      <span>{doc.dataPublicacao}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <a href={`http://localhost:8080${doc.urlDownload}`} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="sm" className="h-8">
                                <Download className="w-4 h-4 mr-2" /> Baixar
                            </Button>
                        </a>

                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={() => handleEdit(doc)} 
                        >
                            <Edit className="w-4 h-4 mr-2" /> Editar
                        </Button>

                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() => handleDelete(doc.id)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Deletar
                        </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <EditDocumentModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadDocuments}
        documento={editingDoc}
      />
    </div>
  );
}