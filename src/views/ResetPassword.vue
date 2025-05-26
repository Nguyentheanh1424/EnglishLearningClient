<template>
  <div class="reset-password-container">
    <div class="reset-password-box">
      <h3 class="text-center mb-4">Reset Password</h3>
      <form @submit.prevent="handleResetPassword">
        <div class="mb-3">
          <input
              v-model="token"
              type="text"
              class="form-control"
              placeholder="Token (from email)"
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
              v-model="newPassword"
              type="password"
              class="form-control"
              placeholder="New Password (6-100 characters)"
              minlength="6"
              maxlength="100"
              required
          >
        </div>
        <div class="mb-3">
          <input
              v-model="confirmPassword"
              type="password"
              class="form-control"
              placeholder="Confirm Password"
              minlength="6"
              maxlength="100"
              required
          >
        </div>
        <div v-if="success" class="alert alert-success">
          {{ success }} <router-link to="/login" class="text-link">Back to Login</router-link>
        </div>
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        <button type="submit" class="btn btn-reset-password w-100">Reset</button>
      </form>
      <div v-if="!success" class="d-flex justify-content-between mt-3">
        <router-link to="/login" class="text-link">Back to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { resetPassword } from '../api/auth'

export default {
  setup() {
    const token = ref('')
    const email = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    const success = ref('')
    const error = ref('')
    const router = useRouter()

    const handleResetPassword = async () => {
      if (newPassword.value !== confirmPassword.value) {
        // Kiểm tra mật khẩu xác nhận
        error.value = 'Passwords do not match'
        success.value = ''
        return
      }
      try {
        const response = await resetPassword(token.value, email.value, newPassword.value, confirmPassword.value)
        success.value = response.data.message
        error.value = ''
        // Chuyển hướng sau 3 giây
        setTimeout(() => router.push('/login'), 3000)
      } catch (err) {
        // Xử lý lỗi đặt lại mật khẩu
        error.value = err.response?.data || 'Password reset failed'
        success.value = ''
      }
    }

    return { token, email, newPassword, confirmPassword, success, error, handleResetPassword }
  }
}
</script>

<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0;
  overflow: hidden;
}

.reset-password-box {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.btn-reset-password {
  background-color: #0056D2;
  border-color: #0056D2;
  color: white;
  font-weight: bold;
}

.btn-reset-password:hover {
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
