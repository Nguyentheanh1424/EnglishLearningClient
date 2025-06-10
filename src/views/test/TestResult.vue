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
    <div class="main-content flex-grow-1 p-4 d-flex justify-content-center">
      <div class="content-wrapper w-100" style="max-width: 800px;">
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
            <div v-else>
              <!-- Score Summary -->
              <div class="score-summary mb-4">
                <h2 class="fs-4 fw-semibold mb-3 text-center">Kết quả</h2>
                <div class="score-details">
                  <p class="fs-6 mb-2"><strong>Listening:</strong> {{ result.score?.listeningCorrect || 0 }} điểm</p>
                  <p class="fs-6 mb-2"><strong>Reading:</strong> {{ result.score?.readingCorrect || 0 }} điểm</p>
                  <p class="fs-6 mb-2"><strong>Tổng điểm:</strong> {{ result.score?.totalCorrect || 0 }}/{{ result.score?.totalQuestion || 0 }} điểm</p>
                  <p class="fs-6 text-muted mb-2">
                    Thời gian làm bài: {{ formatTime(result.timeTaken) }}
                  </p>
                  <p class="fs-6 text-muted">
                    Nộp bài: {{ formatDate(result.submittedAt) }}
                  </p>
                </div>

                <!-- Performance Statistics -->
                <div class="mt-4">
                  <h3 class="fs-6 fw-semibold mb-3">Thống kê</h3>
                  <div class="row">
                    <div class="col-6">
                      <div class="text-center p-3 bg-success bg-opacity-10 rounded">
                        <div class="fw-bold text-success fs-4">{{ correctAnswers }}</div>
                        <small class="text-muted">Đúng</small>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="text-center p-3 bg-danger bg-opacity-10 rounded">
                        <div class="fw-bold text-danger fs-4">{{ incorrectAnswers }}</div>
                        <small class="text-muted">Sai</small>
                      </div>
                    </div>
                  </div>
                  <div class="mt-2 text-center">
                  <span class="badge bg-primary fs-6">
                    Tỷ lệ đúng: {{ accuracyPercentage }}%
                  </span>
                  </div>
                </div>
              </div>

              <!-- Answer List -->
              <div class="answer-list">
                <h2 class="fs-5 fw-semibold mb-3">Chi tiết câu trả lời</h2>
                <div class="answers-container">
                  <div
                      v-for="(i, index) in answers"
                      :key="i.questionId"
                      class="answer-card card mb-3"
                      :class="{ 'border-success': i.isCorrect, 'border-danger': !i.isCorrect }"
                  >

                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <p class="fs-6 fw-medium mb-0 flex-grow-1">
                        <span class="badge me-2" :class="i.isCorrect ? 'bg-success' : 'bg-danger'">
                          Câu {{ index + 1 }}
                        </span>
                          {{ getQuestionContent(i.questionId) }}
                        </p>
                        <div class="status ms-2">
                          <i
                              :class="i.isCorrect ? 'fas fa-check text-success' : 'fas fa-times text-danger'"
                              :aria-label="i.isCorrect ? 'Đúng' : 'Sai'"
                          ></i>
                        </div>
                      </div>

                      <div class="answer-details">
                        <p class="fs-6 mb-2">
                          <strong>Trả lời của bạn: </strong>
                          <span :class="!i.answer || i.answer.trim() === '' ? 'text-muted fst-italic' : ''">
                          {{ i.answer && i.answer.trim() !== '' ? i.answer : 'Không trả lời' }}
                        </span>
                        </p>

                        <!-- Hiển thị đáp án đúng và giải thích nếu trả lời sai -->
                        <div v-if="!i.isCorrect" class="mt-3">
                          <!-- Đáp án đúng (nếu có) -->
                          <div v-if="!i.isCorrect" class="correct-answer mb-2 p-2 bg-success bg-opacity-10 border-start border-success border-3 rounded">
                            <p class="fs-6 mb-0">
                              <i class="fas fa-check-circle text-success me-2"></i>
                              <strong>Đáp án đúng: </strong>
                              <span class="text-success fw-semibold">{{ getCorrectAnswer(i) }}</span>
                            </p>
                          </div>

                          <!-- Giải thích -->
                          <div v-if="i.explanation" class="explanation p-3 bg-info bg-opacity-10 border-start border-info border-3 rounded">
                            <div class="d-flex align-items-start">
                              <i class="fas fa-lightbulb text-info me-2 mt-1 flex-shrink-0"></i>
                              <div class="flex-grow-1">
                                <p class="fs-6 fw-semibold text-info mb-1">Giải thích:</p>
                                <p class="fs-6 mb-0 text-dark">{{ i.explanation }}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Hiển thị explanation cho câu đúng (nếu muốn) -->
                        <div v-else-if="i.isCorrect && i.explanation" class="mt-2">
                          <div class="explanation p-2 bg-success bg-opacity-10 border-start border-success border-2 rounded">
                            <p class="fs-6 mb-0">
                              <i class="fas fa-info-circle text-success me-2"></i>
                              <small class="text-muted">{{ i.explanation }}</small>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getTestResultById,
  getMockTestById,
} from '@/api/test.js';

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

    // Computed properties
    const answers = computed(() => result.value?.answers || []);

    const totalAnswers = computed(() => answers.value.length);

    const correctAnswers = computed(() => answers.value.filter(a => a.isCorrect).length);

    const incorrectAnswers = computed(() => totalAnswers.value - correctAnswers.value);

    const accuracyPercentage = computed(() => {
      if (totalAnswers.value === 0) return 0;
      return Math.round((correctAnswers.value / totalAnswers.value) * 100);
    });

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
      if (!test.value?.sections) return 'Đang tải câu hỏi...';

      const question = test.value.sections
          .flatMap(section => section.subSections || [])
          .flatMap(subSection => subSection.questions || [])
          .find(q => q.id === questionId);

      return question?.content || question?.question || `Question ID: ${questionId}`;
    };

    // API functions
    const fetchResult = async () => {
      try {
        error.value = '';
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
        }
        const response = await getTestResultById(resultId);
        result.value = response.data || response;
      } catch (err) {
        console.error('Failed to fetch result:', err);
        error.value = err.response?.data?.message || 'Không thể tải kết quả. Vui lòng thử lại.';
      }
    };

    const fetchTest = async () => {
      if (!result.value?.mockTestId) return;
      try {
        const response = await getMockTestById(result.value.mockTestId);
        test.value = response.data || response;
      } catch (err) {
        console.error('Failed to fetch test:', err);
        error.value = err.response?.data?.message || 'Không thể tải thông tin bài thi.';
      }
    };


    // Lifecycle hooks
    onMounted(async () => {
      await fetchResult();
      if (result.value?.mockTestId) {
        await fetchTest();
      }
    });

    // Navigation
    const goBack = () => {
      router.push({ name: 'Tests' });
    };

    // Helper function to get correct answer with fallback options
    const getCorrectAnswer = (answer) => {
      // Try different property names that might contain the correct answer
      return answer.answerCorrect || 
             answer.correctAnswer || 
             answer.Correct || 
             answer.correct ||
             'Không có đáp án';
    };


    return {
      result,
      test,
      answers,
      performance,
      error,
      correctAnswers,
      incorrectAnswers,
      accuracyPercentage,
      formatTime,
      formatDate,
      getQuestionContent,
      getCorrectAnswer,
      goBack,
    };
  },
};
</script>

<style scoped>

.result-container {
  min-height: 50vh;
  background-color: #f8f9fa;
}

.answer-card {
  transition: all 0.2s ease;
}

.answer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.explanation {
  animation: fadeIn 0.3s ease-in;
}

.correct-answer {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.score-details p {
  margin-bottom: 0.5rem;
}

.status {
  min-width: 30px;
}

/* Custom styling for explanation sections */
.explanation .fas.fa-lightbulb {
  font-size: 1.1rem;
}

.correct-answer .fas.fa-check-circle {
  font-size: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .explanation {
    padding: 0.75rem !important;
  }

  .correct-answer {
    padding: 0.75rem !important;
  }
}
</style>
