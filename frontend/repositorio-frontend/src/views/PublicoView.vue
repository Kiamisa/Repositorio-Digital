<script setup>
import { ref, onMounted } from 'vue';
import http from '@/services/http';

const documentos = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    // Busca apenas documentos aprovados (endpoint público)
    const { data } = await http.get('/documentos');
    documentos.value = data;
  } catch (error) {
    console.error("Erro ao carregar documentos", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">
          Repositório Institucional PPG
        </h1>
        <router-link to="/login" class="text-blue-600 hover:text-blue-800 font-medium">
          Área Restrita (Login)
        </router-link>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="text-center py-10">
        <p class="text-gray-500">Carregando documentos...</p>
      </div>

      <div v-else-if="documentos.length === 0" class="text-center py-10">
        <p class="text-gray-500">Nenhum documento publicado ainda.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="doc in documentos" :key="doc.id" class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center justify-between mb-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ doc.tipo }}
                </span>
                <span class="text-xs text-gray-500">{{ doc.dataPublicacao }}</span>
            </div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 truncate" :title="doc.titulo">
              {{ doc.titulo }}
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              Programa: {{ doc.nomePrograma }}
            </p>
             <p class="mt-2 text-sm text-gray-600 line-clamp-3">
              {{ doc.descricao }}
            </p>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6">
             <a :href="`http://localhost:8080${doc.urlDownload}`" target="_blank" class="text-sm font-medium text-blue-600 hover:text-blue-500">
                Baixar Arquivo &rarr;
             </a>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
