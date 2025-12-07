import { useEffect, useState } from 'react';
import { Search, Filter, FileText, Download, Calendar, X } from 'lucide-react';
import api from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import axios from 'axios';


interface Documento {
  id: number;
  titulo: string;
  descricao: string;
  tipo: string;
  dataPublicacao: string;
  nomeAutor: string;
  nomePrograma: string;
  urlDownload: string;
  status: string;
  resumoIa?: string;
}

export function SearchScreen() {
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get('/documentos').then(res => setDocuments(res.data)).catch(console.error);
  }, []);

  const categories = Array.from(new Set(documents.map(d => d.tipo)));
  const programs = Array.from(new Set(documents.map(d => d.nomePrograma).filter(Boolean)));
  
  const filteredDocuments = documents.filter(doc => {
    // 1. Filtro de Categoria
    const matchesCategory = categoryFilter === 'all' || doc.tipo === categoryFilter;
    
    // 2. Filtro de Programa
    const matchesProgram = programFilter === 'all' || doc.nomePrograma === programFilter;

    // 3. Filtro de Data (Comparação simples de string ISO YYYY-MM-DD)
    const matchesStartDate = !startDateFilter || doc.dataPublicacao >= startDateFilter;
    const matchesEndDate = !endDateFilter || doc.dataPublicacao <= endDateFilter;

    return matchesCategory && matchesProgram && matchesStartDate && matchesEndDate;
  });

  const clearFilters = async () => {
    // 1. Reseta os estados visuais
    setSearchTerm('');
    setCategoryFilter('all');
    setProgramFilter('all');
    setStartDateFilter('');
    setEndDateFilter('');
    
    // 2. Reseta a lista de documentos para o original (Java)
    setIsLoading(true);
    try {
      const res = await api.get('/documentos');
      setDocuments(res.data);
    } catch (error) {
      console.error("Erro ao resetar filtros:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSmartSearch = async () => {
    setIsLoading(true);
    setDocuments([]); // Limpa visualmente enquanto carrega
    
    try {
      if (!searchTerm.trim()) {
        // Se busca vazia, recarrega tudo do Java (Porta 8080 via api.ts)
        const res = await api.get('/documentos');
        setDocuments(res.data);
      } else {
        // Se tem texto, chama o Python (Porta 8000)
        // Ajuste o IP se estiver no Android Emulator (10.0.2.2) ou Web (localhost)
        const res = await axios.post('http://localhost:8000/smart-search', { 
          query: searchTerm 
        });
        setDocuments(res.data);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      // Opcional: Mostrar erro na tela
    } finally {
      setIsLoading(false);
    }
  };

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
            placeholder="Pesquisa Inteligente por IA..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
            disabled={isLoading}
          />
        </div>
        
        <Button onClick={handleSmartSearch} disabled={isLoading}>
           {isLoading ? 'Buscando, Por favor aguarde...' : 'Buscar'}
        </Button>

        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 mr-2" /> Filtros
        </Button>

        {(searchTerm || categoryFilter !== 'all' || programFilter !== 'all' || startDateFilter || endDateFilter) && (
          <Button variant="ghost" onClick={clearFilters} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <X className="w-4 h-4 mr-2" /> Limpar
          </Button>
        )}
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
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

              {/* Filtro de Programa */}
              <div className="space-y-2">
                <Label>Programa</Label>
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-white max-h-[200px]">
                    <SelectItem value="all">Todos</SelectItem>
                    {programs.map(prog => <SelectItem key={prog} value={prog}>{prog}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Data Início */}
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input 
                  type="date" 
                  value={startDateFilter} 
                  onChange={(e) => setStartDateFilter(e.target.value)} 
                />
              </div>

              {/* Data Fim */}
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input 
                  type="date" 
                  value={endDateFilter} 
                  onChange={(e) => setEndDateFilter(e.target.value)} 
                />
              </div>

            </div>
          </CardContent>
        </Card>
      )}

      {/* Removed stray doc.resumoIa block here to prevent ReferenceError */}

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
                  
                  {doc.resumoIa && (
                      <div className="mb-4 p-4 bg-purple-50 border border-purple-100 rounded-lg shadow-sm">
                          <div className="flex items-center gap-2 mb-2 text-purple-700">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              >
                                <path d="M12 8V4H8"/>
                                <rect width="16" height="12" x="4" y="8" rx="2"/>
                                <path d="M2 14h2"/>
                                <path d="M20 14h2"/>
                                <path d="M15 13v2"/>
                                <path d="M9 13v2"/>
                              </svg>
                              <span className="text-xs font-bold uppercase tracking-wide">Resumo Inteligente</span>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">
                              {doc.resumoIa}
                          </p>
                      </div>
                  )}

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