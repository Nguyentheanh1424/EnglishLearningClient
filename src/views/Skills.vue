<template>
  <div class="dashboard-container d-flex">
    <!-- Main Content -->
    <div class="main-content flex-grow-1 d-flex flex-column">
      <!-- Skills Content -->
      <div class="flex-grow-1 p-4">
        <div class="row g-4 mx-0">
          <!-- Header Section -->
          <div class="col-12 text-center mb-4">
            <h1 class="page-title">IELTS Skills Practice</h1>
            <p class="page-subtitle text-muted">Choose a skill to start practicing</p>
          </div>

          <!-- Controls -->
          <div class="col-12 d-flex justify-content-between align-items-center mb-4 controls-fixed">
            <!-- Skill Tabs -->
            <div class="skills-tabs flex-grow-1 me-3">
              <div class="tab-container d-flex gap-2">
                <button
                    v-for="skill in skills"
                    :key="skill"
                    class="skill-tab btn"
                    :class="{ 'btn-primary': selectedSkill === skill, 'btn-outline-secondary': selectedSkill !== skill }"
                    @click="selectSkill(skill)"
                >
                  <i :class="getSkillIcon(skill)" class="me-2"></i>
                  <span>{{ skill }}</span>
                </button>
              </div>
            </div>

            <!-- Search Bar -->
            <div class="search-bar">
              <div class="search-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input
                    v-model="searchQuery"
                    type="text"
                    class="form-control search-input"
                    :placeholder="`Search ${selectedSkill.toLowerCase()} tests...`"
                />
                <div v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                  <i class="fas fa-times"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Tests List -->
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">

                <!-- Loading State -->
                <div v-if="loading" class="text-center py-5">
                  <div class="loading-container">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 text-muted">Loading {{ selectedSkill.toLowerCase() }} tests...</p>
                  </div>
                </div>

                <!-- Empty State -->
                <div v-else-if="filteredTests.length === 0" class="text-center py-5">
                  <div class="empty-state">
                    <i class="fas fa-search empty-icon"></i>
                    <h5 class="mt-3 mb-2">No tests found</h5>
                    <p class="text-muted mb-3">
                      No {{ selectedSkill.toLowerCase() }} tests available{{ searchQuery ? ' matching your search' : '' }}.
                    </p>
                    <button v-if="searchQuery" @click="searchQuery = ''" class="btn btn-outline-primary">
                      Clear Search
                    </button>
                  </div>
                </div>

                <!-- Test Cards -->
                <div v-else class="row g-4">
                  <div v-for="test in paginatedTests" :key="test.id" class="col-3">
                    <div class="card shadow-sm h-100 test-card">
                      <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                          <h5 class="card-title">{{ test.title }}</h5>
                          <p class="test-description text-muted mb-3">
                            {{ test.description || 'Practice your ' + selectedSkill.toLowerCase() + ' skills with this comprehensive test.' }}
                          </p>

                        </div>
                        <router-link
                            :to="getTestRoute(test.id)"
                            class="btn btn-primary align-self-end mt-3"
                        >
                          <i class="fas fa-play me-2"></i>
                          <span>Start Test</span>
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
                  <button class="page-link" @click="currentPage > 1 && currentPage--">
                    <i class="fas fa-chevron-left me-1"></i>Previous
                  </button>
                </li>
                <li class="page-item active">
                  <span class="page-link">Page {{ currentPage }} of {{ totalPages }}</span>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage < totalPages && currentPage++">
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

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getAllListeningTests } from '../api/listening.js';
import { getAllReadingPassages } from '../api/reading.js';
import { getAllWritingPrompts } from '../api/writing.js';
import { getAllSpeakingTopics } from '../api/speaking.js';

const skills = ['Listening', 'Reading', 'Writing', 'Speaking'];
const selectedSkill = ref('Listening');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 8;
const allTests = ref([]);
const loading = ref(false);

// Skill icons mapping
const skillIcons = {
  'Listening': 'fas fa-headphones',
  'Reading': 'fas fa-book-open',
  'Writing': 'fas fa-pen',
  'Speaking': 'fas fa-microphone'
};

// Fetch tests based on selected skill
const fetchTests = async (skill) => {
  loading.value = true;
  try {
    let response;
    switch (skill) {
      case 'Listening':
        response = await getAllListeningTests();
        break;
      case 'Reading':
        response = await getAllReadingPassages();
        break;
      case 'Writing':
        response = await getAllWritingPrompts();
        break;
      case 'Speaking':
        response = await getAllSpeakingTopics();
        break;
      default:
        response = { data: [] };
    }
    console.log(`Fetched ${skill.toLowerCase()} tests:`, response.data);
    allTests.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Failed to fetch ${skill.toLowerCase()} tests:`, error);
    allTests.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTests(selectedSkill.value);
});

// Watch for skill changes
watch(selectedSkill, (newSkill) => {
  fetchTests(newSkill);
  currentPage.value = 1;
  searchQuery.value = '';
});

// Reset về trang 1 khi search
watch(searchQuery, () => {
  currentPage.value = 1;
});

const selectSkill = (skill) => {
  selectedSkill.value = skill;
};

const getSkillIcon = (skill) => {
  return skillIcons[skill] || 'fas fa-book';
};

const getTestRoute = (testId) => {
  const skillRoutes = {
    'Listening': `/listening/${testId}`,
    'Reading': `/reading/${testId}`,
    'Writing': `/writing/${testId}`,
    'Speaking': `/speaking/${testId}`
  };
  return skillRoutes[selectedSkill.value] || `/listening/${testId}`;
};

const filteredTests = computed(() => {
  if (!searchQuery.value) return allTests.value;
  return allTests.value.filter((test) =>
      test.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const totalPages = computed(() => Math.ceil(filteredTests.value.length / itemsPerPage));

const paginatedTests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredTests.value.slice(start, start + itemsPerPage);
});
</script>

<style scoped>
/* Base styles giống Test.vue */
.row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Header styles */
.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  margin-bottom: 0;
}

/* Skills tabs */
.skills-tabs {
  max-width: 600px;
}

.tab-container {
  flex-wrap: wrap;
}

.skill-tab {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
}

.skill-tab:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background-color: #0056d2;
  border-color: #0056d2;
}

.btn-primary:hover {
  background-color: #0041a8;
  border-color: #0041a8;
  box-shadow: 0 4px 12px rgba(0, 86, 210, 0.3);
}

.btn-outline-secondary {
  color: #64748b;
  border-color: #e2e8f0;
}

.btn-outline-secondary:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
  color: #0056d2;
}

/* Search bar - giống Test.vue */
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

/* Results info */
.results-info {
  font-size: 0.9rem;
}

/* Cards - cải thiện giống Test.vue */
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
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  font-size: 1.25rem;
}

.difficulty-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.difficulty-easy {
  background: #dcfce7;
  color: #16a34a;
}

.difficulty-medium {
  background: #fef3c7;
  color: #d97706;
}

.difficulty-hard {
  background: #fee2e2;
  color: #dc2626;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.test-description {
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Loading container */
.loading-container {
  padding: 2rem 1rem;
}

/* Empty state - giống Test.vue */
.empty-state {
  padding: 2rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

/* Pagination - giống Test.vue */
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

/* Responsive - giống Test.vue */
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

  .skills-tabs {
    max-width: 100%;
    margin-right: 0 !important;
  }

  .search-bar {
    max-width: 100%;
  }

  .tab-container {
    justify-content: center;
  }

  .page-title {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .skill-tab {
    font-size: 0.875rem;
    padding: 0.4rem 0.8rem;
  }

  .pagination-modern .page-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>