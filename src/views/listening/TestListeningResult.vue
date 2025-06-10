<template>
  <div class="min-vh-100 bg-light">
    <!-- Loading State -->
    <div v-if="loading" class="vh-100 d-flex align-items-center justify-content-center">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <h5 class="text-dark">Loading results...</h5>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="vh-100 d-flex align-items-center justify-content-center">
      <div class="text-center">
        <div class="mb-4">
          <i class="bi bi-exclamation-triangle text-danger" style="font-size: 4rem;"></i>
        </div>
        <h4 class="text-danger mb-3">{{ error }}</h4>
        <div class="d-flex gap-3 justify-content-center">
          <button @click="loadResults" class="btn btn-primary">
            <i class="bi bi-arrow-clockwise me-2"></i>Try Again
          </button>
          <button @click="goBackToTests" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-2"></i>Back to Tests
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="resultData">
      <!-- Header -->
      <nav class="navbar navbar-light bg-white shadow-sm">
        <div class="container-xxl">
          <div class="d-flex justify-content-between align-items-center w-100">
            <div>
              <h1 class="navbar-brand mb-0 h1 fw-bold text-dark">
                <i class="bi fs- bi-clipboard-check me-0"></i>Test Results
              </h1>
              <p class="text-muted mb-0">{{ resultData.testTitle }}</p>
            </div>
            <div>
              <button @click="goBackToTests" class="btn btn-outline-primary me-2">
                <i class="bi bi-arrow-left me-2"></i>Back to Tests
              </button>
              <button @click="retakeTest" class="btn btn-primary">
                <i class="bi bi-arrow-repeat me-2"></i>Retake Test
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="container-xxl py-4">
        <!-- Score Overview -->
        <div class="row g-4 mb-4">
          <div class="col-md-3">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="mb-3">
                  <div
                      class="score-circle mx-auto d-flex align-items-center justify-content-center"
                      :class="getScoreColorClass(scorePercentage)"
                  >
                    <span class="h3 fw-bold mb-0 text-white">{{ scorePercentage }}%</span>
                  </div>
                </div>
                <h5 class="card-title fw-semibold">Overall Score</h5>
                <p class="text-muted mb-0">{{ resultData.correctAnswers }} / {{ resultData.totalQuestions }} points</p>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="mb-3">
                  <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
                </div>
                <h5 class="card-title fw-semibold">Correct Answers</h5>
                <p class="text-muted mb-0">{{ resultData.correctAnswers }} / {{ resultData.totalQuestions }}</p>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="mb-3">
                  <i class="bi bi-clock-fill text-info" style="font-size: 3rem;"></i>
                </div>
                <h5 class="card-title fw-semibold">Time Spent</h5>
                <p class="text-muted mb-0">{{ formatTime(resultData.timeSpent) }}</p>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="mb-3">
                  <i class="bi bi-calendar-check-fill text-warning" style="font-size: 3rem;"></i>
                </div>
                <h5 class="card-title fw-semibold">Completed</h5>
                <p class="text-muted mb-0">{{ formatDate(resultData.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Analysis -->
        <div class="card mb-4 shadow-sm">
          <div class="card-body">
            <h5 class="card-title fw-semibold mb-4">
              <i class="bi bi-graph-up me-2"></i>Performance Analysis
            </h5>

            <div class="row g-4">
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-3">
                  <div class="flex-shrink-0 me-3">
                    <div
                        class="performance-icon d-flex align-items-center justify-content-center rounded-circle"
                        :class="getPerformanceClass(scorePercentage)"
                    >
                      <i :class="getPerformanceIcon(scorePercentage)"></i>
                    </div>
                  </div>
                  <div>
                    <h6 class="mb-1 fw-semibold">{{ getPerformanceLevel(scorePercentage) }}</h6>
                    <p class="text-muted mb-0">{{ getPerformanceMessage(scorePercentage) }}</p>
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Accuracy Rate</span>
                    <span class="fw-semibold">{{ accuracyRate }}%</span>
                  </div>
                  <div class="progress" style="height: 10px;">
                    <div
                        class="progress-bar"
                        :class="getScoreColorClass(accuracyRate)"
                        :style="{ width: `${accuracyRate}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Results -->
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="card-title fw-semibold mb-0">
                <i class="bi bi-list-check me-2"></i>Question Details
              </h5>
              <div class="d-flex gap-2">
                <button
                    @click="showAllAnswers = !showAllAnswers"
                    class="btn btn-sm btn-outline-primary"
                >
                  <i :class="showAllAnswers ? 'bi bi-eye-slash' : 'bi bi-eye'" class="me-1"></i>
                  {{ showAllAnswers ? 'Hide' : 'Show' }} All Answers
                </button>
              </div>
            </div>

            <!-- Questions List -->
            <div class="row g-3">
              <div
                  v-for="(answer, index) in resultData.answers"
                  :key="answer.questionId"
                  class="col-12"
              >
                <div
                    class="card border"
                    :class="answer.isCorrect ? 'border-success bg-success bg-opacity-10' : 'border-danger bg-danger bg-opacity-10'"
                >
                  <div class="card-body">
                    <div class="d-flex gap-3">
                      <!-- Question Number & Status -->
                      <div class="flex-shrink-0">
                        <div
                            class="question-number d-flex align-items-center justify-content-center rounded-circle fw-bold"
                            :class="answer.isCorrect ? 'bg-success text-white' : 'bg-danger text-white'"
                        >
                          {{ index + 1 }}
                        </div>
                      </div>

                      <!-- Question Content -->
                      <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <span
                                class="badge me-2"
                                :class="answer.isCorrect ? 'bg-success' : 'bg-danger'"
                            >
                              <i :class="answer.isCorrect ? 'bi bi-check-lg' : 'bi bi-x-lg'" class="me-1"></i>
                              {{ answer.isCorrect ? 'Correct' : 'Incorrect' }}
                            </span>
                            <span class="text-muted">Question {{ index + 1 }}</span>
                          </div>
                        </div>

                        <!-- User Answer -->
                        <div class="mb-3">
                          <strong class="text-muted d-block mb-2">Your Answer:</strong>
                          <div
                              class="p-3 rounded border"
                              :class="answer.isCorrect ? 'border-success bg-success bg-opacity-5' : 'border-danger bg-danger bg-opacity-5'"
                          >
                            <span v-if="answer.answer && answer.answer.trim()">
                              {{ answer.answer }}
                            </span>
                            <span v-else class="text-muted fst-italic">
                              No answer provided
                            </span>
                          </div>
                        </div>

                        <!-- Feedback -->
                        <div v-if="answer.feedback && (showAllAnswers || !answer.isCorrect)">
                          <strong class="text-muted d-block mb-2">
                            <i class="bi bi-lightbulb me-1"></i>Explanation:
                          </strong>
                          <div class="p-3 rounded bg-light border">
                            <p class="mb-0">{{ answer.feedback }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Questions Message -->
            <div v-if="!resultData.answers || resultData.answers.length === 0" class="text-center py-5">
              <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
              <h5 class="text-muted mt-3">No question details available</h5>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="row mt-4">
          <div class="col-12 text-center">
            <div class="d-flex gap-3 justify-content-center flex-wrap">
              <button @click="retakeTest" class="btn btn-primary btn-lg">
                <i class="bi bi-arrow-repeat me-2"></i>Retake This Test
              </button>
              <button @click="goBackToTests" class="btn btn-outline-secondary btn-lg">
                <i class="bi bi-arrow-left me-2"></i>Back to Tests
              </button>
              <button @click="shareResults" class="btn btn-outline-success btn-lg">
                <i class="bi bi-share me-2"></i>Share Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div
          v-for="notification in notifications"
          :key="notification.id"
          class="toast show"
          :class="notification.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'"
          role="alert"
      >
        <div class="toast-body d-flex align-items-center gap-2">
          <i :class="notification.type === 'success' ? 'bi bi-check-circle' : 'bi bi-exclamation-circle'"></i>
          {{ notification.message }}
          <button
              type="button"
              class="btn-close btn-close-white ms-auto"
              @click="removeNotification(notification.id)"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTestAttemptById } from '@/api/listening';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'TestListeningResult',
  setup() {
    // Reactive state
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const resultData = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const showAllAnswers = ref(false);
    const notifications = ref([]);

    // Get attempt ID from route params
    const attemptId = route.params.id;

    // Computed properties
    const scorePercentage = computed(() => {
      if (!resultData.value || resultData.value.totalQuestions === 0) return 0;
      return Math.round((resultData.value.correctAnswers / resultData.value.totalQuestions) * 100);
    });


    const accuracyRate = computed(() => {
      if (!resultData.value || resultData.value.totalQuestions === 0) return 0;
      return Math.round((resultData.value.correctAnswers / resultData.value.totalQuestions) * 100);
    });

    // Methods
    const formatTime = (seconds) => {
      if (!seconds || seconds < 0) return '0s';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      }
      return `${remainingSeconds}s`;
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getScoreColorClass = (percentage) => {
      if (percentage >= 80) return 'bg-success';
      if (percentage >= 60) return 'bg-warning';
      return 'bg-danger';
    };

    const getPerformanceLevel = (percentage) => {
      if (percentage >= 90) return 'Excellent';
      if (percentage >= 80) return 'Very Good';
      if (percentage >= 70) return 'Good';
      if (percentage >= 60) return 'Average';
      if (percentage >= 50) return 'Below Average';
      return 'Needs Improvement';
    };

    const getPerformanceMessage = (percentage) => {
      if (percentage >= 90) return 'Outstanding performance! You have excellent listening skills.';
      if (percentage >= 80) return 'Great job! Your listening comprehension is very strong.';
      if (percentage >= 70) return 'Good work! Keep practicing to improve further.';
      if (percentage >= 60) return 'Fair performance. Consider more practice to enhance your skills.';
      if (percentage >= 50) return 'You need more practice. Focus on listening exercises.';
      return 'Significant improvement needed. Regular practice is recommended.';
    };

    const getPerformanceClass = (percentage) => {
      if (percentage >= 80) return 'text-success bg-success bg-opacity-10';
      if (percentage >= 60) return 'text-warning bg-warning bg-opacity-10';
      return 'text-danger bg-danger bg-opacity-10';
    };

    const getPerformanceIcon = (percentage) => {
      if (percentage >= 80) return 'bi bi-emoji-smile-fill';
      if (percentage >= 60) return 'bi bi-emoji-neutral-fill';
      return 'bi bi-emoji-frown-fill';
    };

    const addNotification = (message, type = 'success') => {
      const id = Date.now();
      notifications.value.push({ id, message, type });
      setTimeout(() => removeNotification(id), 5000);
    };

    const removeNotification = (id) => {
      notifications.value = notifications.value.filter(n => n.id !== id);
    };

    const loadResults = async () => {
      try {
        loading.value = true;
        error.value = null;

        if (!attemptId) {
          throw new Error('Attempt ID is required');
        }

        console.log('Loading results for attempt:', attemptId);

        // Get test results
        const response = await getTestAttemptById(attemptId);
        resultData.value = response.data;

        console.log('Results loaded:', resultData.value);

        if (!resultData.value) {
          throw new Error('No results found for this attempt');
        }

      } catch (err) {
        console.error('Failed to load results:', err);
        error.value = err.response?.data?.error || err.message || 'Failed to load test results';
      } finally {
        loading.value = false;
      }
    };

    const goBackToTests = () => {
      router.push({ name: 'Tests' });
    };

    const retakeTest = () => {
      if (resultData.value?.testId) {
        router.push({
          name: 'ListeningTest',
          params: { id: resultData.value.testId }
        });
      } else {
        addNotification('Cannot retake test: Test ID not found', 'error');
      }
    };

    const shareResults = () => {
      if (navigator.share && resultData.value) {
        navigator.share({
          title: 'My Listening Test Results',
          text: `I scored ${scorePercentage.value}% (${resultData.value.correctAnswers}/${resultData.value.totalQuestions}) on "${resultData.value.testTitle}"`,
          url: window.location.href
        }).catch(() => {
          // Fallback to copying to clipboard
          copyToClipboard();
        });
      } else {
        copyToClipboard();
      }
    };

    const copyToClipboard = () => {
      const text = `I scored ${scorePercentage.value}% (${resultData.value.correctAnswers}/${resultData.value.totalQuestions}) on "${resultData.value.testTitle}" - ${window.location.href}`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          addNotification('Results copied to clipboard!', 'success');
        }).catch(() => {
          addNotification('Failed to copy results', 'error');
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          addNotification('Results copied to clipboard!', 'success');
        } catch (err) {
          addNotification('Failed to copy results', 'error');
        }
        document.body.removeChild(textArea);
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      loadResults();
    });

    return {
      // State
      resultData,
      loading,
      error,
      showAllAnswers,
      notifications,

      // Computed
      scorePercentage,
      accuracyRate,

      // Methods
      formatTime,
      formatDate,
      getScoreColorClass,
      getPerformanceLevel,
      getPerformanceMessage,
      getPerformanceClass,
      getPerformanceIcon,
      loadResults,
      goBackToTests,
      retakeTest,
      shareResults,
      removeNotification
    };
  }
};
</script>

<style scoped>

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.performance-icon {
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
}

.question-number {
  width: 40px;
  height: 40px;
  font-size: 1.1rem;
}

.card {
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}

.progress {
  transition: all 0.3s ease;
}

.btn {
  transition: all 0.2s ease;
}

.toast {
  min-width: 300px;
}

.bg-success.bg-opacity-10 {
  background-color: rgba(25, 135, 84, 0.1) !important;
}

.bg-danger.bg-opacity-10 {
  background-color: rgba(220, 53, 69, 0.1) !important;
}

.bg-success.bg-opacity-5 {
  background-color: rgba(25, 135, 84, 0.05) !important;
}

.bg-danger.bg-opacity-5 {
  background-color: rgba(220, 53, 69, 0.05) !important;
}

.border-success {
  border-color: #198754 !important;
}

.border-danger {
  border-color: #dc3545 !important;
}

@media (max-width: 768px) {
  .btn-lg {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  .score-circle {
    width: 70px;
    height: 70px;
  }

  .performance-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}
</style>