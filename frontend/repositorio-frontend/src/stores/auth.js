import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import http from '@/services/http';
import { jwtDecode } from "jwt-decode";

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'));
  const user = ref(JSON.parse(localStorage.getItem('user')));

  const isAuthenticated = computed(() => !!token.value);
  const isAdminOrGestor = computed(() => ['ADMIN', 'GESTOR'].includes(user.value?.perfil));

  function setToken(tokenValue) {
    token.value = tokenValue;
    localStorage.setItem('token', tokenValue);
  }

  function setUser(userValue) {
    user.value = userValue;
    localStorage.setItem('user', JSON.stringify(userValue));
  }

  async function login(email, senha) {
    try {
      // 1. Pega o Token
      const { data } = await http.post('/login', { email, senha });
      setToken(data.token);

      // 2. Opcional: Decodificar o token ou buscar dados do usuário
      // Como seu /login só retorna o token, vamos simular ou buscar dados do usuário depois.
      // Por enquanto, vamos assumir que precisamos buscar os dados do usuário
      // Se seu backend tivesse um endpoint /me, seria ideal.
      // Como não tem, vamos decodificar o token SE ele tiver info, ou faremos uma gambiarra temporária para testes:

      // Decodificando o token (Instale: npm install jwt-decode)
      // OU, vamos buscar um endpoint que retorna lista de usuários (filtrando no front)
      // Por hora, vamos focar só no token.

      return true;
    } catch (error) {
      console.error(error);
      throw new Error("Falha no login");
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return { token, user, isAuthenticated, isAdminOrGestor, login, logout, setUser };
});
