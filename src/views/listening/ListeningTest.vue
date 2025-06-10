<template>
  <div class="min-vh-100 bg-light">
    <!-- Loading State -->
    <div v-if="loading" class="vh-100 d-flex align-items-center justify-content-center">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <h5 class="text-dark">Loading test...</h5>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="vh-100 d-flex align-items-center justify-content-center">
      <div class="text-center">
        <h5 class="text-danger">{{ error }}</h5>
        <button @click="initializeTest" class="btn btn-primary mt-3">Try Again</button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Header -->
      <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm border-bottom">
        <div class="container-xxl">
          <div class="d-flex justify-content-between align-items-center w-100">
            <div>
              <h1 class="navbar-brand mb-0 h1 fw-bold text-dark">
                {{ testData?.title || 'Listening Test' }}
              </h1>
              <p class="text-muted mb-0">
                {{ testData?.description || 'IELTS Listening Practice' }}
              </p>
            </div>

            <div class="d-flex align-items-center gap-3">
              <!-- Timer -->
              <div
                  :class="[
                  'd-flex align-items-center gap-2 px-3 py-2 rounded fw-bold',
                  timeRemaining < 300 ? 'bg-danger text-white' : 'bg-primary text-white'
                ]"
              >
                <i class="bi bi-clock"></i>
                <span>{{ formatTime(timeRemaining) }}</span>
              </div>

              <!-- Submit Button -->
              <button
                  @click="showSubmitConfirmation = true"
                  :disabled="submitting"
                  class="btn btn-danger d-flex align-items-center gap-2"
              >
                <i class="bi bi-flag"></i>
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="container-xxl py-4">
        <!-- Audio Panel -->
        <div class="card mb-4 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h5 class="card-title fw-semibold">
                  Audio Section
                </h5>
                <p class="text-muted">
                  Listen carefully and answer the questions below.
                </p>
              </div>

              <div class="d-flex align-items-center gap-3">
                <button
                    @click="toggleAudio"
                    :disabled="!audioUrl || audioLoading"
                    class="btn btn-primary d-flex align-items-center gap-2"
                >
                  <i :class="isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'"></i>
                  {{ isPlaying ? 'Pause' : 'Play' }}
                </button>

                <div v-if="audioDuration > 0" class="text-muted small">
                  {{ formatTime(audioCurrentTime) }} / {{ formatTime(audioDuration) }}
                </div>
              </div>
            </div>

            <!-- Audio Progress Bar -->
            <div v-if="audioDuration > 0" class="mt-3">
              <div class="progress" style="height: 8px;">
                <div
                    class="progress-bar"
                    :style="{ width: `${(audioCurrentTime / audioDuration) * 100}%` }"
                ></div>
              </div>
            </div>

            <!-- Question Timestamps -->
            <div v-if="questions.length" class="mt-3 d-flex gap-2 flex-wrap">
              <button
                  v-for="(question, index) in questions"
                  :key="question.questionId"
                  @click="jumpToTimestamp(question.timestamp)"
                  class="btn btn-sm"
                  :class="userAnswers[question.questionId] ? 'btn-success' : 'btn-outline-primary'"
              >
                Q{{ index + 1 }} ({{ formatTime(question.timestamp) }})
              </button>
            </div>

            <!-- Audio Element -->
            <audio
                ref="audioRef"
                :src="audioUrl"
                @loadstart="audioLoading = true"
                @canplay="audioLoading = false"
                @timeupdate="handleAudioTimeUpdate"
                @loadedmetadata="handleAudioLoadedMetadata"
                @ended="handleAudioEnded"
                preload="metadata"
            ></audio>
          </div>
        </div>

        <!-- Questions Panel -->
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="mb-4">
              <h4 class="fw-semibold">Questions</h4>
              <p class="text-muted">
                Answer all questions based on what you hear in the audio.
              </p>
            </div>

            <!-- Questions -->
            <div class="row g-4" v-if="questions.length">
              <div
                  v-for="(question, qIndex) in sortedQuestions"
                  :key="question.questionId"
                  class="col-12"
              >
                <div
                    :class="[
                    'card h-100',
                    userAnswers[question.questionId] ? 'border-success bg-success bg-opacity-10' : 'border-secondary'
                  ]"
                >
                  <div class="card-body">
                    <div class="d-flex gap-3">
                      <!-- Question Number -->
                      <div class="flex-shrink-0">
                        <div
                            class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-semibold"
                            style="width: 32px; height: 32px;"
                        >
                          {{ qIndex + 1 }}
                        </div>
                      </div>

                      <!-- Question Content -->
                      <div class="flex-grow-1">
                        <div class="fw-medium mb-3">{{ question.content }}</div>

                        <!-- Points and Timestamp Info -->
                        <div class="d-flex gap-3 mb-3 text-muted small">
                          <span v-if="question.points">
                            <i class="bi bi-star"></i> {{ question.points }} points
                          </span>
                          <span v-if="question.timestamp !== undefined">
                            <i class="bi bi-clock"></i> {{ formatTime(question.timestamp) }}
                          </span>
                        </div>

                        <!-- Multiple Choice (type 1) -->
                        <div v-if="question.type === 1 && question.options?.length" class="d-flex flex-column gap-2">
                          <div
                              v-for="(option, optionIndex) in question.options"
                              :key="optionIndex"
                              class="form-check p-2 rounded hover-bg-light"
                              style="cursor: pointer;"
                          >
                            <input
                                :id="`question_${question.questionId}_${optionIndex}`"
                                :name="`question_${question.questionId}`"
                                :value="option"
                                :checked="userAnswers[question.questionId]?.answer === option"
                                @change="handleAnswerChange(question.questionId, question.type, $event.target.value)"
                                type="radio"
                                class="form-check-input"
                            />
                            <label
                                :for="`question_${question.questionId}_${optionIndex}`"
                                class="form-check-label d-flex align-items-center gap-2 w-100"
                                style="cursor: pointer;"
                            >
                              <span class="fw-medium text-muted">{{ String.fromCharCode(65 + optionIndex) }}.</span>
                              <span>{{ option }}</span>
                            </label>
                          </div>
                        </div>

                        <!-- Short Answer (type 0) -->
                        <div v-else>
                          <textarea
                              rows="3"
                              placeholder="Type your answer here..."
                              :value="userAnswers[question.questionId]?.answer || ''"
                              @input="handleAnswerChange(question.questionId, question.type, $event.target.value)"
                              class="form-control"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Questions Message -->
            <div v-else class="text-center py-5">
              <i class="bi bi-question-circle text-muted" style="font-size: 3rem;"></i>
              <h5 class="text-muted mt-3">No questions available</h5>
            </div>

            <!-- Progress Section -->
            <div class="mt-4 pt-3 border-top text-center">
              <div class="mb-2">
                <span class="badge bg-primary">
                  {{ answeredCount }} / {{ totalQuestions }} answered
                </span>
              </div>
              <div class="progress mx-auto" style="width: 200px; height: 8px;">
                <div
                    class="progress-bar"
                    :style="{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Confirmation Modal -->
    <div
        v-if="showSubmitConfirmation"
        class="modal show d-block"
        tabindex="-1"
        style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Submit Test</h5>
            <button
                type="button"
                class="btn-close"
                @click="showSubmitConfirmation = false"
            ></button>
          </div>

          <div class="modal-body">
            <div class="row g-3 mb-3">
              <div class="col-6">
                <strong>Questions Answered:</strong>
              </div>
              <div class="col-6 text-end">
                {{ answeredCount }} / {{ totalQuestions }}
              </div>

              <div class="col-6">
                <strong>Time Taken:</strong>
              </div>
              <div class="col-6 text-end">
                {{ formatTime(totalTime - timeRemaining) }}
              </div>

              <div class="col-6">
                <strong>Unanswered Questions:</strong>
              </div>
              <div class="col-6 text-end">
                {{ totalQuestions - answeredCount }}
              </div>
            </div>

            <div
                v-if="answeredCount < totalQuestions"
                class="alert alert-warning d-flex align-items-center gap-2"
            >
              <i class="bi bi-exclamation-triangle"></i>
              <span>
                You have {{ totalQuestions - answeredCount }} unanswered questions.
                Are you sure you want to submit?
              </span>
            </div>
          </div>

          <div class="modal-footer">
            <button
                type="button"
                class="btn btn-secondary"
                @click="showSubmitConfirmation = false"
            >
              Continue Test
            </button>
            <button
                type="button"
                class="btn btn-danger d-flex align-items-center gap-2"
                :disabled="submitting"
                @click="handleSubmitTest"
            >
              <div v-if="submitting" class="spinner-border spinner-border-sm"></div>
              Submit Test
            </button>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getListeningTestById,
  startTestAttempt,
  submitAndCompleteTestAttempt
} from '@/api/listening';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'ListeningTest',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const testData = ref(null);
    const questions = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const userAnswers = ref({});
    const timeRemaining = ref(0);
    const totalTime = ref(0);
    const showSubmitConfirmation = ref(false);
    const submitting = ref(false);
    const attemptId = ref(null);
    const notifications = ref([]);

    const currentTestId = route.params.id;
    const userId = authStore.userId;
    const token = authStore.token;

    const audioRef = ref(null);
    const isPlaying = ref(false);
    const audioLoading = ref(false);
    const audioCurrentTime = ref(0);
    const audioDuration = ref(0);

    let timerInterval = null;

    const audioUrl = computed(() => testData.value?.audioUrl || '');
    const sortedQuestions = computed(() => {
      if (!questions.value || questions.value.length === 0) return [];
      return [...questions.value].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    const answeredCount = computed(() => {
      return Object.keys(userAnswers.value).filter(key => {
        const answer = userAnswers.value[key];
        return answer.answer && answer.answer.trim() !== '';
      }).length;
    });

    const totalQuestions = computed(() => questions.value?.length || 0);

    const formatTime = (seconds) => {
      if (!seconds || seconds < 0) return '00:00';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const addNotification = (message, type = 'success') => {
      const id = Date.now();
      notifications.value.push({ id, message, type });
      setTimeout(() => removeNotification(id), 5000);
    };

    const removeNotification = (id) => {
      notifications.value = notifications.value.filter(n => n.id !== id);
    };

    const startTimer = () => {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timeRemaining.value--;
        if (timeRemaining.value <= 0) {
          handleSubmitTest();
        }
      }, 1000);
    };

    const initializeTest = async () => {
      try {
        loading.value = true;
        error.value = null;

        if (!currentTestId) throw new Error('Test ID is required');
        if (!userId || !token) throw new Error('User authentication required');

        const testResponse = await getListeningTestById(currentTestId);
        const testWithQuestions = testResponse.data;

        testData.value = {
          id: testWithQuestions.id,
          title: testWithQuestions.title,
          description: testWithQuestions.description,
          audioUrl: testWithQuestions.audioUrl,
          timeLimit: testWithQuestions.timeLimit,
          createdAt: testWithQuestions.createdAt,
          updatedAt: testWithQuestions.updatedAt
        };

        questions.value = testWithQuestions.questions || [];

        if (questions.value.length === 0) {
          throw new Error('This test has no questions');
        }

        const timeLimit = testData.value.timeLimit ? testData.value.timeLimit * 60 : 30 * 60;
        totalTime.value = timeLimit;
        timeRemaining.value = timeLimit;

        const attemptResponse = await startTestAttempt(userId, currentTestId);
        attemptId.value = attemptResponse.data.id;

        startTimer();
        addNotification('Test loaded successfully', 'success');
      } catch (err) {
        console.error('Failed to initialize test:', err);
        error.value = err.response?.data?.error || err.message || 'Failed to load test';
      } finally {
        loading.value = false;
      }
    };

    const toggleAudio = async () => {
      if (!audioRef.value || !audioUrl.value) {
        addNotification('Audio not available', 'error');
        return;
      }

      try {
        audioLoading.value = true;
        if (isPlaying.value) {
          audioRef.value.pause();
          isPlaying.value = false;
        } else {
          await audioRef.value.play();
          isPlaying.value = true;
        }
      } catch (err) {
        addNotification('Failed to play audio. Please check the audio source.', 'error');
        console.error('Audio play error:', err);
        isPlaying.value = false;
      } finally {
        audioLoading.value = false;
      }
    };

    const jumpToTimestamp = async (timestamp) => {
      if (!audioRef.value || timestamp === undefined || timestamp < 0) return;
      try {
        audioRef.value.currentTime = timestamp;
        if (!isPlaying.value) {
          await audioRef.value.play();
          isPlaying.value = true;
        }
      } catch (err) {
        console.error('Failed to jump to timestamp:', err);
        addNotification('Failed to jump to timestamp', 'error');
      }
    };

    const handleAudioTimeUpdate = () => {
      if (audioRef.value) {
        audioCurrentTime.value = Math.floor(audioRef.value.currentTime);
      }
    };

    const handleAudioLoadedMetadata = () => {
      if (audioRef.value) {
        audioDuration.value = Math.floor(audioRef.value.duration || 0);
      }
    };

    const handleAudioEnded = () => {
      isPlaying.value = false;
    };

    const handleAnswerChange = (questionId, questionType, value) => {
      const question = questions.value.find(q => q.questionId === questionId);
      if (!question) {
        addNotification('Invalid question', 'error');
        return;
      }

      let answerValue = value || '';

      if (questionType === 'MultipleChoice' && question.options) {
        const index = parseInt(value, 10);
        if (!isNaN(index) && index >= 0 && index < question.options.length) {
          answerValue = question.options[index];
        } else if (value && question.options.includes(value)) {
          answerValue = value;
        } else {
          addNotification('Please select a valid option', 'warning');
          return;
        }
      }


      userAnswers.value = {
        ...userAnswers.value,
        [questionId]: { answer: answerValue }
      };
    };

    const handleSubmitTest = async () => {
      if (!attemptId.value) {
        addNotification('No active test attempt', 'error');
        return;
      }

      try {
        submitting.value = true;

        if (!token) {
          addNotification('Authentication required', 'error');
          return;
        }

        const userAnswersArray = sortedQuestions.value.map(question => ({
          questionId: question.questionId,
          answer: userAnswers.value[question.questionId]?.answer || ''
        }));

        console.log('Submitting answers:', userAnswersArray);

        const response = await submitAndCompleteTestAttempt(attemptId.value, userAnswersArray);

        if (timerInterval) clearInterval(timerInterval);

        const timeTaken = totalTime.value - timeRemaining.value;
        addNotification(`Test submitted successfully! Time taken: ${formatTime(timeTaken)}`, 'success');
        showSubmitConfirmation.value = false;

        if (audioRef.value && isPlaying.value) {
          audioRef.value.pause();
          isPlaying.value = false;
        }

        setTimeout(() => {
          if (response.data?.id) {
            router.push({
              name: 'TestListeningResult',
              params: { id: response.data.id }
            });
          } else {
            addNotification('Failed to navigate to results', 'error');
          }
        }, 2000);
      } catch (error) {
        console.error('Failed to submit test:', error);
        addNotification(error.response?.data?.error || 'Failed to submit test', 'error');
      } finally {
        submitting.value = false;
      }
    };

    onMounted(() => {
      initializeTest();
    });

    onUnmounted(() => {
      if (timerInterval) clearInterval(timerInterval);
      if (audioRef.value && isPlaying.value) {
        audioRef.value.pause();
      }
    });

    return {
      testData,
      questions,
      loading,
      error,
      userAnswers,
      timeRemaining,
      totalTime,
      showSubmitConfirmation,
      submitting,
      attemptId,
      audioRef,
      isPlaying,
      audioLoading,
      audioCurrentTime,
      audioDuration,
      notifications,
      audioUrl,
      sortedQuestions,
      answeredCount,
      totalQuestions,
      formatTime,
      toggleAudio,
      jumpToTimestamp,
      handleAudioTimeUpdate,
      handleAudioLoadedMetadata,
      handleAudioEnded,
      handleAnswerChange,
      handleSubmitTest,
      removeNotification,
      initializeTest
    };
  }
};
</script>

<style scoped>
.hover-bg-light:hover {
  background-color: var(--bs-light) !important;
}

.progress {
  transition: all 0.3s ease;
}

.progress-bar {
  transition: width 0.3s ease;
}

.card {
  transition: all 0.2s ease;
}

.btn {
  transition: all 0.2s ease;
}

.form-check:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.modal.show {
  display: block !important;
}

audio {
  display: none;
}

.bg-danger.text-white {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.toast {
  min-width: 300px;
}

.border-success {
  border-color: #198754 !important;
}

.bg-success.bg-opacity-10 {
  background-color: rgba(25, 135, 84, 0.1) !important;
}
</style>