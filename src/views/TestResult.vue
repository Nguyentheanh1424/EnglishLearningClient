<template>
  <div class="result-container d-flex flex-column">
    <!-- Header -->
    <header class="header card shadow mb-4">
      <div class="card-body d-flex justify-content-between align-items-center">
        <h1 class="fs-4 fw-bold mb-0">
          Kết quả - {{ test?.title || 'Loading...' }}
        </h1>
        <button
            class="btn btn-primary px-4 py-2"
            @click="goBack"
            aria-label="Quay lại danh sách bài kiểm tra"
        >
          Quay lại
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="main-content flex-grow-1 p-4">
      <div class="card shadow">
        <div class="card-body">
          <!-- Error Alert -->
          <div v-if="error" class="alert alert-danger alert-dismissible" role="alert">
            {{ error }}
            <button type="button" class="btn-close" @click="error = ''" aria-label="Close"></button>
          </div>

          <!-- Loading State -->
          <div v-else-if="!result || !test" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Đang tải kết quả...</p>
          </div>

          <!-- Result Content -->
          <div v-else class="row">
            <!-- Score Summary -->
            <div class="col-lg-5 score-summary mb-4">
              <h2 class="fs-5 fw-semibold mb-3">Tổng quan điểm số</h2>
              <canvas ref="scoreChart" class="mb-4" aria-label="Biểu đồ điểm số"></canvas>
              <div class="score-details">
                <p class="fs-6 mb-2"><strong>Listening:</strong> {{ result.score.listening }} điểm</p>
                <p class="fs-6 mb-2"><strong>Reading:</strong> {{ result.score.reading }} điểm</p>
                <p class="fs-6 mb-2"><strong>Tổng điểm:</strong> {{ result.score.total }} điểm</p>
                <p class="fs-6 text-muted mb-2">
                  Thời gian làm bài: {{ formatTime(result.timeTaken) }}
                </p>
                <p class="fs-6 text-muted">
                  Nộp bài: {{ formatDate(result.submittedAt) }}
                </p>
              </div>
              <!-- Performance Suggestions -->
              <div v-if="performance.suggestions?.length" class="mt-4">
                <h3 class="fs-6 fw-semibold mb-3">Gợi ý cải thiện</h3>
                <ul class="list-group">
                  <li
                      v-for="(suggestion, index) in performance.suggestions"
                      :key="index"
                      class="list-group-item border-0 ps-0"
                  >
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Answer List -->
            <div class="col-lg-7 answer-list">
              <h2 class="fs-5 fw-semibold mb-3">Chi tiết câu trả lời</h2>
              <div class="answers-container">
                <div
                    v-for="(answer, index) in result.answers"
                    :key="index"
                    class="answer-card card mb-3"
                    :class="{ 'border-success': answer.isCorrect, 'border-danger': !answer.isCorrect }"
                >
                  <div class="card-body">
                    <p class="fs-6 fw-medium mb-2">
                      Câu {{ index + 1 }}: {{ getQuestionContent(answer.questionId) }}
                    </p>
                    <p class="fs-6 mb-2">
                      Trả lời: {{ answer.answer || 'Không trả lời' }}
                    </p>
                    <div class="status mb-2">
                      <i
                          :class="answer.isCorrect ? 'fas fa-check text-success' : 'fas fa-times text-danger'"
                          :aria-label="answer.isCorrect ? 'Đúng' : 'Sai'"
                      ></i>
                    </div>
                    <p v-if="answer.explanation && !answer.isCorrect" class="fs-6 text-muted explanation">
                      <strong>Giải thích:</strong> {{ answer.explanation }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Chart from 'chart.js/auto';
import {
  getTestResultById,
  getMockTestById,
  getPerformanceAnalysis,
} from '../api/test';

export default {
  name: 'TestResult',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const resultId = route.params.id;

    // Reactive data
    const result = ref(null);
    const test = ref(null);
    const performance = ref({});
    const error = ref('');
    const scoreChart = ref(null);
    let chartInstance = null;

    // Computed properties
    const chartData = computed(() => {
      if (!result.value || !performance.value.correctCount) return null;
      return {
        labels: ['Listening', 'Reading'],
        datasets: [
          {
            label: 'Đúng',
            data: [
              performance.value.correctCount['Listening_MultipleChoice'] || 0,
              performance.value.correctCount['Reading_MultipleChoice'] || 0,
            ],
            backgroundColor: '#38A169',
          },
          {
            label: 'Sai',
            data: [
              performance.value.incorrectCount['Listening_MultipleChoice'] || 0,
              performance.value.incorrectCount['Reading_MultipleChoice'] || 0,
            ],
            backgroundColor: '#E53E3E',
          },
        ],
      };
    });

    // Helper functions
    const formatTime = (seconds) => {
      if (!seconds || seconds < 0) return '00:00';
      const min = Math.floor(seconds / 60);
      const sec = seconds % 60;
      return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

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

    const getQuestionContent = (questionId) => {
      if (!test.value) return 'Không tìm thấy câu hỏi';
      const question = test.value.sections
          .flatMap(section => section.subSections)
          .flatMap(subSection => subSection.questions)
          .find(q => q.id === questionId);
      return question?.content || 'Không tìm thấy câu hỏi';
    };

    // API functions
    const fetchResult = async () => {
      try {
        error.value = '';
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
        }
        const response = await getTestResultById(token, resultId);
        result.value = response.data;
      } catch (err) {
        console.error('Failed to fetch result:', err);
        error.value = err.response?.data?.message || 'Không thể tải kết quả. Vui lòng thử lại.';
      }
    };

    const fetchTest = async () => {
      if (!result.value?.mockTestId) return;
      try {
        const response = await getMockTestById(result.value.mockTestId);
        test.value = response.data;
      } catch (err) {
        console.error('Failed to fetch test:', err);
        error.value = err.response?.data?.message || 'Không thể tải thông tin bài thi.';
      }
    };

    const fetchPerformance = async () => {
      if (!result.value?.mockTestId) return;
      try {
        const token = localStorage.getItem('token');
        const response = await getPerformanceAnalysis(token, result.value.mockTestId);
        performance.value = response.data || {};
      } catch (err) {
        console.error('Failed to fetch performance:', err);
        // Silent error, as performance analysis is secondary
      }
    };

    // Chart initialization
    const initChart = () => {
      if (!scoreChart.value || !chartData.value) return;
      chartInstance = new Chart(scoreChart.value, {
        type: 'bar',
        data: chartData.value,
        options: {
          responsive: true,
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Số câu' } },
          },
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Kết quả theo kỹ năng' },
            tooltip: { enabled: true },
          },
        },
      });
    };

    // Navigation
    const goBack = () => {
      router.push('/tests');
    };

    // Lifecycle hooks
    onMounted(async () => {
      await fetchResult();
      await fetchTest();
      await fetchPerformance();
      initChart();
    });

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    });

    return {
      result,
      test,
      performance,
      error,
      scoreChart,
      chartData,
      formatTime,
      formatDate,
      getQuestionContent,
      goBack,
    };
  },
};
</script>

<style scoped>
.result-container {
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
  padding-top: 130px;
}

.header {
  margin: 0 16px;
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header .card-body {
  padding: 1.5rem;
}

.main-content {
  padding: 16px;
}

.card {
  border: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.score-summary canvas {
  max-height: 300px;
}

.score-details p {
  color: #1A202C;
}

.answer-list {
  max-height: 70vh;
  overflow-y: auto;
  position: sticky;
  top: 16px;
}

.answers-container {
  padding-right: 8px;
}

.answer-card {
  border-width: 2px;
  transition: all 0.3s ease;
}

.answer-card:hover {
  box-shadow: 0 4px 12px rgba(0, 86, 210, 0.1);
}

.answer-card .status i {
  font-size: 1.25rem;
}

.explanation {
  background-color: #EDF2F7;
  padding: 8px;
  border-radius: 8px;
}

.btn-primary {
  background-color: #0056d2;
  border-color: #0056d2;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #0041a8;
  border-color: #0041a8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 86, 210, 0.4);
}

.alert {
  border-radius: 8px;
  border: none;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.list-group-item {
  font-size: 14px;
  color: #1A202C;
}

/* Responsive Design */
@media (max-width: 991px) {
  .result-container {
    padding-top: 20px;
  }

  .header {
    margin: 0 8px;
  }

  .header .card-body {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.25rem;
  }

  .main-content {
    padding: 8px;
  }

  .score-summary,
  .answer-list {
    max-height: none;
  }

  .answer-list {
    position: static;
    margin-top: 20px;
  }

  .answer-card {
    padding: 12px;
  }

  .answer-card p {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .header .card-body {
    padding: 0.75rem;
  }

  .header h1 {
    font-size: 1.1rem;
  }

  .btn-primary {
    padding: 10px 20px;
    font-size: 14px;
  }
}

/* Print styles */
@media print {
  .result-container {
    background: white;
    padding: 0;
  }

  .header,
  .btn,
  .alert {
    display: none !important;
  }

  .card {
    box-shadow: none;
    border: 1px solid #000;
  }

  .answer-card {
    break-inside: avoid;
    border: 1px solid #000;
    margin-bottom: 20px;
  }
}

/* Custom scrollbar */
.answers-container::-webkit-scrollbar {
  width: 8px;
}

.answers-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.answers-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.answers-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Accessibility improvements */
.btn:focus,
.answer-card:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 86, 210, 0.25);
}
</style>