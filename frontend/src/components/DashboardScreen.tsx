import { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import api from "../services/api"; // Importar API
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

// Interface para tipar os dados do Java
interface Documento {
  id: number;
  titulo: string;
  descricao: string;
  tipo: string;
  dataPublicacao: string;
  nomeAutor: string;
  status?: string; // O backend público só retorna aprovados, mas vamos preparar
}

export function DashboardScreen() {
  const { user, isAdminOrGestor } = useAuth();
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    // Buscar documentos reais
    api.get("/documentos")
      .then((response) => {
        setDocuments(response.data);
        // Atualizar estatísticas baseadas nos dados recebidos
        // Nota: A rota pública só traz aprovados. Se for admin, deveríamos chamar outra rota para ver tudo.
        const docs = response.data;
        setStats({
            total: docs.length,
            pending: 0, // Admin veria isso em outra rota
            approved: docs.length,
            rejected: 0
        });
      })
      .catch((err) => console.error("Erro ao carregar dashboard", err));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2 text-2xl font-bold">Olá, {user?.email}!</h1>
        <p className="text-gray-600">Bem-vindo ao painel de controle</p>
      </div>

      {/* Cards de Estatísticas */}
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
        {/* ... Outros cards similares ... */}
      </div>

      {/* Lista de Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.slice(0, 5).map((doc) => (
              <div key={doc.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="text-gray-900 font-medium truncate">{doc.titulo}</h3>
                    <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">Aprovado</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{doc.descricao}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{doc.tipo}</span>
                    <span>•</span>
                    <span>{doc.dataPublicacao}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}