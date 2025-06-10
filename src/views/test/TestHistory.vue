<template>
  <div class="test-history-page">
    <!-- Hero Header -->
    <section class="hero-header">
      <div class="hero-background">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <i class="fas fa-history"></i>
          <span>Test History</span>
        </div>
        <h1 class="hero-title">Test History</h1>
        <p class="hero-subtitle">Track your learning progress and review your test results.</p>
      </div>
    </section>

    <!-- Main Content -->
    <section class="main-content">
      <div class="container">
        <!-- Error State -->
        <div v-if="error" class="error-card">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="error-content">
            <h3>Có lỗi xảy ra</h3>
            <p>{{ error }}</p>
            <button class="btn-retry" @click="fetchTestHistory">
              <i class="fas fa-redo"></i>
              Thử lại
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="loading" class="loading-container">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Đang tải lịch sử làm bài...</p>
          </div>
        </div>

        <!-- Content -->
        <div v-else class="content-wrapper">
          <!-- Stats Cards -->
          <div class="stats-grid" v-if="testHistory.length > 0">
            <div class="stat-card">
              <div class="stat-icon completed">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ testHistory.length }}</div>
                <div class="stat-label">Test Taken</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon average">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ averageScore }}%</div>
                <div class="stat-label">Average Score</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon time">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ totalTime }}</div>
                <div class="stat-label">Total Time</div>
              </div>
            </div>
          </div>

          <!-- Test History Table -->
          <div class="history-section" v-if="testHistory.length > 0">
            <div class="section-header">
              <h2>History Test</h2>
              <div class="filter-controls">
                <div class="search-box">
                  <i class="fas fa-search"></i>
                  <input
                      type="text"
                      placeholder="Tìm kiếm bài test..."
                      v-model="searchQuery"
                  >
                </div>
              </div>
            </div>

            <div class="history-grid">
              <div
                  v-for="test in filteredTests"
                  :key="test.id"
                  class="history-card"
                  @click="viewResult(test.id)"
              >
                <div class="card-header">
                  <div class="test-title">
                    <i class="fas fa-file-alt"></i>
                    <h3>{{ test.title }}</h3>
                  </div>
                  <div class="test-score" :class="getScoreClass(test.score)">
                    {{ test.score?.totalCorrect || 0 }}/{{ test.score?.totalQuestion || 0 }}
                  </div>
                </div>

                <div class="card-body">
                  <div class="test-info">
                    <div class="info-item">
                      <i class="fas fa-calendar"></i>
                      <span>{{ formatDate(test.submittedAt) }}</span>
                    </div>
                    <div class="info-item">
                      <i class="fas fa-stopwatch"></i>
                      <span>{{ formatTime(test.timeTaken) }}</span>
                    </div>
                  </div>

                  <div class="progress-bar">
                    <div
                        class="progress-fill"
                        :style="{ width: getScorePercentage(test.score) + '%' }"
                        :class="getScoreClass(test.score)"
                    ></div>
                  </div>

                  <div class="card-footer">
                    <span class="score-text">{{ getScorePercentage(test.score) }}% completed</span>
                    <button class="btn-view-details">
                      View Detail
                      <i class="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <h3>Chưa có lịch sử làm bài</h3>
            <p>Bạn chưa hoàn thành bài test nào. Hãy bắt đầu với bài test đầu tiên!</p>
            <button class="btn-start-test" @click="$router.push('/tests')">
              <i class="fas fa-play"></i>
              Bắt đầu làm bài
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getUserTestHistory } from '@/api/test.js';
import { useAuthStore } from '@/stores/auth.js';

const router = useRouter();
const testHistory = ref([]);
const loading = ref(false);
const error = ref('');
const searchQuery = ref('');

const authStore = useAuthStore();
const userId = computed(() => authStore.user?.id);

const fetchTestHistory = async () => {
  loading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Vui lòng đăng nhập lại.');
    if (!userId.value) throw new Error('Không tìm thấy ID người dùng.');

    const response = await getUserTestHistory(userId.value);
    testHistory.value = response.data || response;
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Lỗi khi tải lịch sử.';
  } finally {
    loading.value = false;
  }
};

const filteredTests = computed(() => {
  if (!searchQuery.value) return testHistory.value;
  return testHistory.value.filter(test =>
      test.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const averageScore = computed(() => {
  if (testHistory.value.length === 0) return 0;
  const total = testHistory.value.reduce((sum, test) => {
    const percentage = getScorePercentage(test.score);
    return sum + percentage;
  }, 0);
  return Math.round(total / testHistory.value.length);
});

const totalTime = computed(() => {
  const totalSeconds = testHistory.value.reduce((sum, test) => sum + (test.timeTaken || 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '00:00';
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const getScorePercentage = (score) => {
  if (!score || !score.totalQuestion) return 0;
  return Math.round((score.totalCorrect / score.totalQuestion) * 100);
};

const getScoreClass = (score) => {
  const percentage = getScorePercentage(score);
  if (percentage >= 80) return 'excellent';
  if (percentage >= 60) return 'good';
  if (percentage >= 40) return 'average';
  return 'poor';
};

const viewResult = (id) => {
  router.push({ name: 'TestResult', params: { id } });
};

onMounted(() => {
  fetchTestHistory();

  // Add animations
  setTimeout(() => {
    const cards = document.querySelectorAll('.history-card, .stat-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate-in');
      }, index * 100);
    });
  }, 500);
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.test-history-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  min-height: 100vh;
  background: #f8fafc;
}

/* Hero Header */
.hero-header {
  position: relative;
  padding: 40px 0 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  color: white;
  overflow: hidden;
}

@keyframes gradientShift {
  0% { background-position: 0 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
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
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 60px;
  height: 60px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  right: 30%;
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
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 15px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

/* Main Content */
.main-content {
  padding: 60px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Error State */
.error-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #ef4444;
}

.error-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ef4444, #f87171);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 30px;
  color: white;
}

.error-content h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #ef4444;
}

.error-content p {
  color: #718096;
  margin-bottom: 20px;
}

.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-left: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  color: #718096;
  font-weight: 500;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
}

.stat-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.completed {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.average {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.time {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #2d3748;
  line-height: 1;
}

.stat-label {
  color: #718096;
  font-size: 0.9rem;
  margin-top: 5px;
}

/* History Section */
.history-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.section-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
}

.filter-controls {
  display: flex;
  gap: 15px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 15px;
  color: #718096;
  z-index: 1;
}

.search-box input {
  padding: 12px 15px 12px 45px;
  border: 2px solid #e2e8f0;
  border-radius: 50px;
  font-size: 14px;
  width: 250px;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* History Grid */
.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.history-card {
  background: #f8fafc;
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  opacity: 0;
  transform: translateY(20px);
}

.history-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.history-card:hover {
  background: white;
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.test-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.test-title i {
  color: #667eea;
  font-size: 18px;
}

.test-title h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  line-height: 1.3;
}

.test-score {
  font-size: 1.2rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 20px;
  color: white;
}

.test-score.excellent {
  background: linear-gradient(135deg, #10b981, #059669);
}

.test-score.good {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.test-score.average {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.test-score.poor {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.card-body {
  margin-bottom: 15px;
}

.test-info {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 0.9rem;
}

.info-item i {
  color: #667eea;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 3px;
}

.progress-fill.excellent {
  background: linear-gradient(90deg, #10b981, #059669);
}

.progress-fill.good {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.progress-fill.average {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.progress-fill.poor {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-text {
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-view-details {
  padding: 8px 8px;
  border-radius: 999px;
  border: none;
  background: #667eea;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-view-details:hover {
  background: #5a67d8;
  transform: scale(1.1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  font-size: 50px;
  color: #718096;
}

.empty-state h3 {
  font-size: 1.8rem;
  color: #2d3748;
  margin-bottom: 15px;
}

.empty-state p {
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 30px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.btn-start-test {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-start-test:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box input {
    width: 100%;
  }

  .history-grid {
    grid-template-columns: 1fr;
  }

  .test-info {
    flex-direction: column;
    gap: 10px;
  }

  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .hero-header {
    padding: 100px 0 60px;
  }

  .main-content {
    padding: 40px 0;
  }

  .history-section {
    padding: 20px;
  }

  .history-card {
    padding: 15px;
  }
}
</style>