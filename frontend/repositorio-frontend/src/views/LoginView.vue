<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const error = ref('');

const auth = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    error.value = '';
    await auth.login(email.value, password.value);

    // Define perfil simulado (apenas para frontend, idealmente viria do backend)
    if (email.value.includes('admin') || email.value.includes('maria')) {
        auth.setUser({ nome: 'João Silva', perfil: 'ADMIN' });
    } else {
        auth.setUser({ nome: 'João Silva', perfil: 'FUNCIONARIO' });
    }

    router.push('/dashboard');
  } catch (e) {
    error.value = 'Credenciais inválidas. Tente novamente.';
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#EEF2FF] flex items-center justify-center p-4 relative font-sans">

    <div class="w-full max-w-md">

      <div class="text-center mb-8">
        <div class="bg-blue-600 w-12 h-12 mx-auto rounded-xl flex items-center justify-center shadow-lg mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h1 class="text-lg font-bold text-gray-800">DocRepo</h1>
        <p class="text-sm text-gray-500">Sistema de Repositório Digital</p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-gray-900">Bem-vindo de volta</h2>
          <p class="text-sm text-gray-500 mt-1">Entre com suas credenciais para acessar o sistema</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">

          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-1.5">E-mail</label>
            <input
              v-model="email"
              type="email"
              placeholder="seu.email@empresa.com"
              class="w-full bg-gray-50 text-gray-900 text-sm rounded-lg border-transparent focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 block p-3 transition outline-none"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-1.5">Senha</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Digite sua senha"
                class="w-full bg-gray-50 text-gray-900 text-sm rounded-lg border-transparent focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 block p-3 pr-10 transition outline-none"
                required
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 text-black focus:ring-gray-500 border-gray-300 rounded cursor-pointer"
              >
              <label for="remember-me" class="ml-2 block text-sm text-gray-600 cursor-pointer">
                Lembrar-me
              </label>
            </div>
            <div class="text-sm">
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                Esqueceu a senha?
              </a>
            </div>
          </div>

          <div v-if="error" class="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
            {{ error }}
          </div>

          <button
            type="submit"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none transition-colors"
          >
            Entrar
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Não tem uma conta?
            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
              Solicitar acesso
            </a>
          </p>
        </div>
      </div>
    </div>

    <button class="absolute bottom-6 right-6 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition transform hover:scale-105">
      <span class="font-bold text-lg">?</span>
    </button>
  </div>
</template>
