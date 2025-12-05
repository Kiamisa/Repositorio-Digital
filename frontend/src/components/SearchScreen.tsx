import { useEffect, useState } from 'react';
import { Search, Filter, FileText, Download, Calendar } from 'lucide-react';
import api from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';

interface Documento {
    id: number;
    titulo: string;
    descricao: string;
    tipo: string;
    dataPublicacao: string;
    nomeAutor: string;
    nomePrograma: string;
    urlDownload: string;
    status: string; // Vindo do backend ou assumido 'APROVADO'
}

export function SearchScreen() {
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    // Busca documentos públicos
    api.get('/documentos').then(res => setDocuments(res.data)).catch(console.error);
  }, []);

  const categories = Array.from(new Set(documents.map(d => d.tipo)));

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.descricao && doc.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || doc.tipo === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 ml-64">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2 text-2xl font-bold">Consulta</h1>
        <p className="text-gray-600">Pesquise documentos do repositório</p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            className="pl-10" 
            placeholder="Pesquisar..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 mr-2" /> Filtros
        </Button>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Refine sua busca</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#2B3C50]/10 text-[#2B3C50] rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-gray-900 font-bold">{doc.titulo}</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aprovado</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{doc.descricao}</p>
                  <div className="flex gap-3 text-xs text-gray-500 items-center">
                    <span className="flex gap-1 items-center"><Calendar className="w-3 h-3"/> {doc.dataPublicacao}</span>
                    <span>•</span>
                    <span>{doc.nomeAutor}</span>
                    <span>•</span>
                    <Badge variant="secondary" className="text-xs">{doc.tipo}</Badge>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <a href={`http://localhost:8080${doc.urlDownload}`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2"/> Baixar</Button>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredDocuments.length === 0 && <p className="text-center text-gray-500 mt-10">Nenhum documento encontrado.</p>}
      </div>
    </div>
  );
}