<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import http from '@/services/http';

const auth = useAuthStore();
const router = useRouter();
const fileInput = ref(null);

// Estado do Formulário
const form = ref({
  titulo: '',
  descricao: '',
  categoria: '',
  tags: '', // Visual (Backend não tem esse campo, mas mantive pelo layout)
  arquivo: null
});

const fileName = ref('');
const isDragging = ref(false);
const loading = ref(false);

// Opções de Categoria (Mapeado para o Enum do Backend)
const categorias = [
  { label: 'Editais', value: 'EDITAIS' },
  { label: 'Resultados', value: 'RESULTADOS' },
  { label: 'Formulários', value: 'FORMULARIOS' },
  { label: 'Outros', value: 'OUTROS' },
  { label: 'Documentações', value: 'DOCUMENTACOES' },
  { label: 'Resoluções', value: 'RESOLUCOES' }
];

// --- AÇÕES DE ARQUIVO ---
const onFileSelect = (event) => {
  const files = event.target.files;
  if (files.length > 0) processFile(files[0]);
};

const onDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  if (files.length > 0) processFile(files[0]);
};

const processFile = (file) => {
  // Validação simples de tamanho (50MB)
  if (file.size > 50 * 1024 * 1024) {
    alert("Arquivo muito grande! Máximo 50MB.");
    return;
  }
  form.value.arquivo = file;
  fileName.value = file.name;
};

// --- ENVIO ---
const handleSubmit = async () => {
  if (!form.value.arquivo) {
    alert("Por favor, selecione um arquivo.");
    return;
  }

  loading.value = true;

  try {
    const formData = new FormData();
    formData.append('titulo', form.value.titulo);
    // Adicionamos as tags na descrição para não perder a informação, já que o backend não tem campo tags
    const descFinal = form.value.tags
        ? `${form.value.descricao}\n\nTags: ${form.value.tags}`
        : form.value.descricao;

    formData.append('descricao', descFinal);
    formData.append('tipo', form.value.categoria);
    formData.append('dataPublicacao', new Date().toISOString().split('T')[0]); // Data de hoje
    formData.append('programaId', 1); // Fixo por enquanto
    formData.append('arquivo', form.value.arquivo);

    await http.post('/documentos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    alert("Documento enviado com sucesso!");
    router.push('/dashboard');
  } catch (error) {
    console.error(error);
    alert("Erro ao enviar documento.");
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};
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

        <a href="#" class="flex items-center px-4 py-3 bg-blue-50 text-blue-600 rounded-lg group transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <h2 class="text-2xl font-bold text-gray-800">Enviar Documento</h2>
        <p class="text-gray-500">Faça upload de um novo documento para o repositório</p>
      </div>

      <div class="max-w-4xl space-y-6">

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div class="mb-4">
             <h3 class="text-sm font-bold text-gray-900">Arquivo</h3>
             <p class="text-xs text-gray-500">Arraste e solte ou clique para selecionar o arquivo</p>
          </div>

          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            :class="[
               'border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center transition-colors',
               isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
            ]"
          >
             <div v-if="!form.arquivo" class="text-center">
                <div class="bg-gray-100 p-3 rounded-full inline-flex mb-3">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                   </svg>
                </div>
                <p class="text-sm text-gray-500 mb-1">Arraste e solte seu arquivo aqui</p>
                <p class="text-xs text-gray-400 mb-4">ou</p>

                <input type="file" ref="fileInput" class="hidden" @change="onFileSelect" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt">
                <button
                  @click="$refs.fileInput.click()"
                  class="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Selecionar Arquivo
                </button>
                <p class="text-[10px] text-gray-400 mt-4">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT (máx. 50MB)</p>
             </div>

             <div v-else class="text-center">
                <div class="bg-blue-100 p-3 rounded-full inline-flex mb-3">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                </div>
                <p class="text-sm font-medium text-gray-900">{{ fileName }}</p>
                <button @click="form.arquivo = null; fileName = ''" class="text-xs text-red-500 hover:underline mt-2">Remover arquivo</button>
             </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div class="mb-6">
             <h3 class="text-sm font-bold text-gray-900">Informações do Documento</h3>
             <p class="text-xs text-gray-500">Preencha os detalhes sobre o documento</p>
          </div>

          <div class="space-y-5">
             <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Título *</label>
                <input v-model="form.titulo" type="text" placeholder="Digite o título do documento" class="w-full bg-gray-50 border-none rounded-lg text-sm p-3 focus:ring-2 focus:ring-blue-100">
             </div>

             <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">Descrição *</label>
                <textarea v-model="form.descricao" rows="3" placeholder="Descreva brevemente o conteúdo do documento" class="w-full bg-gray-50 border-none rounded-lg text-sm p-3 focus:ring-2 focus:ring-blue-100"></textarea>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5">Categoria *</label>
                  <select v-model="form.categoria" class="w-full bg-gray-50 border-none rounded-lg text-sm p-3 focus:ring-2 focus:ring-blue-100 text-gray-600">
                     <option value="" disabled selected>Selecione uma categoria</option>
                     <option v-for="cat in categorias" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5">Tags</label>
                  <input v-model="form.tags" type="text" placeholder="ex: importante, urgente, revisão" class="w-full bg-gray-50 border-none rounded-lg text-sm p-3 focus:ring-2 focus:ring-blue-100">
                  <p class="text-[10px] text-gray-400 mt-1">Separe as tags por vírgula</p>
                </div>
             </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
           <button
             @click="router.push('/dashboard')"
             class="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
           >
             Cancelar
           </button>
           <button
             @click="handleSubmit"
             :disabled="loading"
             class="px-6 py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
           >
             {{ loading ? 'Enviando...' : 'Enviar Documento' }}
           </button>
        </div>

      </div>
    </main>

    <button class="fixed bottom-6 right-6 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition transform hover:scale-105 z-50">
      <span class="font-bold text-lg">?</span>
    </button>
  </div>
</template>
