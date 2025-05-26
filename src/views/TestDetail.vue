<template>
  <div class="dashboard-container d-flex flex-column">
    <!-- Header -->
    <header class="header card shadow mb-4">
      <div class="card-body d-flex justify-content-between align-items-center">
        <h1 class="fs-4 fw-bold mb-0">{{ test?.title || 'Loading...' }}</h1>
        <div class="d-flex align-items-center gap-3">
          <div class="timer fs-6">
            Thời gian còn lại: {{ formatTime(timeLeft) }}
            <span class="ms-3">Answered: {{ answeredCount }}/{{ totalQuestions }}</span>
          </div>
          <button
              class="btn btn-primary px-4 py-2"
              @click="submitTest"
              :disabled="submitting"
          >
            {{ submitting ? 'Đang nộp...' : 'Nộp Bài' }}
          </button>
        </div>
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
          <div v-else-if="!test" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading test...</p>
          </div>

          <!-- Test Content -->
          <div v-else>
            <!-- Tabs -->
            <ul class="nav nav-tabs mb-4" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                    class="nav-link"
                    :class="{ active: activeTab === 'listening' }"
                    @click="activeTab = 'listening'"
                    role="tab"
                    aria-selected="activeTab === 'listening'"
                    aria-controls="listening-panel"
                >
                  Listening
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                    class="nav-link"
                    :class="{ active: activeTab === 'reading' }"
                    @click="activeTab = 'reading'"
                    role="tab"
                    aria-selected="activeTab === 'reading'"
                    aria-controls="reading-panel"
                >
                  Reading
                </button>
              </li>
            </ul>

            <!-- Listening Section -->
            <div
                v-if="activeTab === 'listening' && listeningSection"
                id="listening-panel"
                role="tabpanel"
                aria-labelledby="listening-tab"
            >
              <div v-for="(subSection, index) in listeningSection.subSections" :key="index" class="mb-4">
                <h2 class="fs-5 fw-semibold">{{ subSection.title }}</h2>

                <!-- Audio Player -->
                <div class="audio-player d-flex align-items-center gap-3 mb-4">
                  <audio
                      ref="audioElement"
                      :src="subSection.content"
                      @loadedmetadata="onAudioLoaded"
                      @timeupdate="updateAudioProgress"
                      @ended="onAudioEnded"
                      @error="onAudioError"
                      preload="metadata"
                  ></audio>

                  <button
                      class="btn btn-primary btn-lg"
                      @click="toggleAudio"
                      :disabled="audioLoading"
                      :aria-label="isPlaying ? 'Pause audio' : 'Play audio'"
                  >
                    <i v-if="audioLoading" class="fas fa-spinner fa-spin"></i>
                    <i v-else :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
                  </button>

                  <input
                      type="range"
                      class="form-range flex-grow-1"
                      v-model="audioProgress"
                      @input="seekAudio"
                      min="0"
                      max="100"
                      :disabled="!audioDuration || audioLoading"
                      aria-label="Audio seek bar"
                  />

                  <span class="fs-6 time-display">
                    {{ audioCurrentTime }} / {{ audioDuration }}
                  </span>
                </div>

                <!-- Questions -->
                <div
                    v-for="(question, qIndex) in subSection.questions"
                    :key="`listening-${index}-${qIndex}`"
                    class="question mb-4"
                    :class="{ answered: !!answers[question.content] }"
                >
                  <p class="fs-6 fw-medium mb-3">
                    Question {{ getQuestionNumber(subSection, qIndex) }}: {{ question.content }}
                  </p>

                  <!-- Multiple Choice -->
                  <div v-if="question.type === 1" class="ms-3">
                    <div
                        v-for="(option, optIndex) in question.options"
                        :key="`${question.content}-${optIndex}`"
                        class="form-check mb-2"
                    >
                      <input
                          class="form-check-input"
                          type="radio"
                          :name="`question-${question.content}`"
                          :value="extractOptionValue(option)"
                          v-model="answers[question.content]"
                          :id="`${question.content}-${optIndex}`"
                      />
                      <label class="form-check-label" :for="`${question.content}-${optIndex}`">
                        {{ option }}
                      </label>
                    </div>
                  </div>

                  <!-- Text Input -->
                  <div v-else class="ms-3">
                    <input
                        type="text"
                        class="form-control"
                        v-model="answers[question.content]"
                        placeholder="Your answer..."
                        :aria-label="`Answer for question ${question.content}`"
                        maxlength="200"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Reading Section -->
            <div
                v-if="activeTab === 'reading' && readingSection"
                id="reading-panel"
                role="tabpanel"
                aria-labelledby="reading-tab"
            >
              <div v-for="(subSection, index) in readingSection.subSections" :key="index" class="mb-4">
                <h2 class="fs-5 fw-semibold mb-3">{{ subSection.title }}</h2>
                <div class="row">
                  <!-- Left: Passage -->
                  <div class="col-md-6 passage-container">
                    <div class="passage-wrapper">
                      <div class="passage" v-html="formatPassage(subSection.content)"></div>
                    </div>
                  </div>

                  <!-- Right: Questions -->
                  <div class="col-md-6 questions-container">
                    <div
                        v-for="(question, qIndex) in subSection.questions"
                        :key="`reading-${index}-${qIndex}`"
                        class="question mb-4"
                        :class="{ answered: !!answers[question.content] }"
                    >
                      <p class="fs-6 fw-medium mb-3">
                        Question {{ getQuestionNumber(subSection, qIndex) }}: {{ question.content }}
                      </p>

                      <!-- Multiple Choice -->
                      <div v-if="question.type === 1" class="ms-3">
                        <div
                            v-for="(option, optIndex) in question.options"
                            :key="`${question.content}-${optIndex}`"
                            class="form-check mb-2"
                        >
                          <input
                              class="form-check-input"
                              type="radio"
                              :name="`question-${question.content}`"
                              :value="extractOptionValue(option)"
                              v-model="answers[question.content]"
                              :id="`${question.content}-${optIndex}`"
                          />
                          <label class="form-check-label" :for="`${question.content}-${optIndex}`">
                            {{ option }}
                          </label>
                        </div>
                      </div>

                      <!-- Text Input -->
                      <div v-else class="ms-3">
                        <input
                            type="text"
                            class="form-control"
                            v-model="answers[question.content]"
                            placeholder="Your answer..."
                            :aria-label="`Answer for question ${question.content}`"
                            maxlength="200"
                        />
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

    <!-- Confirmation Modal -->
    <div
        v-if="showConfirmModal"
        class="modal d-block"
        tabindex="-1"
        style="background-color: rgba(0,0,0,0.5);"
        @click.self="showConfirmModal = false"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận nộp bài</h5>
            <button
                type="button"
                class="btn-close"
                @click="showConfirmModal = false"
                aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn nộp bài không?</p>
            <p v-if="unansweredCount > 0" class="text-warning">
              <i class="fas fa-exclamation-triangle"></i>
              Bạn còn {{ unansweredCount }} câu chưa trả lời.
            </p>
            <p class="text-muted">Thời gian còn lại: {{ formatTime(timeLeft) }}</p>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showConfirmModal = false">
              Hủy
            </button>
            <button type="button" class="btn btn-primary" @click="confirmSubmit">
              Nộp bài
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getMockTestById, submitMockTest } from '../api/test';

// Constants
const TEST_DURATION = 90 * 60; // 90 minutes in seconds
const AUDIO_UPDATE_THROTTLE = 100; // ms

export default {
  name: 'TestComponent',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const testId = route.params.id;

    // Kiểm tra testId hợp lệ
    if (typeof testId !== 'string' || !testId) {
      console.error('Invalid testId:', testId);
    }

    // Reactive data
    const test = ref(null);
    const error = ref('');
    const activeTab = ref('listening');
    const answers = ref({});
    const timeLeft = ref(TEST_DURATION);
    const submitting = ref(false);
    const showConfirmModal = ref(false);

    // Audio player state
    const audioElement = ref(null);
    const isPlaying = ref(false);
    const audioProgress = ref(0);
    const audioCurrentTime = ref('00:00');
    const audioDuration = ref('00:00');
    const audioLoading = ref(false);

    // Timer
    let timerInterval = null;

    // Computed properties
    const listeningSection = computed(() =>
        test.value?.sections.find(section => section.skill === 'Listening')
    );

    const readingSection = computed(() =>
        test.value?.sections.find(section => section.skill === 'Reading')
    );

    const totalQuestions = computed(() => {
      if (!test.value) return 0;
      return test.value.sections.reduce((total, section) => {
        return total + section.subSections.reduce((subTotal, subSection) => {
          return subTotal + subSection.questions.length;
        }, 0);
      }, 0);
    });

    const answeredCount = computed(() => {
      return Object.values(answers.value).filter(
          answer => answer !== null && answer !== undefined && answer !== ''
      ).length;
    });

    const unansweredCount = computed(() => {
      return totalQuestions.value - answeredCount.value;
    });

    // Helper functions
    const formatTime = (seconds) => {
      if (!seconds || seconds < 0) return '00:00';
      const min = Math.floor(seconds / 60);
      const sec = seconds % 60;
      return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const formatPassage = (content) => {
      if (!content) return '';
      return content.replace(/\n/g, '<br>').replace(/\t/g, '    ');
    };

    const extractOptionValue = (option) => {
      if (!option) return '';
      const match = option.match(/^[A-D]\.\s*(.+)$/);
      return match ? match[1].trim() : option.trim();
    };

    const getQuestionNumber = (subSection, qIndex) => {
      if (!test.value) return qIndex + 1;

      let questionNumber = 1;
      for (const section of test.value.sections) {
        for (const subSec of section.subSections) {
          if (subSec === subSection) {
            return questionNumber + qIndex;
          }
          questionNumber += subSec.questions.length;
        }
      }
      return qIndex + 1;
    };

    // API functions
    const fetchTest = async () => {
      try {
        error.value = '';
        const response = await getMockTestById(testId);
        test.value = response.data;
        console.log('Fetched test:', test.value);

        // Initialize answers object
        test.value.sections.forEach(section => {
          section.subSections.forEach(subSection => {
            subSection.questions.forEach(question => {
              if (!(question.content in answers.value)) {
                answers.value[question.content] = '';
              }
            });
          });
        });
      } catch (err) {
        console.error('Failed to fetch test:', err);
        error.value = err.response?.data?.message || 'Không thể tải bài thi. Vui lòng thử lại.';
      }
    };

    // Timer functions
    const startTimer = () => {
      if (timerInterval) clearInterval(timerInterval);

      timerInterval = setInterval(() => {
        timeLeft.value--;
        if (timeLeft.value <= 0) {
          clearInterval(timerInterval);
          timeLeft.value = 0;
          autoSubmit();
        }
      }, 1000);
    };

    const stopTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    };

    // Audio functions
    const toggleAudio = async () => {
      if (!audioElement.value || audioLoading.value) return;

      try {
        audioLoading.value = true;

        if (isPlaying.value) {
          audioElement.value.pause();
          isPlaying.value = false;
        } else {
          await audioElement.value.play();
          isPlaying.value = true;
        }
      } catch (err) {
        console.error('Audio playback error:', err);
        error.value = 'Không thể phát audio. Vui lòng thử lại.';
        isPlaying.value = false;
      } finally {
        audioLoading.value = false;
      }
    };

    const seekAudio = () => {
      if (!audioElement.value || !audioElement.value.duration) return;

      try {
        const newTime = (audioProgress.value / 100) * audioElement.value.duration;
        audioElement.value.currentTime = newTime;
      } catch (err) {
        console.error('Audio seek error:', err);
      }
    };

    const updateAudioProgress = () => {
      if (!audioElement.value) return;

      const current = audioElement.value.currentTime || 0;
      const duration = audioElement.value.duration || 0;

      if (duration > 0) {
        audioProgress.value = (current / duration) * 100;
      }

      audioCurrentTime.value = formatTime(Math.floor(current));
      audioDuration.value = formatTime(Math.floor(duration));
    };

    const onAudioLoaded = () => {
      updateAudioProgress();
      audioLoading.value = false;
    };

    const onAudioEnded = () => {
      isPlaying.value = false;
      audioProgress.value = 100;
    };

    const onAudioError = (event) => {
      console.error('Audio loading error:', event);
      error.value = 'Không thể tải audio. Vui lòng kiểm tra kết nối mạng.';
      audioLoading.value = false;
      isPlaying.value = false;
    };

    // Submit functions
    const submitTest = () => {
      if (unansweredCount.value > 0) {
        showConfirmModal.value = true;
      } else {
        confirmSubmit();
      }
    };

    const confirmSubmit = async () => {
      if (submitting.value) return;

      showConfirmModal.value = false;
      submitting.value = true;
      stopTimer();

      const submitData = {
        mockTestId: testId,
        answers: Object.entries(answers.value)
            .filter(([_, answer]) => answer !== null && answer !== undefined && answer !== '')
            .map(([questionContent, answer]) => {
              // Tìm questionId từ test.value
              const question = test.value.sections
                  .flatMap(section => section.subSections)
                  .flatMap(subSection => subSection.questions)
                  .find(q => q.content === questionContent);
              return {
                questionId: question?.id || questionContent,
                answer: answer.toString().trim(),
              };
            }),
        timeTaken: Math.min(TEST_DURATION - timeLeft.value, 2147483647),
      };

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
        }

        console.log('Submitting with:', {
          token,
          testId,
          submitData: JSON.stringify(submitData, null, 2),
        });

        const response = await submitMockTest(token, testId, submitData);

        // Debug: Log toàn bộ response để kiểm tra structure
        console.log('Full API response:', response);
        console.log('Response data:', response.data);

        // Kiểm tra các field có thể chứa resultId
        const resultId = response.data?.resultId ||
            response.data?.id ||
            response.data?._id ||
            response.data?.result?.id ||
            response.data?.result?._id;

        console.log('Extracted resultId:', resultId);

        // Validate resultId trước khi sử dụng
        if (!resultId) {
          throw new Error('Không nhận được ID kết quả từ server');
        }

        // Validate ObjectId format (24 ký tự hex)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(resultId)) {
          console.error('Invalid ObjectId format:', resultId);
          throw new Error('ID kết quả không hợp lệ');
        }

        // Lưu vào localStorage
        localStorage.setItem('lastTestResult', JSON.stringify({
          resultId: resultId,
          testId,
          timestamp: Date.now(),
        }));

        // Navigate đến trang result
        router.push(`/result/${resultId}`);

      } catch (err) {
        console.error('Submit error:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
          fullError: err
        });

        error.value = err.response?.data?.message ||
            err.message ||
            `Lỗi nộp bài (mã ${err.response?.status || 'không xác định'}): Vui lòng thử lại.`;

        submitting.value = false;
        startTimer();
      }
    };

    const autoSubmit = () => {
      if (!submitting.value) {
        error.value = 'Hết thời gian! Bài thi sẽ được nộp tự động.';
        setTimeout(() => {
          confirmSubmit();
        }, 2000);
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      console.log('testId in onMounted:', testId);
      await fetchTest();
      startTimer();

      // Setup audio event listeners after DOM is ready
      await nextTick();
      if (audioElement.value && typeof audioElement.value.addEventListener === 'function') {
        audioElement.value.addEventListener('loadedmetadata', onAudioLoaded);
        audioElement.value.addEventListener('timeupdate', updateAudioProgress);
        audioElement.value.addEventListener('ended', onAudioEnded);
        audioElement.value.addEventListener('error', onAudioError);
      } else {
        console.error('audioElement is not valid:', audioElement.value);
      }

      // Auto-save answers to localStorage
      const saveAnswers = () => {
        localStorage.setItem(`test-${testId}-answers`, JSON.stringify(answers.value));
      };

      // Load saved answers
      const savedAnswers = localStorage.getItem(`test-${testId}-answers`);
      if (savedAnswers) {
        try {
          const parsed = JSON.parse(savedAnswers);
          answers.value = { ...answers.value, ...parsed };
        } catch (err) {
          console.warn('Failed to load saved answers:', err);
        }
      }

      // Watch for answer changes and auto-save
      watch(answers, saveAnswers, { deep: true });

      // Prevent accidental page leave
      window.addEventListener('beforeunload', handleBeforeUnload);
    });

    onUnmounted(() => {
      stopTimer();

      if (audioElement.value && typeof audioElement.value.removeEventListener === 'function') {
        audioElement.value.pause();
        audioElement.value.removeEventListener('loadedmetadata', onAudioLoaded);
        audioElement.value.removeEventListener('timeupdate', updateAudioProgress);
        audioElement.value.removeEventListener('ended', onAudioEnded);
        audioElement.value.removeEventListener('error', onAudioError);
      }

      // Remove beforeunload listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
    });

    // Prevent accidental page leave
    const handleBeforeUnload = (event) => {
      if (!submitting.value && answeredCount.value > 0) {
        event.preventDefault();
        event.returnValue = 'Bạn có chắc chắn muốn rời khỏi trang? Dữ liệu có thể bị mất.';
      }
    };

    return {
      // Data
      test,
      error,
      activeTab,
      answers,
      timeLeft,
      submitting,
      showConfirmModal,

      // Audio
      audioElement,
      isPlaying,
      audioProgress,
      audioCurrentTime,
      audioDuration,
      audioLoading,

      // Computed
      listeningSection,
      readingSection,
      totalQuestions,
      answeredCount,
      unansweredCount,

      // Methods
      formatTime,
      formatPassage,
      extractOptionValue,
      getQuestionNumber,
      toggleAudio,
      seekAudio,
      submitTest,
      confirmSubmit,
    };
  },
};
</script>

<style scoped>
.dashboard-container {
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

.timer {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #495057;
}

.main-content {
  padding: 16px;
}

.card {
  border: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.nav-tabs {
  border-bottom: 2px solid #e9ecef;
}

.nav-tabs .nav-link {
  color: #495057;
  font-weight: 500;
  border: none;
  border-radius: 8px 8px 0 0;
  padding: 12px 24px;
  margin-right: 4px;
  transition: all 0.3s ease;
}

.nav-tabs .nav-link:hover {
  background-color: #f8f9fa;
  border-color: transparent;
}

.nav-tabs .nav-link.active {
  background-color: #0056d2;
  color: white;
  border-color: #0056d2;
  box-shadow: 0 2px 8px rgba(0, 86, 210, 0.3);
}

.audio-player {
  max-width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
}

.audio-player .btn-lg {
  width: 10px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 86, 210, 0.3);
  transition: all 0.3s ease;
}

.audio-player .btn-lg:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 86, 210, 0.4);
}

.audio-player .btn-lg:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-range {
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
}

.form-range::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
  background-color: #0056d2;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 86, 210, 0.4);
  transition: all 0.2s ease;
}

.form-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.time-display {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
  min-width: 100px;
  text-align: center;
}

.passage-container {
  max-height: 70vh;
  overflow-y: auto;
}

.passage-wrapper {
  background-color: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.passage {
  line-height: 1.8;
  font-size: 16px;
  color: #212529;
}

.questions-container {
  max-height: 70vh;
  overflow-y: auto;
  padding-left: 20px;
  position: sticky;
  top: 16px;
}

.question {
  background-color: #ffffff;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.question:hover {
  border-color: #0056d2;
  box-shadow: 0 4px 12px rgba(0, 86, 210, 0.1);
}

.question.answered {
  background: linear-gradient(135deg, #e8f4fd 0%, #f0f8ff 100%);
  border-color: #0056d2;
  box-shadow: 0 2px 8px rgba(0, 86, 210, 0.2);
  animation: answeredPulse 0.6s ease-in-out;
}

.question.answered::before {
  content: '✓';
  position: absolute;
  top: 10px;
  right: 15px;
  color: #28a745;
  font-weight: bold;
  font-size: 18px;
}

.form-check {
  padding: 8px 0;
  margin-bottom: 8px;
}

.form-check-input {
  margin-top: 6px;
  width: 18px;
  height: 18px;
}

.form-check-input:checked {
  background-color: #0056d2;
  border-color: #0056d2;
}

.form-check-label {
  font-size: 15px;
  line-height: 1.5;
  padding-left: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-check-input:checked + .form-check-label {
  color: #0056d2;
  font-weight: 500;
}

.form-control {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #0056d2;
  box-shadow: 0 0 0 0.2rem rgba(0, 86, 210, 0.25);
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

.btn-primary:disabled {
  opacity: 0.6;
  transform: none;
}

.alert {
  border-radius: 8px;
  border: none;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.modal-content {
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  padding: 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
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

  .timer {
    font-size: 0.875rem;
  }

  .timer span {
    display: block;
    margin-top: 4px;
    margin-left: 0 !important;
  }

  .main-content {
    padding: 8px;
  }

  .nav-tabs {
    flex-direction: column;
    border: none;
  }

  .nav-tabs .nav-link {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    margin: 2px 0;
    text-align: center;
  }

  .nav-tabs .nav-link.active {
    border: 2px solid #0056d2;
  }

  .audio-player {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .audio-player .btn-lg {
    width: 50px;
    height: 50px;
    align-self: center;
  }

  .time-display {
    font-size: 0.875rem;
    min-width: auto;
  }

  .passage-container,
  .questions-container {
    max-height: none;
    padding-left: 0;
  }

  .questions-container {
    margin-top: 20px;
    position: static;
  }

  .question {
    padding: 16px;
    margin-bottom: 16px;
  }

  .question p {
    font-size: 0.875rem;
  }

  .form-check {
    margin-bottom: 6px;
  }

  .form-check-label {
    font-size: 0.875rem;
  }

  .modal-dialog {
    margin: 1rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .header .card-body {
    padding: 0.75rem;
  }

  .header h1 {
    font-size: 1.1rem;
  }

  .timer {
    font-size: 0.75rem;
  }

  .audio-player .btn-lg {
    width: 45px;
    height: 45px;
    font-size: 1rem;
  }

  .question {
    padding: 12px;
  }

  .form-control {
    padding: 8px 12px;
    font-size: 14px;
  }

  .btn-primary {
    padding: 10px 20px;
    font-size: 14px;
  }
}

/* Print styles */
@media print {
  .dashboard-container {
    background: white;
    padding: 0;
  }

  .header,
  .audio-player,
  .btn,
  .modal {
    display: none !important;
  }

  .card {
    box-shadow: none;
    border: 1px solid #000;
  }

  .question {
    break-inside: avoid;
    border: 1px solid #000;
    margin-bottom: 20px;
  }

  .passage {
    font-size: 12pt;
    line-height: 1.4;
  }
}

/* Custom scrollbar */
.passage-container::-webkit-scrollbar,
.questions-container::-webkit-scrollbar {
  width: 8px;
}

.passage-container::-webkit-scrollbar-track,
.questions-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.passage-container::-webkit-scrollbar-thumb,
.questions-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.passage-container::-webkit-scrollbar-thumb:hover,
.questions-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Accessibility improvements */
.form-check-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 86, 210, 0.25);
}

.btn:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 86, 210, 0.25);
}

/* Animation for answered questions */
@keyframes answeredPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

/* Loading animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fa-spinner {
  animation: spin 1s linear infinite;
}

/* Smooth transitions */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
</style>