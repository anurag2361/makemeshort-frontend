<template>
  <div class="login-page">
    <div class="login-container">
      <div class="logo-section">
        <h1>MakeMeShort</h1>
        <p class="tagline">URL Shortener and QR Code Generator</p>
      </div>

      <div class="form-container">
        <!-- Add tabs for login/signup -->
        <div class="auth-tabs">
          <button
            @click="activeTab = 'login'"
            :class="['tab-button', { active: activeTab === 'login' }]"
          >
            Login
          </button>
          <button
            @click="activeTab = 'signup'"
            :class="['tab-button', { active: activeTab === 'signup' }]"
          >
            Sign Up
          </button>
        </div>

        <!-- Login Form -->
        <div v-if="activeTab === 'login'">
          <h2>Login</h2>
          <p class="subtitle">Sign in to access your dashboard</p>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="login-username">Username</label>
              <input
                id="login-username"
                v-model="loginForm.username"
                type="text"
                placeholder="Enter your username"
                :disabled="isLoading"
                required
              />
            </div>

            <div class="form-group">
              <label for="login-password">Password</label>
              <input
                id="login-password"
                v-model="loginForm.password"
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

        <!-- Signup Form -->
        <div v-else>
          <h2>Create Account</h2>
          <p class="subtitle">Sign up to start using MakeMeShort</p>

          <form @submit.prevent="handleSignup" class="signup-form">
            <div class="form-group">
              <label for="signup-username">Username</label>
              <input
                id="signup-username"
                v-model="signupForm.username"
                type="text"
                placeholder="Choose a username"
                :disabled="isLoading"
                required
              />
            </div>

            <div class="form-group">
              <label for="signup-email">Email</label>
              <input
                id="signup-email"
                v-model="signupForm.email"
                type="email"
                placeholder="Enter your email"
                :disabled="isLoading"
              />
            </div>

            <div class="form-group">
              <label for="signup-fullname">Full Name</label>
              <input
                id="signup-fullname"
                v-model="signupForm.fullName"
                type="text"
                placeholder="Enter your full name"
                :disabled="isLoading"
              />
            </div>

            <div class="form-group">
              <label for="signup-password">Password</label>
              <input
                id="signup-password"
                v-model="signupForm.password"
                type="password"
                placeholder="Choose a secure password"
                :disabled="isLoading"
                required
              />
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <button type="submit" class="signup-button" :disabled="isLoading">
              <span v-if="isLoading">Creating Account...</span>
              <span v-else>Sign Up</span>
            </button>
          </form>
        </div>
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

    const activeTab = ref('login')

    const loginForm = ref({
      username: '',
      password: '',
    })

    const signupForm = ref({
      username: '',
      password: '',
      email: '',
      fullName: '',
    })

    const isLoading = computed(() => authStore.isLoading)
    const error = computed(() => authStore.error)

    const handleLogin = async () => {
      if (!loginForm.value.username || !loginForm.value.password) {
        return
      }

      try {
        const success = await authStore.login(loginForm.value.username, loginForm.value.password)
        if (success) {
          // Explicitly navigate to home page after successful login
          router.push({ name: 'home' })
        }
      } catch (err) {
        console.error('Login error:', err)
      }
    }

    const handleSignup = async () => {
      if (!signupForm.value.username || !signupForm.value.password) {
        return
      }

      try {
        const success = await authStore.signup(
          signupForm.value.username,
          signupForm.value.password,
          signupForm.value.email || undefined,
          signupForm.value.fullName || undefined,
        )
        if (success) {
          // Explicitly navigate to home page after successful signup
          router.push({ name: 'home' })
        }
      } catch (err) {
        console.error('Signup error:', err)
      }
    }

    return {
      activeTab,
      loginForm,
      signupForm,
      isLoading,
      error,
      handleLogin,
      handleSignup,
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

@media (min-width: 768px) {
  .logo-section {
    width: 40%;
  }
}

.form-container {
  padding: 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
  max-height: 80vh;
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
  margin-bottom: 12px;
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

.auth-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tab-button {
  flex: 1;
  padding: 12px;
  background: transparent;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button.active {
  color: #4a90e2;
  border-bottom: 2px solid #4a90e2;
}

.tab-button:hover {
  background-color: #f5f5f5;
}

/* Style for both login and signup buttons */
.login-button,
.signup-button {
  width: 100%;
  padding: 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover,
.signup-button:hover {
  background-color: #3a80d2;
}

.login-button:disabled,
.signup-button:disabled {
  background-color: #9dc2f3;
  cursor: not-allowed;
}

.signup-button {
  background-color: #4caf50;
}

.signup-button:hover {
  background-color: #43a047;
}

.login-form,
.signup-form {
  min-height: 300px;
}

/* Add some bottom margin to the form to ensure enough space */
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

/* Adjust responsive design for smaller screens */
@media (max-width: 767px) {
  .login-container {
    max-height: none; /* Remove max height on mobile */
  }

  .form-container {
    max-height: none; /* No max height on mobile */
    padding: 30px 20px; /* Smaller padding */
  }

  .login-form,
  .signup-form {
    min-height: 0; /* No min height on mobile */
  }
}
</style>
