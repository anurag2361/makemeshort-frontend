<template>
  <div class="login-page">
    <div class="login-container">
      <div class="logo-section">
        <h1>MakeMeShort</h1>
        <p class="tagline">URL Shortener and QR Code Generator</p>
      </div>

      <div class="form-container">
        <h2>Login</h2>
        <p class="subtitle">Sign in to access your dashboard</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter your username"
              :disabled="isLoading"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              :disabled="isLoading"
              required
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button type="submit" class="login-button" :disabled="isLoading">
            <span v-if="isLoading">Logging in...</span>
            <span v-else>Login</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'LoginView',

  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const username = ref('')
    const password = ref('')

    const isLoading = computed(() => authStore.isLoading)
    const error = computed(() => authStore.error)

    const handleLogin = async () => {
      if (!username.value || !password.value) {
        return
      }

      const success = await authStore.login(username.value, password.value)
      if (success) {
        router.push('/')
      }
    }

    return {
      username,
      password,
      isLoading,
      error,
      handleLogin,
    }
  },
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4a90e2 0%, #9066ee 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 900px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .login-container {
    flex-direction: row;
    height: 500px;
  }
}

.logo-section {
  background: linear-gradient(135deg, #4a90e2 0%, #9066ee 100%);
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

@media (min-width: 768px) {
  .logo-section {
    width: 40%;
  }
}

.logo-section h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
}

.tagline {
  font-size: 1.1rem;
  opacity: 0.9;
}

.form-container {
  padding: 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h2 {
  color: #333;
  margin-bottom: 8px;
  font-size: 1.8rem;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #555;
}

input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.login-button {
  padding: 14px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
}

.login-button:hover {
  background-color: #3a7fcb;
}

.login-button:disabled {
  background-color: #a5c7f0;
  cursor: not-allowed;
}
</style>
