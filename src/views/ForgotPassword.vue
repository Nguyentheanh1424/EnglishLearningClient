<template>
  <div class="forgot-password-container">
    <div class="forgot-password-box">
      <h3 class="text-center mb-4">Forgot Password</h3>
      <form @submit.prevent="handleForgotPassword">
        <div class="mb-3">
          <input
              v-model="email"
              type="email"
              class="form-control"
              placeholder="Email"
              required
          >
        </div>
        <div v-if="success" class="alert alert-success">
          {{ success }}
        </div>
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        <button type="submit" class="btn btn-forgot-password w-100">Send Request</button>
      </form>
      <div class="d-flex justify-content-between mt-3">
        <router-link to="/login" class="text-link">Back to Login</router-link>
        <router-link to="/register" class="text-link">Create an account</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { forgotPassword } from '../api/auth'

export default {
  setup() {
    const email = ref('')
    const success = ref('')
    const error = ref('')

    const handleForgotPassword = async () => {
      try {
        const response = await forgotPassword(email.value)
        success.value = response.data.message
        error.value = ''
      } catch (err) {
        // Xử lý lỗi gửi yêu cầu quên mật khẩu
        error.value = err.response?.data || 'Request failed'
        success.value = ''
      }
    }

    return { email, success, error, handleForgotPassword }
  }
}
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0;
  overflow: hidden;
}

.forgot-password-box {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.btn-forgot-password {
  background-color: #0056D2;
  border-color: #0056D2;
  color: white;
  font-weight: bold;
}

.btn-forgot-password:hover {
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