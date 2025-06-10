<template>
  <div class="register-container">
    <div class="register-box">
      <h3 class="text-center mb-4">Register</h3>
      <form @submit.prevent="handleRegister">
        <div class="mb-3">
          <input
              v-model="username"
              type="text"
              class="form-control"
              placeholder="Username (3-50 characters)"
              minlength="3"
              maxlength="50"
              required
          >
        </div>
        <div class="mb-3">
          <input
              v-model="email"
              type="email"
              class="form-control"
              placeholder="Email"
              required
          >
        </div>
        <div class="mb-3">
          <input
              v-model="password"
              type="password"
              class="form-control"
              placeholder="Password (6-100 characters)"
              minlength="6"
              maxlength="100"
              required
          >
        </div>
        <div class="mb-3">
          <input
              v-model="fullName"
              type="text"
              class="form-control"
              placeholder="Full Name"
              required
          >
        </div>
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        <button type="submit" class="btn btn-register w-100">Register</button>
      </form>
      <div class="d-flex justify-content-between mt-3">
        <span>Already have an account?</span>
        <router-link to="/login" class="text-link">Login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { register } from '../../api/auth.js'

export default {
  setup() {
    const username = ref('')
    const email = ref('')
    const password = ref('')
    const fullName = ref('')
    const error = ref('')
    const router = useRouter()
    const authStore = useAuthStore()

    const handleRegister = async () => {
      try {
        const response = await register(username.value, email.value, password.value, fullName.value)
        authStore.setAuth({
          token: response.data.Token,
          refreshToken: response.data.RefreshToken,
          user: response.data.User
        })
        router.push('/dashboard')
      } catch (err) {
        // Xử lý lỗi đăng ký
        error.value = err.response?.data || 'Registration failed'
      }
    }

    return { username, email, password, fullName, error, handleRegister }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0;
  overflow: hidden;
}

.register-box {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.btn-register {
  background-color: #0056D2;
  border-color: #0056D2;
  color: white;
  font-weight: bold;
}

.btn-register:hover {
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