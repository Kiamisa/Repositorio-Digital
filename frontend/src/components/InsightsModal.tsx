import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Brain, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumo: string | null;
  isLoading: boolean;
}

export function InsightsModal({ isOpen, onClose, resumo, isLoading }: InsightsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-700">
            <Brain className="w-5 h-5" />
            Insights & Resumo Inteligente
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 text-gray-700 leading-relaxed">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <p className="text-sm text-gray-500">Lendo documento e gerando insights com IA...</p>
            </div>
          ) : resumo ? (
            <div className="prose prose-blue max-w-none">
              <ReactMarkdown>{resumo}</ReactMarkdown>
            </div>
          ) : (
            <p>Nenhum insight disponível.</p>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}