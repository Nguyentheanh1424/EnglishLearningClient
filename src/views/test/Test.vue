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
              <div class="search-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input
                    v-model="searchQuery"
                    type="text"
                    class="form-control search-input"
                    placeholder="Search tests by title..."
                />
                <div v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                  <i class="fas fa-times"></i>
                </div>
              </div>
            </div>
            <div class="d-flex gap-3">
              <router-link v-if="isAdmin" to="/create-test" class="btn btn-success px-4 py-2">
                <i class="fas fa-plus me-2"></i>Create New Test
              </router-link>
              <router-link to="/test-history" class="btn btn-primary px-4 py-2">
                <i class="fas fa-history me-2"></i>View Test History
              </router-link>
            </div>
          </div>

          <!-- Tests List -->
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <div v-if="testsError" class="alert alert-danger">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ testsError }}
                </div>
                <div v-else-if="filteredTests.length === 0" class="text-center py-5">
                  <div class="empty-state">
                    <i class="fas fa-clipboard-list empty-icon"></i>
                    <h5 class="mt-3 mb-2">No tests found</h5>
                    <p class="text-muted mb-0">
                      <span v-if="searchQuery">Try adjusting your search criteria</span>
                      <span v-else>No tests are currently available</span>
                    </p>
                  </div>
                </div>
                <div v-else class="row g-4">
                  <div v-for="test in paginatedTests" :key="test.id" class="col-3">
                    <div class="card shadow-sm h-100 test-card">
                      <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                          <h5 class="card-title">{{ test.title }}</h5>
                          <div class="test-meta">
                            <div class="meta-item">
                              <i class="fas fa-calendar-alt me-2"></i>
                              <span>{{ formatCreatedAt(test.createdAt) }}</span>
                            </div>
                          </div>
                        </div>
                        <router-link :to="`/tests/${test.id}/take`" class="btn btn-primary align-self-end mt-3">
                          <span>Start Test</span>
                          <i class="fas fa-arrow-right ms-2"></i>
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="col-12 d-flex justify-content-center align-items-center mt-4" v-if="totalPages > 1">
            <nav>
              <ul class="pagination pagination-modern">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage--">
                    <i class="fas fa-chevron-left me-1"></i>Previous
                  </button>
                </li>
                <li class="page-item active">
                  <span class="page-link">Page {{ currentPage }} of {{ totalPages }}</span>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage++">
                    Next<i class="fas fa-chevron-right ms-1"></i>
                  </button>
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
import { useAuthStore } from '../../stores/auth.js';
import { ref, computed, onMounted, watch } from 'vue';
import { getAllMockTests } from '../../api/test.js';

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

    // Reset về trang 1 khi search
    watch(searchQuery, () => {
      currentPage.value = 1;
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
/* Base styles giữ nguyên */
.row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Cải thiện buttons */
.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
}

.btn-primary {
  background-color: #0056d2;
  border-color: #0056d2;
}

.btn-primary:hover {
  background-color: #0041a8;
  border-color: #0041a8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 86, 210, 0.3);
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #218838;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

/* Cải thiện search bar */
.search-bar {
  max-width: 400px;
}

.search-wrapper {
  position: relative;
}

.search-input {
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #0056d2;
  box-shadow: 0 0 0 3px rgba(0, 86, 210, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  z-index: 2;
}

.search-clear {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  z-index: 2;
}

.search-clear:hover {
  background-color: #f1f5f9;
  color: #dc2626;
}

/* Cải thiện cards */
.card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.test-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  border-color: #cbd5e1;
}

.card-header {
  background: linear-gradient(45deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e2e8f0;
  padding: 1.5rem;
  text-align: center;
  border-radius: 12px 12px 0 0;
}

.test-icon {
  width: 48px;
  height: 48px;
  background: #0056d2;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 1.25rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.test-meta {
  margin-bottom: 1rem;
}

/* Empty state */
.empty-state {
  padding: 2rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

/* Pagination cải thiện */
.pagination-modern {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.pagination-modern .page-link {
  border: none;
  color: #64748b;
  font-weight: 500;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.pagination-modern .page-item.active .page-link {
  background-color: #0056d2;
  color: white;
  font-weight: 600;
}

.pagination-modern .page-link:hover:not(.disabled) {
  background-color: #f8fafc;
  color: #0056d2;
}

.pagination-modern .page-item.disabled .page-link {
  color: #cbd5e1;
  cursor: not-allowed;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.test-card {
  animation: fadeIn 0.4s ease-out;
}

/* Responsive */
@media (max-width: 1200px) {
  .col-3 {
    flex: 0 0 auto;
    width: 50%;
  }
}

@media (max-width: 768px) {
  .col-3 {
    flex: 0 0 auto;
    width: 100%;
  }

  .controls-fixed {
    flex-direction: column;
    gap: 1rem;
  }

  .search-bar {
    max-width: 100%;
    margin-right: 0 !important;
  }

  .d-flex.gap-3 {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .btn {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }

  .pagination-modern .page-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>