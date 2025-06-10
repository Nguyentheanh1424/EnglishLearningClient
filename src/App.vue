<template>
  <div class="app-container">
    <!-- Modern Header with Glass Effect -->
    <header v-if="shouldShowHeader" class="modern-header">
      <div class="header-background"></div>
      <div class="header-content">
        <!-- Left Section: Logo and Welcome -->
        <div class="header-left">
          <div class="logo-section">
            <div class="logo">
              <div class="logo-icon">
                <i class="fas fa-graduation-cap"></i>
              </div>
              <span class="logo-text">EnglishHub</span>
            </div>
          </div>
          <div class="welcome-section">
            <h1 class="welcome-text">Welcome back, <span class="user-name">{{ user?.fullName || 'User' }}</span></h1>
            <div class="time-display">
              <i class="fas fa-clock"></i>
              <span>{{ currentTime }}</span>
            </div>
          </div>
        </div>

        <!-- Right Section: Navigation -->
        <nav class="modern-nav">
          <router-link to="/dashboard" class="nav-item" :class="{ active: $route.path === '/dashboard' }">
            <i class="fas fa-home"></i>
            <span>Home</span>
          </router-link>
          <router-link to="/tests" class="nav-item" :class="{ active: $route.path === '/tests' }">
            <i class="fas fa-clipboard-check"></i>
            <span>Test</span>
          </router-link>
          <router-link to="/skills" class="nav-item" :class="{ active: $route.path === '/skills' }">
            <i class="fas fa-brain"></i>
            <span>Skills</span>
          </router-link>
          <router-link to="/dictionary" class="nav-item" :class="{ active: $route.path === '/dictionary' }">
            <i class="fas fa-book"></i>
            <span>Dictionary</span>
          </router-link>

          <!-- User Menu -->
          <div class="user-menu" ref="userMenuRef">
            <div class="nav-item user-trigger" @click="toggleUserMenu">
              <div class="user-avatar">
                <i class="fas fa-user"></i>
              </div>
              <span>{{ 'Profile' }}</span>
              <i class="fas fa-chevron-down dropdown-arrow" :class="{ 'rotated': isUserMenuOpen }"></i>
            </div>
            <div class="dropdown-menu" :class="{ 'show': isUserMenuOpen }">
              <div class="user-info">
                <div class="user-avatar-large">
                  <i class="fas fa-user"></i>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ user?.fullName || 'User' }}</div>
                  <div class="user-email">{{ user?.email || 'user@example.com' }}</div>
                </div>
              </div>
              <div class="menu-divider"></div>
              <div class="menu-items">
                <router-link to="/profile" class="dropdown-item" @click="closeUserMenu">
                  <i class="fas fa-user-circle"></i>
                  <span>Profile</span>
                </router-link>
                <div class="menu-divider"></div>
                <div class="dropdown-item logout-item" @click="handleLogout">
                  <i class="fas fa-sign-out-alt"></i>
                  <span>Log out</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'with-header': shouldShowHeader }">
      <router-view />
    </main>
  </div>
</template>

<script>
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import axios from './api/axios';
import { ref, onMounted, onUnmounted, computed } from 'vue';

export default {
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const route = useRoute();
    const user = authStore.user;

    // Current time
    const currentTime = ref('');

    // User menu state
    const isUserMenuOpen = ref(false);
    const userMenuRef = ref(null);

    // Toggle user menu
    const toggleUserMenu = () => {
      isUserMenuOpen.value = !isUserMenuOpen.value;
    };

    // Close user menu
    const closeUserMenu = () => {
      isUserMenuOpen.value = false;
    };

    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
        closeUserMenu();
      }
    };

    // Format date and time
    const formatDateTime = () => {
      const now = new Date();
      return now.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Ho_Chi_Minh',
      }) + ' +07';
    };

    // Update time every second
    const updateTime = () => {
      currentTime.value = formatDateTime();
    };

    // Handle logout
    const handleLogout = async () => {
      try {
        await axios.post(
            '/api/auth/logout',
            {},
            {
              headers: { Authorization: `Bearer ${authStore.token}` },
            }
        );
        authStore.clearAuth();
        router.push('/login');
      } catch (err) {
        console.error('Logout failed:', err);
        authStore.clearAuth();
        router.push('/login');
      } finally {
        closeUserMenu();
      }
    };

    // Danh sách các route mà header nên hiển thị
    const headerRoutes = [
      '/dashboard',
      '/tests',
      '/listening',
      '/reading',
      '/speaking',
      '/writing',
      '/flashcards',
      '/grammars',
      '/change-password',
      '/results',
      '/test-history',
      '/skills',
      '/dictionary',
      '/profile',
      '/settings',
      '/progress',
    ];

    // Computed property để kiểm tra xem header có nên hiển thị không
    const shouldShowHeader = computed(() => {
      return headerRoutes.some(headerRoute =>
          route.path === headerRoute || route.path.startsWith(headerRoute + '/')
      );
    });

    // Load data when component is mounted
    onMounted(() => {
      updateTime();
      const timer = setInterval(updateTime, 1000);

      // Add click outside listener
      document.addEventListener('click', handleClickOutside);

      onUnmounted(() => {
        clearInterval(timer);
        document.removeEventListener('click', handleClickOutside);
      });
    });

    return {
      user,
      currentTime,
      isUserMenuOpen,
      userMenuRef,
      toggleUserMenu,
      closeUserMenu,
      handleLogout,
      shouldShowHeader,
    };
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  min-height: 100vh;
  background: #f8fafc;
}

/* Modern Header */
.modern-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 80px;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.header-content {
  position: relative;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Header Left Section */
.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  color: white;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.logo-icon {
  font-size: 20px;
}

.logo-text {
  font-weight: 800;
}

.welcome-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.welcome-text {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.user-name {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 14px;
  font-weight: 500;
}

.time-display i {
  color: #667eea;
}

/* Modern Navigation */
.modern-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  text-decoration: none;
  color: #718096;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.nav-item:hover::before,
.nav-item.active::before {
  opacity: 0.1;
}

.nav-item:hover {
  color: #667eea;
  transform: translateY(-2px);
}

.nav-item.active {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.nav-item i {
  font-size: 16px;
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-trigger {
  cursor: pointer;
  background: white;
  border: 1px solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.user-trigger:hover {
  border-color: rgba(102, 126, 234, 0.4);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.dropdown-arrow {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.1);
  min-width: 280px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  overflow: hidden;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-info {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.user-avatar-large {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.user-details {
  flex: 1;
}

.user-details .user-name {
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
}

.user-email {
  color: #718096;
  font-size: 13px;
}

.menu-divider {
  height: 1px;
  background: rgba(102, 126, 234, 0.1);
  margin: 8px 0;
}

.menu-items {
  padding: 8px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  text-decoration: none;
}

.dropdown-item:hover {
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
  text-decoration: none;
}

.dropdown-item i {
  font-size: 16px;
  width: 20px;
}

.logout-item {
  color: #e53e3e;
}

.logout-item:hover {
  background: rgba(229, 62, 62, 0.08);
  color: #c53030;
}

/* Main Content */
.main-content {
  min-height: 100vh;
  transition: all 0.3s ease;
}

.main-content.with-header {
  padding-top: 80px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .header-content {
    padding: 0 20px;
  }

  .header-left {
    gap: 20px;
  }

  .modern-nav {
    gap: 4px;
  }

  .nav-item {
    padding: 10px 16px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .welcome-text {
    font-size: 16px;
  }

  .time-display {
    font-size: 12px;
  }

  .modern-nav {
    flex-wrap: wrap;
    gap: 4px;
  }

  .nav-item span {
    display: none;
  }

  .nav-item {
    padding: 10px;
  }

  .user-trigger span {
    display: inline;
  }

  .dropdown-menu {
    min-width: 250px;
    right: -50px;
  }
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 15px 20px;
  }

  .modern-header {
    height: auto;
  }

  .main-content.with-header {
    padding-top: 120px;
  }

  .logo {
    font-size: 16px;
  }

  .welcome-text {
    font-size: 14px;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-item {
  animation: fadeInUp 0.6s ease forwards;
}

.nav-item:nth-child(1) { animation-delay: 0.1s; }
.nav-item:nth-child(2) { animation-delay: 0.2s; }
.nav-item:nth-child(3) { animation-delay: 0.3s; }
.nav-item:nth-child(4) { animation-delay: 0.4s; }
.nav-item:nth-child(5) { animation-delay: 0.5s; }
</style>