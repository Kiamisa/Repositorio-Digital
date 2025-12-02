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

// Mock de dados para a seção inferior (simulando a imagem)
const activityStats = {
  enviados: 24,
  aprovados: 18,
  taxa: '75%'
};

const popularCategories = [
  { name: 'Relatórios', count: '8 docs' },
  { name: 'Financeiro', count: '6 docs' },
  { name: 'Políticas', count: '4 docs' }
];

// Estatísticas Computadas (Topo)
const stats = computed(() => {
  const total = documentos.value.length;
  return {
    total: total + (auth.isAdminOrGestor ? 3 : 0),
    pendentes: auth.isAdminOrGestor ? 2 : 0,
    aprovados: total,
    rejeitados: 1
  };
});

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};

const fetchDocumentos = async () => {
  try {
    const { data } = await http.get('/documentos');
    documentos.value = data;
  } catch (error) {
    console.error("Erro ao carregar dashboard", error);
  } finally {
    loading.value = false;
  }
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
        <a href="#" class="flex items-center px-4 py-3 bg-blue-50 text-blue-600 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span class="text-sm font-medium">Dashboard</span>
        </a>
        <a href="#" class="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span class="text-sm font-medium">Enviar Documentos</span>
        </a>
        <a href="#" class="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <h2 class="text-2xl font-bold text-gray-800">Olá, {{ auth.user?.nome || 'Usuário' }}!</h2>
        <p class="text-gray-500">Bem-vindo ao painel de controle do repositório digital</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-start mb-4">
            <span class="text-gray-500 text-sm font-medium">Total de Documentos</span>
            <div class="bg-gray-100 p-1.5 rounded text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-gray-800 mb-1">{{ stats.total }}</div>
          <div class="text-xs text-gray-400">Todos os documentos</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-start mb-4">
            <span class="text-gray-500 text-sm font-medium">Pendentes</span>
            <div class="bg-yellow-50 p-1.5 rounded text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-gray-800 mb-1">{{ stats.pendentes }}</div>
          <div class="text-xs text-gray-400">Aguardando aprovação</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-start mb-4">
            <span class="text-gray-500 text-sm font-medium">Aprovados</span>
            <div class="bg-green-50 p-1.5 rounded text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-gray-800 mb-1">{{ stats.aprovados }}</div>
          <div class="text-xs text-gray-400">Documentos aprovados</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-start mb-4">
            <span class="text-gray-500 text-sm font-medium">Rejeitados</span>
            <div class="bg-red-50 p-1.5 rounded text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-gray-800 mb-1">{{ stats.rejeitados }}</div>
          <div class="text-xs text-gray-400">Documentos rejeitados</div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-gray-900">Documentos Recentes</h3>
          <p class="text-sm text-gray-500">Últimos documentos adicionados ao sistema</p>
        </div>

        <div class="space-y-4">
          <div v-for="doc in documentos" :key="doc.id" class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div class="flex items-start gap-4">
              <div class="bg-blue-50 p-3 rounded-lg text-blue-600 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">{{ doc.titulo }}</h4>
                <p class="text-sm text-gray-500 mb-1">{{ doc.descricao || 'Sem descrição' }}</p>
                <div class="flex items-center gap-3 text-xs text-gray-400">
                  <span>Por {{ doc.nomeAutor || 'Desconhecido' }}</span>
                  <span>&bull;</span>
                  <span>{{ doc.dataPublicacao }}</span>
                  <span>&bull;</span>
                  <span class="uppercase bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{{ doc.tipo }}</span>
                </div>
              </div>
            </div>
            <div class="mt-4 sm:mt-0 flex items-center">
              <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                Aprovado
              </span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors opacity-70">
            <div class="flex items-start gap-4">
              <div class="bg-blue-50 p-3 rounded-lg text-blue-600 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Plano de Marketing Q1 2025</h4>
                <p class="text-sm text-gray-500 mb-1">Estratégias de marketing para o primeiro trimestre</p>
                <div class="flex items-center gap-3 text-xs text-gray-400">
                  <span>Por Ana Costa</span>
                  <span>&bull;</span>
                  <span>21/11/2024</span>
                </div>
              </div>
            </div>
            <div class="mt-4 sm:mt-0 flex items-center">
              <span class="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                Pendente
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 class="text-lg font-bold text-gray-900">Atividade do Mês</h3>
          </div>

          <div class="space-y-5">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500">Documentos enviados</span>
              <span class="font-semibold text-gray-900">{{ activityStats.enviados }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500">Documentos aprovados</span>
              <span class="font-semibold text-gray-900">{{ activityStats.aprovados }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500">Taxa de aprovação</span>
              <span class="font-semibold text-gray-900">{{ activityStats.taxa }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 class="text-lg font-bold text-gray-900">Categorias Populares</h3>
          </div>

          <div class="space-y-5">
            <div v-for="cat in popularCategories" :key="cat.name" class="flex justify-between items-center text-sm">
              <span class="text-gray-500">{{ cat.name }}</span>
              <span class="font-semibold text-gray-900">{{ cat.count }}</span>
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
