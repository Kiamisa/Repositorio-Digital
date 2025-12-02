<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import http from '@/services/http';

const auth = useAuthStore();
const router = useRouter();

const users = ref([]);
const loading = ref(true);
const searchTerm = ref('');

// Dados Mockados para complementar o visual (já que a API atual retorna dados básicos)
// Isso garante que a tela fique idêntica ao design enquanto o backend evolui
const mockDepartamentos = ['TI', 'Recursos Humanos', 'Financeiro', 'Marketing', 'Jurídico'];
const getRandomDept = () => mockDepartamentos[Math.floor(Math.random() * mockDepartamentos.length)];
const getRandomDate = () => {
    const dates = ['14/01/2024', '19/02/2024', '09/03/2024', '04/01/2024', '27/02/2024'];
    return dates[Math.floor(Math.random() * dates.length)];
};

// Estatísticas Computadas
const stats = computed(() => {
    const total = users.value.length;
    const ativos = users.value.filter(u => u.ativo).length;
    const admins = users.value.filter(u => u.perfil === 'ADMIN').length;
    const aprovadores = users.value.filter(u => u.perfil === 'GESTOR').length;
    const pendentes = 0; // Se houver lógica de aprovação de usuário futuro

    return { total, ativos, admins, aprovadores, pendentes };
});

// Filtro de Pesquisa
const filteredUsers = computed(() => {
    if (!searchTerm.value) return users.value;
    const term = searchTerm.value.toLowerCase();
    return users.value.filter(u =>
        u.nome.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
});

const fetchUsers = async () => {
    try {
        const { data } = await http.get('/usuarios');
        // Mapeia os dados reais e adiciona mocks visuais para ficar igual ao design
        users.value = data.map(u => ({
            ...u,
            departamento: getRandomDept(), // Mock
            criadoEm: getRandomDate(),     // Mock
            roleLabel: u.perfil === 'ADMIN' ? 'Administrador' : u.perfil === 'GESTOR' ? 'Aprovador' : 'Usuário',
            statusLabel: u.ativo ? 'Ativo' : 'Inativo'
        }));
    } catch (error) {
        console.error("Erro ao buscar usuários", error);
    } finally {
        loading.value = false;
    }
};

const handleLogout = () => {
    auth.logout();
    router.push('/login');
};

const getRoleBadgeClass = (perfil) => {
    switch (perfil) {
        case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'GESTOR': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

onMounted(() => {
    fetchUsers();
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

        <router-link to="/aprovacao" class="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span class="text-sm font-medium">Aprovação</span>
        </router-link>

        <a href="#" class="flex items-center px-4 py-3 bg-blue-50 text-blue-600 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
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

      <div class="flex justify-between items-center mb-8">
        <div>
            <h2 class="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h2>
            <p class="text-gray-500">Gerencie usuários e suas permissões</p>
        </div>
        <button class="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Adicionar Usuário
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
                <p class="text-xs font-medium text-gray-500 mb-1">Total de Usuários</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.total }}</h3>
            </div>
            <div class="text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
                <p class="text-xs font-medium text-gray-500 mb-1">Usuários Ativos</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.ativos }}</h3>
            </div>
            <div class="text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
                <p class="text-xs font-medium text-gray-500 mb-1">Administradores</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.admins }}</h3>
            </div>
            <div class="text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
                <p class="text-xs font-medium text-gray-500 mb-1">Aprovadores</p>
                <h3 class="text-2xl font-bold text-gray-800">{{ stats.aprovadores }}</h3>
            </div>
            <div class="text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
        </div>
      </div>

      <div class="mb-8">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 inline-block min-w-[200px]">
              <div class="flex items-center justify-between gap-4">
                  <div>
                      <p class="text-xs font-medium text-gray-500">Pendentes</p>
                      <h3 class="text-xl font-bold text-gray-800">{{ stats.pendentes }}</h3>
                  </div>
                  <div class="text-orange-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
              </div>
          </div>
      </div>

      <div class="mb-6 bg-white p-1 rounded-lg border border-gray-100 shadow-sm max-w-3xl">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                v-model="searchTerm"
                type="text"
                class="block w-full pl-10 pr-3 py-2.5 border-none rounded-md leading-5 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                placeholder="Pesquisar por nome, email ou departamento..."
            >
          </div>
      </div>

      <div>
          <h3 class="text-sm font-bold text-gray-800 mb-4">Usuários ({{ filteredUsers.length }})</h3>
          <p class="text-xs text-gray-500 mb-4 -mt-3">Lista de todos os usuários do sistema</p>

          <div class="space-y-3">
              <div v-for="user in filteredUsers" :key="user.id" class="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">

                  <div class="flex items-center gap-4">
                      <div class="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                      </div>

                      <div>
                          <div class="flex items-center gap-2">
                              <h4 class="text-sm font-bold text-gray-900">{{ user.nome }}</h4>

                              <span :class="['px-2 py-0.5 rounded text-[10px] font-medium border', getRoleBadgeClass(user.perfil)]">
                                  {{ user.roleLabel }}
                              </span>

                              <span :class="['px-2 py-0.5 rounded text-[10px] font-medium border', user.ativo ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200']">
                                  {{ user.statusLabel }}
                              </span>
                          </div>

                          <div class="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <span>{{ user.email }}</span>
                              <span>&bull;</span>
                              <span>{{ user.departamento }}</span>
                              <span>&bull;</span>
                              <span>Criado em {{ user.criadoEm }}</span>
                          </div>
                      </div>
                  </div>

                  <button class="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                  </button>

              </div>
          </div>
      </div>

    </main>

    <button class="fixed bottom-6 right-6 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition transform hover:scale-105 z-50">
      <span class="font-bold text-lg">?</span>
    </button>
  </div>
</template>
