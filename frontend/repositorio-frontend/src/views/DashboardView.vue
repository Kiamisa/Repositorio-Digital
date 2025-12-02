<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import http from '@/services/http';

const auth = useAuthStore();
const router = useRouter();

// Estado do Upload
const fileInput = ref(null);
const uploadStatus = ref('');
const form = ref({
  titulo: '',
  descricao: '',
  tipo: 'OUTROS',
  dataPublicacao: new Date().toISOString().split('T')[0], // Hoje
  programaId: 1 // Fixo por enquanto (PPG)
});

// Estado da Aprovação
const pendencias = ref([]);

// Verifica se é Gestor ou Admin
const podeAprovar = computed(() => ['ADMIN', 'GESTOR'].includes(auth.user?.perfil));

// --- AÇÕES ---

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};

const handleUpload = async () => {
  uploadStatus.value = 'Enviando...';

  try {
    const formData = new FormData();
    formData.append('titulo', form.value.titulo);
    formData.append('descricao', form.value.descricao);
    formData.append('tipo', form.value.tipo);
    formData.append('dataPublicacao', form.value.dataPublicacao);
    formData.append('programaId', form.value.programaId);

    // Pega o arquivo do input ref
    if (fileInput.value.files[0]) {
        formData.append('arquivo', fileInput.value.files[0]);
    }

    await http.post('/documentos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    uploadStatus.value = 'Sucesso! Documento enviado.';
    // Limpa form
    form.value.titulo = '';
    form.value.descricao = '';
    fileInput.value.value = null; // Reseta input file

    // Se for gestor fazendo upload, atualiza a lista pública (opcional)
  } catch (error) {
    console.error(error);
    uploadStatus.value = 'Erro ao enviar. Verifique os campos.';
  }
};

const carregarPendencias = async () => {
  if (!podeAprovar.value) return;
  try {
    const { data } = await http.get('/aprovacoes/pendentes');
    pendencias.value = data;
  } catch (error) {
    console.error("Erro ao buscar pendências", error);
  }
};

const aprovarDocumento = async (idFluxo, aprovar) => {
  try {
    await http.patch(`/aprovacoes/${idFluxo}?aprovado=${aprovar}&comentario=ViaDashboard`);
    // Remove da lista local
    pendencias.value = pendencias.value.filter(p => p.idFluxo !== idFluxo);
    alert(aprovar ? "Documento Aprovado!" : "Documento Rejeitado.");
  } catch (error) {
    alert("Erro ao processar aprovação.");
  }
};

// Ao montar a tela, carrega as pendências se for chefe
onMounted(() => {
  carregarPendencias();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-blue-900 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="text-xl font-bold flex items-center gap-2">
            <span>📂</span> Repositório PPG
          </div>
          <div class="flex items-center space-x-4">
            <div v-if="auth.user" class="text-right mr-4">
               <div class="text-sm font-semibold">{{ auth.user.nome }}</div>
               <div class="text-xs text-blue-200">{{ auth.user.perfil }}</div>
            </div>
            <button @click="handleLogout" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold transition">
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8 space-y-10">

      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4 border-b pb-2">📤 Enviar Novo Documento</h2>

        <form @submit.prevent="handleUpload" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Título</label>
                    <input v-model="form.titulo" type="text" required class="mt-1 w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Tipo</label>
                    <select v-model="form.tipo" class="mt-1 w-full border border-gray-300 rounded-md p-2 shadow-sm">
                        <option value="EDITAIS">Editais</option>
                        <option value="RESULTADOS">Resultados</option>
                        <option value="FORMULARIOS">Formulários</option>
                        <option value="OUTROS">Outros</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Data Publicação</label>
                    <input v-model="form.dataPublicacao" type="date" required class="mt-1 w-full border border-gray-300 rounded-md p-2 shadow-sm">
                </div>
            </div>

            <div class="space-y-4">
                 <div>
                    <label class="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea v-model="form.descricao" rows="4" class="mt-1 w-full border border-gray-300 rounded-md p-2 shadow-sm"></textarea>
                </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-700">Arquivo (PDF)</label>
                    <input ref="fileInput" type="file" required accept=".pdf" class="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                </div>
                <div class="pt-2">
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition">
                        Enviar Documento
                    </button>
                    <p v-if="uploadStatus" class="mt-2 text-sm text-center font-semibold" :class="uploadStatus.includes('Sucesso') ? 'text-green-600' : 'text-blue-600'">
                        {{ uploadStatus }}
                    </p>
                </div>
            </div>
        </form>
      </div>

      <div v-if="podeAprovar" class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-4 border-b pb-2">
             <h2 class="text-lg font-bold text-gray-900">✅ Pendências de Aprovação</h2>
             <button @click="carregarPendencias" class="text-sm text-blue-600 hover:underline">Atualizar</button>
        </div>

        <div v-if="pendencias.length === 0" class="text-center text-gray-500 py-4">
            Nenhum documento aguardando aprovação.
        </div>

        <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                         <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="item in pendencias" :key="item.idFluxo">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">{{ item.tituloDocumento }}</div>
                            <div class="text-xs text-gray-500">ID Doc: {{ item.idDocumento }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.nomeAutor }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.dataSolicitacao }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button @click="aprovarDocumento(item.idFluxo, true)" class="text-green-600 hover:text-green-900 font-bold border border-green-200 px-3 py-1 rounded bg-green-50">Aprovar</button>
                            <button @click="aprovarDocumento(item.idFluxo, false)" class="text-red-600 hover:text-red-900 font-bold border border-red-200 px-3 py-1 rounded bg-red-50">Rejeitar</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

    </main>
  </div>
</template>
