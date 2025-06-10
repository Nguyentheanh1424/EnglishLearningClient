<template>
  <div class="profile-container">
    <!-- Hero Section -->
    <section class="profile-hero">
      <div class="hero-background">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>
      <div class="hero-content">
        <div class="profile-avatar">
          <div class="avatar-circle">
            <i class="fas fa-user"></i>
          </div>
        </div>
        <h1 class="profile-name">{{ user?.fullName || 'Welcome User' }}</h1>
        <p class="profile-role">{{ user?.role || 'User' }}</p>
      </div>
    </section>

    <!-- Main Content -->
    <div class="container">
      <div class="content-grid">

        <!-- Password Change Card -->
        <div class="password-section">
          <div class="profile-card">
            <div class="card-header">
              <h3 class="card-title">Security Settings</h3>
            </div>
            <div class="card-content">
              <!-- Step 1: Request Reset Token -->
              <div v-if="!resetToken" class="reset-request">
                <div class="security-info">
                  <div class="info-badge">
                    <i class="fas fa-info-circle"></i>
                    <span>Secure Password Reset</span>
                  </div>
                  <p>To change your password securely, we'll send a reset token to your email address.</p>
                </div>
                <button
                    @click="requestResetToken"
                    class="btn btn-gradient"
                    :disabled="isRequestingToken"
                >
                  <span v-if="isRequestingToken" class="loading-spinner"></span>
                  <i v-else class="fas fa-paper-plane"></i>
                  {{ isRequestingToken ? 'Sending Token...' : 'Request Password Reset' }}
                </button>
              </div>

              <!-- Step 2: Enter Reset Token and New Password -->
              <form v-else @submit.prevent="handleResetPassword" class="password-form">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-key"></i>
                    Reset Token
                  </label>
                  <input
                      v-model="passwordForm.resetToken"
                      type="text"
                      class="form-input"
                      placeholder="Enter reset token from email"
                      required
                  >
                  <small class="form-hint">Check your email for the reset token</small>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-lock"></i>
                    New Password
                  </label>
                  <input
                      v-model="passwordForm.newPassword"
                      type="password"
                      class="form-input"
                      placeholder="Enter new password"
                      required
                      minlength="6"
                  >
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-lock"></i>
                    Confirm New Password
                  </label>
                  <input
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      class="form-input"
                      placeholder="Confirm new password"
                      required
                      minlength="6"
                  >
                </div>

                <div v-if="passwordError" class="alert alert-error">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ passwordError }}
                </div>

                <div v-if="passwordSuccess" class="alert alert-success">
                  <i class="fas fa-check-circle"></i>
                  {{ passwordSuccess }}
                </div>

                <div class="form-actions">
                  <button
                      type="submit"
                      class="btn btn-gradient"
                      :disabled="isChangingPassword"
                  >
                    <span v-if="isChangingPassword" class="loading-spinner"></span>
                    <i v-else class="fas fa-save"></i>
                    {{ isChangingPassword ? 'Changing Password...' : 'Change Password' }}
                  </button>
                  <button
                      type="button"
                      class="btn btn-outline"
                      @click="cancelPasswordReset"
                  >
                    <i class="fas fa-times"></i>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { forgotPassword, resetPassword } from '../../api/auth.js'

// Types
interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: string
}

interface PasswordForm {
  resetToken: string
  newPassword: string
  confirmPassword: string
}

// State
const router = useRouter()
const authStore = useAuthStore()

const passwordForm = ref<PasswordForm>({
  resetToken: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordError = ref('')
const passwordSuccess = ref('')
const isChangingPassword = ref(false)
const isRequestingToken = ref(false)
const resetToken = ref(false)

// Computed
const user = computed<User | null>(() => authStore.user)

// Methods
const requestResetToken = async () => {
  if (!user.value?.email) {
    passwordError.value = 'Email not found in user profile'
    return
  }

  isRequestingToken.value = true
  passwordError.value = ''

  try {
    await forgotPassword(user.value.email)
    resetToken.value = true
    passwordSuccess.value = 'Reset token sent to your email. Please check your inbox.'

    setTimeout(() => {
      passwordSuccess.value = ''
    }, 5000)

  } catch (error: any) {
    passwordError.value = error.response?.data?.message || error.response?.data || 'Failed to send reset token'
  } finally {
    isRequestingToken.value = false
  }
}

const handleResetPassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (!passwordForm.value.resetToken.trim()) {
    passwordError.value = 'Reset token is required'
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'New passwords do not match'
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'Password must be at least 6 characters long'
    return
  }

  if (!user.value?.email) {
    passwordError.value = 'Email not found in user profile'
    return
  }

  isChangingPassword.value = true

  try {
    await resetPassword(
        passwordForm.value.resetToken,
        user.value.email,
        passwordForm.value.newPassword,
        passwordForm.value.confirmPassword
    )

    passwordSuccess.value = 'Password changed successfully!'

    passwordForm.value = {
      resetToken: '',
      newPassword: '',
      confirmPassword: ''
    }
    resetToken.value = false

    setTimeout(() => {
      passwordSuccess.value = ''
    }, 3000)

  } catch (error: any) {
    passwordError.value = error.response?.data?.message || error.response?.data || 'Failed to change password'
  } finally {
    isChangingPassword.value = false
  }
}

const cancelPasswordReset = () => {
  passwordForm.value = {
    resetToken: '',
    newPassword: '',
    confirmPassword: ''
  }
  resetToken.value = false
  passwordError.value = ''
  passwordSuccess.value = ''
}

// Lifecycle
onMounted(() => {
  if (!user.value) {
    router.push('/login')
  }

  // Add animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in')
      }
    })
  })

  document.querySelectorAll('.profile-card, .info-item').forEach(el => {
    observer.observe(el)
  })
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.profile-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  color: #2d3748;
  min-height: 100vh;
}

/* Hero Section */
.profile-hero {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.shape-2 {
  width: 60px;
  height: 60px;
  top: 60%;
  right: 20%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  right: 40%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
}

.profile-avatar {
  margin-bottom: 20px;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 3px solid rgba(255, 255, 255, 0.3);
  font-size: 40px;
}

.profile-name {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.profile-role {
  font-size: 1.2rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  border-radius: 25px;
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Main Content */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  transform: translateY(-50px);
  position: relative;
  z-index: 20;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  margin-bottom: 50px;
}

.profile-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.profile-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.card-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.card-icon.security {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.card-content {
  padding: 30px;
}

/* Profile Information */
.info-grid {
  display: grid;
  gap: 25px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 15px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateX(-20px);
}

.info-item.animate-in {
  opacity: 1;
  transform: translateX(0);
}

.info-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e0;
  transform: translateX(5px);
}

.info-icon {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.info-details {
  flex: 1;
}

.info-details label {
  font-weight: 600;
  color: #718096;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 5px;
}

.info-details p {
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

/* Password Section */
.reset-request {
  text-align: center;
}

.security-info {
  margin-bottom: 30px;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1565c0;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 15px;
  border: 1px solid rgba(21, 101, 192, 0.2);
}

.security-info p {
  color: #718096;
  font-size: 1rem;
  line-height: 1.6;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.form-input {
  padding: 15px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-hint {
  color: #718096;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 25px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  justify-content: center;
  flex: 1;
}

.btn-gradient {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-gradient:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.btn-gradient:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: transparent;
  color: #718096;
  border: 2px solid #e2e8f0;
}

.btn-outline:hover {
  background: #f8fafc;
  border-color: #cbd5e0;
  color: #2d3748;
}

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  border-radius: 12px;
  font-weight: 500;
  margin: 15px 0;
}

.alert-error {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #feb2b2;
}

.alert-success {
  background: #c6f6d5;
  color: #22543d;
  border: 1px solid #9ae6b4;
}

/* Loading Spinner */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .profile-hero {
    height: 300px;
  }

  .profile-name {
    font-size: 2rem;
  }

  .avatar-circle {
    width: 100px;
    height: 100px;
    font-size: 35px;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .container {
    transform: translateY(-30px);
  }

  .card-header,
  .card-content {
    padding: 20px;
  }

  .info-item {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }

  .card-header,
  .card-content {
    padding: 15px;
  }

  .info-item {
    padding: 15px;
  }
}
</style>