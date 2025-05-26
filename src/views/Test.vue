<template>
  <div class="dashboard-container d-flex">
    <!-- Main Content -->
    <div class="main-content flex-grow-1 d-flex flex-column">
      <!-- Tests Content -->
      <div class="flex-grow-1 p-4">
        <div class="row g-4 mx-0">
          <!-- Controls -->
          <div class="col-12 d-flex justify-content-between align-items-center mb-4 controls-fixed">
            <!-- Thanh tìm kiếm -->
            <div class="search-bar flex-grow-1 me-3">
              <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  placeholder="Search tests by title..."
              />
            </div>
            <div class="d-flex gap-3">
              <router-link v-if="isAdmin" to="/create-test" class="btn btn-success px-4 py-2">Create New Test</router-link>
              <router-link to="/test-history" class="btn btn-primary px-4 py-2">View Test History</router-link>
            </div>
          </div>

          <!-- Tests List -->
          <div class="col-12">
            <div class="card shadow">
              <div class="card-body">
                <div v-if="testsError" class="alert alert-danger">
                  {{ testsError }}
                </div>
                <div v-else-if="filteredTests.length === 0" class="text-center">
                  No tests available.
                </div>
                <div v-else class="row g-4">
                  <div v-for="test in paginatedTests" :key="test.id" class="col-3">
                    <div class="card shadow h-100">
                      <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                          <h3 class="fs-6 fw-semibold">{{ test.title }}</h3>
                          <p class="fs-6 line-height-fix">Created at: {{ formatCreatedAt(test.createdAt) }}</p>
                        </div>
                        <router-link :to="`/tests/${test.id}/take`" class="btn btn-primary align-self-end">Start</router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="col-12 d-flex justify-content-center align-items-center mt-4">
            <nav>
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage--">Previous</button>
                </li>
                <li class="page-item">
                  <span class="page-link">Page {{ currentPage }} of {{ totalPages }}</span>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage++">Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth';
import { ref, computed, onMounted } from 'vue';
import { getAllMockTests } from '../api/test';

export default {
  setup() {
    const authStore = useAuthStore();
    const user = authStore.user;

    // Data
    const mockTests = ref([]);
    const testsError = ref('');
    const searchQuery = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 8; // 2 hàng × 4 cột = 8 test mỗi trang

    // Computed
    const isAdmin = computed(() => user?.role === 'Admin');

    // Lọc test dựa trên searchQuery
    const filteredTests = computed(() => {
      if (!searchQuery.value) return mockTests.value;
      return mockTests.value.filter(test =>
          test.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    // Tính tổng số trang dựa trên filteredTests
    const totalPages = computed(() => Math.ceil(filteredTests.value.length / itemsPerPage));

    // Hiển thị test theo trang hiện tại
    const paginatedTests = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredTests.value.slice(start, end);
    });

    // Định dạng createdAt thành dạng "May 22, 2025"
    const formatCreatedAt = (createdAt) => {
      if (!createdAt) return 'N/A';
      const date = new Date(createdAt);
      return date.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    };

    // Fetch all mock tests
    const fetchMockTests = async () => {
      try {
        const response = await getAllMockTests();
        mockTests.value = response.data;
      } catch (err) {
        testsError.value = err.response?.data?.message || 'Failed to load tests';
      }
    };

    // Load data on mount
    onMounted(() => {
      fetchMockTests();
    });

    return {
      user,
      mockTests,
      testsError,
      isAdmin,
      searchQuery,
      filteredTests,
      currentPage,
      totalPages,
      paginatedTests,
      formatCreatedAt,
    };
  },
};
</script>

<style scoped>
.dashboard-container {
  height: calc(100vh - 80px);
  background-color: #f0f0f0;
  padding-top: 100px; /* Thêm padding-top bằng chiều cao của header để tránh bị che khuất */
}

.main-content {
  /* Cuộn đã bị tắt */
}

.row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.btn-primary {
  background-color: #0056d2;
  border-color: #0056d2;
}

.btn-primary:hover {
  background-color: #0041a8;
  border-color: #0041a8;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #218838;
}

.card {
  height: 100%;
}

.line-height-fix {
  line-height: 1.5;
  margin: 0;
}

.search-bar {
  max-width: 300px;
}

.pagination {
  user-select: none;
}

.dashboard-container {
  height: calc(100vh - 80px);
  background-color: #f0f0f0;
  padding-top: 100px;
}

</style>