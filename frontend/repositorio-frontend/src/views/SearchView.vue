<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import http from '@/services/http';

const auth = useAuthStore();
const router = useRouter();

// Estado
const documentos = ref([]);
const loading = ref(true);
const searchTerm = ref('');
const filters = ref({
  categoria: '',
  status: '',
  dataInicio: '',
  dataFim: ''
});

// Mock de dados para preencher visualmente (conforme imagem)
// Em produção, isso viria do backend misturado com os dados reais
const mockDocs = [
  {
    id: 101,
    titulo: 'Relatório Anual 2024',
    descricao: 'Relatório completo das atividades e resultados do ano de 2024',
    dataPublicacao: '14/11/2024',
    autor: 'João Silva',
    categoria: 'Relatórios',
    tamanho: '2.5 MB',
    formato: 'PDF',
    status: 'APROVADO',
    tags: ['anual', 'relatório', '2024']
  },
  {
    id: 102,
    titulo: 'Política de Privacidade',
    descricao: 'Documento com as diretrizes de privacidade da empresa',
    dataPublicacao: '19/11/2024',
    autor: 'Maria Santos',
    categoria: 'Políticas',
    tamanho: '850 KB',
    formato: 'DOCX',
    status: 'PENDENTE',
    tags: ['política', 'privacidade', 'lgpd']
  },
  {
    id: 103,
    titulo: 'Plano de Marketing Q1 2025',
    descricao: 'Estratégias de marketing para o primeiro trimestre de 2025',
    dataPublicacao: '21/11/2024',
    autor: 'Ana Costa',
    categoria: 'Planejamento',
    tamanho: '1.2 MB',
    formato: 'PPTX',
    status: 'PENDENTE',
    tags: ['marketing', 'planejamento', 'q1']
  }
];

// Computed para filtrar documentos
const filteredDocuments = computed(() => {
  // Combina dados reais da API com o mock para visualização
  const allDocs = [...mockDocs, ...documentos.value];

  return allDocs.filter(doc => {
    const searchLower = searchTerm.value.toLowerCase();
    const matchesSearch = doc.titulo.toLowerCase().includes(searchLower) ||
                          (doc.descricao && doc.descricao.toLowerCase().includes(searchLower));

    const matchesCategory = !filters.value.categoria || doc.categoria === filters.value.categoria;
    const matchesStatus = !filters.value.status || doc.status === filters.value.status;

    return matchesSearch && matchesCategory && matchesStatus;
  });
});

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};

const fetchDocumentos = async () => {
  try {
    const { data } = await http.get('/documentos');
    // Adiciona campos visuais que faltam na API real para ficar igual ao layout
    const docsFormatados = data.map(d => ({
        ...d,
        categoria: d.tipo, // Adaptação
        autor: d.nomeAutor || 'Desconhecido',
        tamanho: '1.0 MB', // Mock
        formato: 'PDF', // Mock
        status: 'APROVADO', // Documentos públicos são aprovados
        tags: ['geral'] // Mock
    }));
    documentos.value = docsFormatados;
  } catch (error) {
    console.error("Erro ao buscar documentos", error);
  } finally {
    loading.value = false;
  }
};

const limparFiltros = () => {
    filters.value = {
        categoria: '',
        status: '',
        dataInicio: '',
        dataFim: ''
    };
    searchTerm.value = '';
};

onMounted(() => {
  fetchDocumentos();
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
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span class="text-sm font-medium">Dashboard</span>
        </router-link>

        <router-link to="/upload" class="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span class="text-sm font-medium">Enviar Documentos</span>
        </router-link>

        <a href="#" class="flex items-center px-4 py-3 bg-blue-50 text-blue-600 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span class="text-sm font-medium">Consulta</span>
        </a>

        <a href="#" class="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium">Aprovação</span>
        </a>

        <a href="#" class="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span class="text-sm font-medium">Usuários</span>
        </a>
      </nav>

      <div class="p-4 border-t border-gray-100">
        <button @click="handleLogout" class="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </button>
      </div>
    </aside>

    <main class="flex-1 md:ml-64 p-8 overflow-y-auto">

      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800">Consulta de Documentos</h2>
        <p class="text-gray-500">Pesquise e filtre documentos do repositório</p>
      </div>

      <div class="mb-6 relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
             <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex gap-2">
            <input
              v-model="searchTerm"
              type="text"
              class="block w-full pl-10 pr-3 py-3 border-none rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-0 shadow-sm sm:text-sm"
              placeholder="Pesquisar por título, descrição ou tags..."
            >
            <button class="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
            </button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
         <h3 class="text-sm font-bold text-gray-800 mb-1">Filtros Avançados</h3>
         <p class="text-xs text-gray-500 mb-4">Refine sua pesquisa usando os filtros abaixo</p>

         <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Categoria</label>
                <select v-model="filters.categoria" class="w-full bg-gray-50 border-none rounded-lg text-sm p-2.5 text-gray-600 focus:ring-2 focus:ring-blue-100">
                    <option value="">Todas</option>
                    <option value="Relatórios">Relatórios</option>
                    <option value="Políticas">Políticas</option>
                    <option value="Planejamento">Planejamento</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
                <select v-model="filters.status" class="w-full bg-gray-50 border-none rounded-lg text-sm p-2.5 text-gray-600 focus:ring-2 focus:ring-blue-100">
                    <option value="">Todos</option>
                    <option value="APROVADO">Aprovado</option>
                    <option value="PENDENTE">Pendente</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Data Início</label>
                <input v-model="filters.dataInicio" type="date" class="w-full bg-gray-50 border-none rounded-lg text-sm p-2.5 text-gray-400 focus:ring-2 focus:ring-blue-100">
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Data Fim</label>
                <input v-model="filters.dataFim" type="date" class="w-full bg-gray-50 border-none rounded-lg text-sm p-2.5 text-gray-400 focus:ring-2 focus:ring-blue-100">
            </div>
         </div>
         <div class="mt-4 flex justify-end">
            <button @click="limparFiltros" class="text-xs text-gray-500 hover:text-gray-700 font-medium">Limpar Filtros</button>
         </div>
      </div>

      <div class="mb-4 text-sm text-gray-500">
         {{ filteredDocuments.length }} documentos encontrados
      </div>

      <div class="space-y-4">
         <div v-for="doc in filteredDocuments" :key="doc.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
             <div class="flex flex-col sm:flex-row justify-between items-start gap-4">

                 <div class="flex gap-4 w-full">
                     <div class="bg-blue-50 p-3 rounded-xl text-blue-600 h-12 w-12 flex items-center justify-center flex-shrink-0">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                         </svg>
                     </div>

                     <div class="flex-1">
                         <div class="flex justify-between items-start">
                             <h4 class="text-base font-bold text-gray-900 mb-1">{{ doc.titulo }}</h4>
                             <span
                                :class="[
                                    'px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                                    doc.status === 'APROVADO' ? 'bg-green-50 text-green-600 border-green-100' :
                                    doc.status === 'PENDENTE' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-gray-100 text-gray-600 border-gray-200'
                                ]"
                             >
                                 {{ doc.status === 'APROVADO' ? 'Aprovado' : doc.status === 'PENDENTE' ? 'Pendente' : doc.status }}
                             </span>
                         </div>
                         <p class="text-sm text-gray-500 mb-3">{{ doc.descricao }}</p>

                         <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mb-3">
                             <div class="flex items-center gap-1">
                                 <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                 {{ doc.dataPublicacao }}
                             </div>
                             <div class="flex items-center gap-1">
                                 <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                 {{ doc.autor }}
                             </div>
                             <div class="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                 <span class="font-medium">{{ doc.categoria }}</span>
                             </div>
                             <div class="flex items-center gap-1">
                                 <span>&bull;</span> {{ doc.tamanho }}
                             </div>
                             <div class="flex items-center gap-1 uppercase bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-600">
                                 {{ doc.formato }}
                             </div>
                         </div>

                         <div class="flex flex-wrap gap-2 mb-4">
                             <span v-for="tag in doc.tags" :key="tag" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                 {{ tag }}
                             </span>
                         </div>

                         <div class="flex gap-3">
                             <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                 <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                 Visualizar
                             </button>
                             <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                 <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                 Download
                             </button>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </div>

    </main>

    <button class="fixed bottom-6 right-6 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition transform hover:scale-105 z-50">
      <span class="font-bold text-lg">?</span>
    </button>
  </div>
</template>
