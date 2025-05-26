<template>
  <div>
    <!-- Header: Chỉ hiển thị trên các route cụ thể -->
    <header v-if="shouldShowHeader" class="bg-white shadow px-4 py-3 d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-3">
        <!-- Logo -->
        <div class="logo fs-2 fw-bold">EnglishHub</div>
        <!-- Welcome and Time -->
        <div class="header-left">
          <h1 class="fs-4 fw-semibold">Welcome, {{ user?.fullName || 'User' }}</h1>
          <span class="text-secondary time-display">{{ currentTime }}</span>
        </div>
      </div>
      <!-- Navigation and User Menu -->
      <div class="d-flex align-items-center gap-5">
        <!-- Navigation -->
        <nav class="d-flex gap-5">
          <router-link to="/dashboard" class="fs-4 nav-link" :class="{ active: $route.path === '/dashboard' }">Home</router-link>
          <router-link to="/tests" class="fs-4 nav-link" :class="{ active: $route.path.startsWith('/tests') }">Test</router-link>
          <!-- Skills Dropdown -->
          <div class="skills-menu position-relative">
            <div class="fs-4 nav-link" :class="{ active: $route.path.startsWith('/listening') || $route.path.startsWith('/reading') || $route.path.startsWith('/speaking') || $route.path.startsWith('/writing') }">
              Skills
            </div>
            <div class="dropdown-menu shadow">
              <router-link to="/listening" class="dropdown-item">Listening</router-link>
              <router-link to="/reading" class="dropdown-item">Reading</router-link>
              <router-link to="/speaking" class="dropdown-item">Speaking</router-link>
              <router-link to="/writing" class="dropdown-item">Writing</router-link>
            </div>
          </div>
          <router-link to="/flashcards" class="fs-4 nav-link" :class="{ active: $route.path === '/flashcards' }">Flashcards</router-link>
          <router-link to="/grammars" class="fs-4 nav-link" :class="{ active: $route.path === '/grammars' }">Grammar</router-link>
          <!-- User Dropdown -->
          <div class="user-menu position-relative">
            <div class="fs-4 nav-link">
              User
            </div>
            <div class="dropdown-menu shadow">
              <router-link to="/change-password" class="dropdown-item">Change password</router-link>
              <div class="dropdown-item" @click="handleLogout">Log out</div>
            </div>
          </div>
        </nav>
      </div>
    </header>

    <main>
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
      '/results'
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
      onUnmounted(() => clearInterval(timer));
    });

    return {
      user,
      currentTime,
      handleLogout,
      shouldShowHeader,
    };
  },
};
</script>

<style scoped>
header {
  padding-left: 1.5rem !important;
  padding-right: 1.5rem !important;
  position: fixed; /* Cố định header ở đầu trang */
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* Đảm bảo header nằm trên các phần tử khác */
}

.logo {
  background-color: #0056d2;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.time-display {
  font-size: 0.9rem;
}

nav {
  display: flex;
  justify-content: center;
  flex-grow: 1;
  gap: 2.5rem;
}

.nav-link {
  text-decoration: none !important;
  color: #6b7280;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: #1e40af !important;
}

.skills-menu,
.user-menu {
  position: relative;
}

.user-menu {
  margin-right: 2rem;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  z-index: 1000;
  display: none;
}

.user-menu .dropdown-menu {
  left: auto;
  right: 0;
}

.skills-menu:hover .dropdown-menu,
.user-menu:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  color: #000;
  text-decoration: none;
  display: block;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}
</style>