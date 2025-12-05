import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import api from "../services/api";

// Interface para os dados do documento
interface Documento {
  id: number;
  titulo: string;
  descricao: string;
  tipo: string;
  dataPublicacao: string;
  programaId?: number; 
}

// Interface para os Programas vindos do banco
interface Programa {
  id: number;
  nome: string;
  sigla: string;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  documento: Documento | null;
}

export function EditDocumentModal({ isOpen, onClose, onSuccess, documento }: EditModalProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "",
    dataPublicacao: "",
    programaId: "",
  });
  const [novoArquivo, setNovoArquivo] = useState<File | null>(null);
  const [programas, setProgramas] = useState<Programa[]>([]); // Estado para lista de programas
  const [loading, setLoading] = useState(false);

  // Busca a lista de programas ao carregar o componente
  useEffect(() => {
    api.get("/programas")
      .then((response) => setProgramas(response.data))
      .catch((err) => console.error("Erro ao carregar programas", err));
  }, []);

  useEffect(() => {
    if (documento) {
      setFormData({
        titulo: documento.titulo,
        descricao: documento.descricao,
        tipo: documento.tipo,
        dataPublicacao: documento.dataPublicacao,
        // Garante que o ID do programa seja carregado
        programaId: documento.programaId ? String(documento.programaId) : "",
      });
      setNovoArquivo(null);
    }
  }, [documento]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNovoArquivo(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!documento) return;

    try {
      setLoading(true);

      const data = new FormData();
      data.append("titulo", formData.titulo);
      data.append("descricao", formData.descricao);
      data.append("tipo", formData.tipo);
      data.append("dataPublicacao", formData.dataPublicacao);
      // Envia o ID do programa atualizado
      data.append("programaId", formData.programaId);

      if (novoArquivo) {
        data.append("arquivo", novoArquivo);
      }

      await api.put(`/documentos/${documento.id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Documento atualizado com sucesso!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar", error);
      alert("Erro ao atualizar documento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Adicionado bg-white para remover transparência e z-50 para garantir sobreposição */}
      <DialogContent className="sm:max-w-[500px] bg-white z-50 shadow-lg border border-gray-200">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Input
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                placeholder="Ex: Edital"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dataPublicacao">Data Publicação</Label>
              <Input
                id="dataPublicacao"
                name="dataPublicacao"
                type="date"
                value={formData.dataPublicacao}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Campo Alterado: Select de Programas */}
          <div className="grid gap-2">
            <Label htmlFor="programaId">Programa</Label>
            <select
              id="programaId"
              name="programaId"
              value={formData.programaId}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione um programa</option>
              {programas.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.sigla} - {prog.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="arquivo">Substituir Arquivo (Opcional)</Label>
            <Input
              id="arquivo"
              type="file"
              onChange={handleFileChange}
            />
            <p className="text-xs text-gray-500">
              Deixe em branco para manter o atual.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}