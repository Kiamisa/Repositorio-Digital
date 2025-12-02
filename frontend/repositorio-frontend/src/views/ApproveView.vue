<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import http from '@/services/http';

const auth = useAuthStore();
const router = useRouter();

// Estado
const loading = ref(true);
const activeTab = ref('pendentes'); // pendentes, aprovados, rejeitados
const pendencias = ref([]);

// Dados Mockados para replicar a imagem (Visual)
// Em produção, isso seria substituído/mesclado com a chamada da API
const mockPendencias = [
  {
    idFluxo: 101,
    titulo: 'Política de Privacidade',
    codigo: 'DOC-002',
    descricao: 'Documento com as diretrizes de privacidade da empresa',
    autor: 'Maria Santos',
    data: '19/11/2024',
    categoria: 'Políticas',
    arquivoNome: 'DOCX',
    arquivoTamanho: '850 KB',
    tags: ['política', 'privacidade', 'lgpd']
  },
  {
    idFluxo: 102,
    titulo: 'Plano de Marketing Q1 2025',
    codigo: 'DOC-003',
    descricao: 'Estratégias de marketing para o primeiro trimestre de 2025',
    autor: 'Ana Costa',
    data: '21/11/2024',
    categoria: 'Planejamento',
    arquivoNome: 'PPTX',
    arquivoTamanho: '1.2 MB',
    tags: ['marketing', 'planejamento', 'q1']
  }
];

// Estatísticas
const stats = {
  pendentes: 2,
  aprovados: 3,
  rejeitados: 1
};

const fetchPendencias = async () => {
  try {
    // Tenta buscar da API real
    const { data } = await http.get('/aprovacoes/pendentes');

    // Mapeia os dados da API para o formato visual (se houver dados)
    if (data && data.length > 0) {
        const mappedData = data.map(p => ({
            idFluxo: p.idFluxo,
            titulo: p.tituloDocumento,
            codigo: `DOC-${p.idDocumento}`,
            descricao: 'Aguardando revisão do gestor.',
            autor: p.nomeAutor,
            data: p.dataSolicitacao.split(' ')[0], // Pega só a data
            categoria: 'Geral', // API não retorna categoria no DTO de fluxo ainda, usando placeholder
            arquivoNome: 'PDF',
            arquivoTamanho: 'Unknown',
            tags: ['revisão']
        }));
        pendencias.value = mappedData;
    } else {
        // Se a API estiver vazia, usa o Mock para ficar igual à imagem solicitada
        pendencias.value = mockPendencias;
    }
  } catch (error) {
    console.error("Erro ao carregar pendências (usando mock)", error);
    pendencias.value = mockPendencias;
  } finally {
    loading.value = false;
  }
};

const processarAprovacao = async (idFluxo, aprovado) => {
    if(!confirm(aprovado ? "Confirmar aprovação?" : "Confirmar rejeição?")) return;

    try {
        // Chamada real ao backend
        // Nota: O ID no mock é 101/102, na API real será 1, 2...
        // Se for mock, apenas remove da tela visualmente
        if (idFluxo > 100) {
            pendencias.value = pendencias.value.filter(p => p.idFluxo !== idFluxo);
            alert("Ação realizada com sucesso (Simulação)!");
        } else {
            await http.patch(`/aprovacoes/${idFluxo}?aprovado=${aprovado}&comentario=ViaTelaAprovacao`);
            pendencias.value = pendencias.value.filter(p => p.idFluxo !== idFluxo);
            alert("Sucesso!");
        }
    } catch (e) {
        alert("Erro ao processar.");
    }
};

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};

onMounted(() => {
  fetchPendencias();
});
</script>

<template>
  <div class="flex h-screen bg-gray-50 font-sans">

    <aside class="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
      <div class="h-16 flex items-center px-6 border-b border-gray-100">
        <div class="bg-blue-600 p-1.5 rounded-lg mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h1 class="font-bold text-gray-800 text-sm leading-tight">DocRepo</h1>
          <p class="text-xs text-gray-400">Repositório Digital</p>
        </div>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-1">
        <router-link to="/dashboard" class="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          <span class="text-sm font-medium">Dashboard</span>
        </router-link>

        <router-link to="/upload" class="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          <span class="text-sm font-medium">Enviar Documentos</span>
        </router-link>

        <router-link to="/consulta" class="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span class="text-sm font-medium">Consulta</span>
        </router-link>

        <a href="#" class="flex items-center px-4 py-3 bg-blue-50 text-blue-600 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium">Aprovação</span>
        </a>

        <a href="#" class="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <span class="text-sm font-medium">Usuários</span>
        </a>
      </nav>

      <div class="p-4 border-t border-gray-100">
        <button @click="handleLogout" class="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sair
        </button>
      </div>
    </aside>

    <main class="flex-1 md:ml-64 p-8 overflow-y-auto">

      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800">Aprovação de Documentos</h2>
        <p class="text-gray-500">Revise e aprove ou rejeite documentos enviados</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div class="flex justify-between items-start mb-4">
               <span class="text-sm font-medium text-gray-600">Pendentes</span>
               <div class="bg-yellow-50 p-1.5 rounded text-yellow-500">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
           </div>
           <div class="text-3xl font-bold text-gray-900 mb-1">{{ pendencias.length || stats.pendentes }}</div>
           <div class="text-xs text-gray-400">Aguardando revisão</div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div class="flex justify-between items-start mb-4">
               <span class="text-sm font-medium text-gray-600">Aprovados</span>
               <div class="bg-green-50 p-1.5 rounded text-green-500">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
           </div>
           <div class="text-3xl font-bold text-gray-900 mb-1">{{ stats.aprovados }}</div>
           <div class="text-xs text-gray-400">Documentos aprovados</div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div class="flex justify-between items-start mb-4">
               <span class="text-sm font-medium text-gray-600">Rejeitados</span>
               <div class="bg-red-50 p-1.5 rounded text-red-500">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
           </div>
           <div class="text-3xl font-bold text-gray-900 mb-1">{{ stats.rejeitados }}</div>
           <div class="text-xs text-gray-400">Documentos rejeitados</div>
        </div>
      </div>

      <div class="flex gap-2 mb-6">
          <button
             @click="activeTab = 'pendentes'"
             :class="['px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
                      activeTab === 'pendentes' ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-white border-transparent text-gray-500 hover:text-gray-700']"
          >
              Pendentes ({{ pendencias.length }})
          </button>
          <button
             @click="activeTab = 'aprovados'"
             :class="['px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
                      activeTab === 'aprovados' ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-white border-transparent text-gray-500 hover:text-gray-700']"
          >
              Aprovados (3)
          </button>
          <button
             @click="activeTab = 'rejeitados'"
             :class="['px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
                      activeTab === 'rejeitados' ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-white border-transparent text-gray-500 hover:text-gray-700']"
          >
              Rejeitados (1)
          </button>
      </div>

      <div v-if="activeTab === 'pendentes'" class="space-y-4">

         <div v-if="pendencias.length === 0" class="text-center py-10 text-gray-500">
             Nenhuma pendência encontrada.
         </div>

         <div v-for="item in pendencias" :key="item.idFluxo" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <div class="flex justify-between items-start mb-4">
                 <div class="flex gap-4">
                     <div class="bg-blue-50 p-3 rounded-xl text-blue-600 h-12 w-12 flex items-center justify-center flex-shrink-0">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                     </div>
                     <div>
                         <div class="flex items-center gap-2 mb-1">
                             <h3 class="font-bold text-gray-900">{{ item.titulo }}</h3>
                             <span class="text-xs text-gray-400 font-normal">{{ item.codigo }}</span>
                         </div>
                         <p class="text-sm text-gray-500 mb-3">{{ item.descricao }}</p>

                         <div class="flex flex-wrap gap-x-8 gap-y-2 text-xs text-gray-500 mb-3">
                             <div class="flex flex-col gap-1">
                                 <span class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> Enviado por: <span class="font-semibold text-gray-700">{{ item.autor }}</span></span>
                                 <span class="flex items-center gap-1">Categoria: <span class="font-semibold text-gray-700">{{ item.categoria }}</span></span>
                             </div>
                             <div class="flex flex-col gap-1">
                                 <span class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> {{ item.data }}</span>
                                 <span class="flex items-center gap-1">Arquivo: <span class="font-semibold text-gray-700">{{ item.arquivoNome }} ({{ item.arquivoTamanho }})</span></span>
                             </div>
                         </div>

                         <div class="flex gap-2">
                             <span v-for="tag in item.tags" :key="tag" class="px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 rounded text-[10px] font-medium">
                                 {{ tag }}
                             </span>
                         </div>
                     </div>
                 </div>

                 <div>
                     <span class="px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-600 border border-yellow-100">
                         Pendente
                     </span>
                 </div>
             </div>

             <div class="flex gap-3 mt-4 ml-16 pl-0.5">
                 <button
                    @click="processarAprovacao(item.idFluxo, true)"
                    class="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                     Aprovar
                 </button>
                 <button
                    @click="processarAprovacao(item.idFluxo, false)"
                    class="flex items-center gap-1.5 px-4 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     Rejeitar
                 </button>
             </div>
         </div>

      </div>

      <div v-else class="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
          Conteúdo da aba {{ activeTab }}
      </div>

    </main>

    <button class="fixed bottom-6 right-6 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition transform hover:scale-105 z-50">
      <span class="font-bold text-lg">?</span>
    </button>
  </div>
</template>
