import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useNavigate } from 'react-router-dom';

interface Programa {
  id: number;
  nome: string;
  sigla: string;
}

export function UploadScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  
  // 1. NOVO ESTADO: Inicializa com a data de hoje (formato YYYY-MM-DD)
  const [publicationDate, setPublicationDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [file, setFile] = useState<File | null>(null);
  const [programId, setProgramId] = useState('');
  const [programas, setProgramas] = useState<Programa[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = ['EDITAIS', 'RESULTADOS', 'FORMULARIOS', 'OUTROS', 'DOCUMENTACOES', 'RESOLUCOES'];

  useEffect(() => {
    api.get('/programas')
      .then(response => {
        setProgramas(response.data);
      })
      .catch(err => console.error("Erro ao carregar programas", err));
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação inclui publicationDate
    if (!title || !category || !file || !programId || !publicationDate) {
      alert('Por favor, preencha todos os campos obrigatórios e selecione um arquivo.');
      return;
    }

    setLoading(true);

    try {
        const formData = new FormData();
        formData.append('titulo', title);
        const descFinal = tags ? `${description}\n\nTags: ${tags}` : description;
        formData.append('descricao', descFinal);
        formData.append('tipo', category);
        
        // 2. ALTERAÇÃO: Usa o estado publicationDate em vez de new Date() automático
        formData.append('dataPublicacao', publicationDate);
        
        formData.append('programaId', programId);
        formData.append('arquivo', file);

        await api.post('/documentos', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        setUploadSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);

    } catch (error) {
        console.error(error);
        alert("Erro ao enviar documento.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto ml-64">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2 text-2xl font-bold">Enviar Documento</h1>
        <p className="text-gray-600">Faça upload de um novo documento para o repositório</p>
      </div>

      {uploadSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">Documento enviado com sucesso!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Arquivo</CardTitle>
            <CardDescription>Arraste e solte ou clique para selecionar</CardDescription>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 mb-2">Arraste e solte seu arquivo aqui</p>
                <p className="text-sm text-gray-500 mb-4">ou</p>
                <Button type="button" onClick={() => fileInputRef.current?.click()}>
                    Selecionar Arquivo
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                />
                <p className="text-xs text-gray-500 mt-4">PDF, DOC, DOCX, TXT (máx. 50MB)</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#2B3C50]/10 text-[#2B3C50] rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button type="button" onClick={() => setFile(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            {/* 3. ALTERAÇÃO: Grid mudado para 3 colunas para acomodar a data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="bg-white"> {/* bg-white adicionado */}
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Programa *</Label>
                <Select value={programId} onValueChange={setProgramId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o programa" />
                  </SelectTrigger>
                  <SelectContent className="bg-white"> {/* bg-white adicionado */}
                    {programas.map((prog) => (
                      <SelectItem key={prog.id} value={String(prog.id)}>
                        {prog.sigla} - {prog.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Novo Input de Data */}
              <div className="space-y-2">
                <Label>Data de Publicação *</Label>
                <Input 
                  type="date" 
                  value={publicationDate} 
                  onChange={(e) => setPublicationDate(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
                <Label>Tags</Label>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Separe por vírgula" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar Documento'}</Button>
        </div>
      </form>
    </div>
  );
}