<template>
  <div class="login-container">
    <div class="login-box">
      <h3 class="text-center mb-4">Login</h3>
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <input
              v-model="username"
              type="text"
              class="form-control"
              placeholder="Username"
              required
          >
        </div>
        <div class="mb-3">
          <input
              v-model="password"
              type="password"
              class="form-control"
              placeholder="Password"
              required
          >
        </div>
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        <button type="submit" class="btn btn-login w-100">Login</button>
      </form>
      <div class="d-flex justify-content-between mt-3">
        <router-link to="/register" class="text-link">Create an account</router-link>
        <router-link to="/forgot-password" class="text-link">Forgot password?</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { login } from '../api/auth'

export default {
  setup() {
    const username = ref('')
    const password = ref('')
    const error = ref('')
    const router = useRouter()
    const authStore = useAuthStore()

    const handleLogin = async () => {
      try {
        const response = await login(username.value, password.value)
        authStore.setAuth({
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          user: response.data.user,
          profile: response.data.user.profile,
        })
        await router.push('/dashboard')
      } catch (err) {
        // Xử lý lỗi đăng nhập
        error.value = err.response?.data || 'Login failed'
      }
    }

    return { username, password, error, handleLogin }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0;
  overflow: hidden;
}

.login-box {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.btn-login {
  background-color: #0056D2;
  border-color: #0056D2;
  color: white;
  font-weight: bold;
}

.btn-login:hover {
  background-color: #0041a8;
  border-color: #0041a8;
}

.text-link {
  color: black;
  text-decoration: none;
}

.text-link:hover {
  text-decoration: underline;
}
</style>