import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

interface Pendencia {
    idFluxo: number;
    estado: string;
    tituloDocumento: string;
    idDocumento: number;
    nomeAutor: string;
    nomePrograma: string;
    dataSolicitacao: string;
}

export function ApprovalScreen() {
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  
  useEffect(() => {
    fetchPendencias();
  }, []);

  const fetchPendencias = () => {
    api.get('/aprovacoes/pendentes')
       .then(res => setPendencias(res.data))
       .catch(console.error);
  };

  const handleProcess = async (id: number, approved: boolean) => {
    if (!confirm(approved ? "Aprovar documento?" : "Rejeitar documento?")) return;
    
    try {
        await api.patch(`/aprovacoes/${id}?aprovado=${approved}&comentario=ViaReact`);
        // Remove da lista local
        setPendencias(prev => prev.filter(p => p.idFluxo !== id));
    } catch (error) {
        alert("Erro ao processar.");
    }
  };

  return (
    <div className="p-8 ml-64">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Aprovação</h1>
        <p className="text-gray-600">Gerencie documentos pendentes</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{pendencias.length}</div></CardContent>
        </Card>
        {/* Outros cards estáticos para visual */}
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
            <TabsTrigger value="pending">Pendentes ({pendencias.length})</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6 space-y-4">
            {pendencias.length === 0 && <p className="text-gray-500 text-center py-10">Nada pendente.</p>}
            
            {pendencias.map(item => (
                <Card key={item.idFluxo}>
                    <CardContent className="p-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                    <h3 className="font-bold text-gray-900">{item.tituloDocumento}</h3>
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>
                                </div>
                                <div className="text-sm text-gray-600 mb-4 space-y-1">
                                    <p>Autor: <strong>{item.nomeAutor}</strong></p>
                                    <p>Programa: {item.nomePrograma}</p>
                                    <p className="text-xs text-gray-400">{item.dataSolicitacao}</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleProcess(item.idFluxo, true)}>
                                        <CheckCircle className="w-4 h-4 mr-2"/> Aprovar
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleProcess(item.idFluxo, false)}>
                                        <XCircle className="w-4 h-4 mr-2"/> Rejeitar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}