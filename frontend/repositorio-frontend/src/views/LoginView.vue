<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const auth = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    await auth.login(email.value, password.value);

    // Simulação temporária para podermos testar o fluxo visual
    // (O ideal é o backend retornar o perfil no login)
    if (email.value.includes('admin') || email.value.includes('maria')) {
        auth.setUser({ nome: 'Usuário', perfil: 'ADMIN' });
    } else {
        auth.setUser({ nome: 'Usuário', perfil: 'FUNCIONARIO' });
    }

    router.push('/dashboard');
  } catch (e) {
    error.value = 'Email ou senha inválidos';
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 class="text-2xl font-bold mb-6 text-center text-blue-900">Repositório PPG</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Senha</label>
          <input
            v-model="password"
            type="password"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            required
          >
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none"
        >
          Entrar
        </button>
      </form>

      <div class="mt-4 text-center">
        <router-link to="/" class="text-sm text-blue-600 hover:text-blue-500">
          Acessar Área Pública
        </router-link>
      </div>
    </div>
  </div>
</template>
