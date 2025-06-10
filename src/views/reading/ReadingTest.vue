<template>
  <div class="test-container">
    <!-- Enhanced Header with Progress -->
    <header class="test-header">
      <div class="header-content">
        <div class="test-info">
          <h1 class="test-title">{{ test?.title || 'Loading...' }}</h1>
          <div class="progress-indicators">
            <div class="progress-bar-container">
              <div class="progress-bar">
                <div
                    class="progress-fill"
                    :style="{ width: `${(answeredCount / totalQuestions) * 100}%` }"
                ></div>
              </div>
              <span class="progress-text">{{ answeredCount }}/{{ totalQuestions }} completed</span>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <div class="timer-widget">
            <div class="timer-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="timer-content">
              <div class="time-remaining">{{ formatTime(timeLeft) }}</div>
              <div class="timer-label">Time Left</div>
            </div>
          </div>

          <button
              class="submit-btn"
              @click="submitTest"
              :disabled="submitting"
              :class="{ 'submitting': submitting }"
          >
            <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-paper-plane"></i>
            {{ submitting ? 'Submitting...' : 'Submit Test' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Enhanced Main Content -->
    <main class="test-main">
      <div class="test-content-card">
        <!-- Error Alert with better styling -->
        <div v-if="error" class="alert alert-error">
          <div class="alert-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="alert-content">
            <div class="alert-title">Error</div>
            <div class="alert-message">{{ error }}</div>
          </div>
          <button class="alert-close" @click="error = ''" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Enhanced Loading State -->
        <div v-else-if="!test" class="loading-container">
          <div class="loading-spinner"></div>
          <h3 class="loading-title">Loading Your Test</h3>
          <p class="loading-subtitle">Preparing questions and audio content...</p>
        </div>

        <!-- Test Content -->
        <div v-else class="test-sections">
          <!-- Modern Tab Navigation -->
          <nav class="section-tabs" role="tablist">
            <button
                class="tab-button"
                :class="{ active: activeTab === 'listening' }"
                @click="activeTab = 'listening'"
                role="tab"
            >
              <div class="tab-icon">
                <i class="fas fa-headphones"></i>
              </div>
              <div class="tab-content">
                <div class="tab-title">Listening</div>
                <div class="tab-subtitle">Audio comprehension</div>
              </div>
            </button>

            <button
                class="tab-button"
                :class="{ active: activeTab === 'reading' }"
                @click="activeTab = 'reading'"
                role="tab"
            >
              <div class="tab-icon">
                <i class="fas fa-book-open"></i>
              </div>
              <div class="tab-content">
                <div class="tab-title">Reading</div>
                <div class="tab-subtitle">Text comprehension</div>
              </div>
            </button>
          </nav>

          <!-- Listening Section -->
          <div v-if="activeTab === 'listening' && listeningSection" class="section-content listening-section">
            <div v-for="(subSection, index) in listeningSection.subSections" :key="index" class="subsection">
              <div class="subsection-header">
                <h2 class="subsection-title">{{ subSection.title }}</h2>
              </div>

              <!-- Enhanced Audio Player -->
              <div class="audio-player-widget">
                <audio
                    :ref="el => setAudioRef(el, index)"
                    :src="subSection.content"
                    @loadedmetadata="onAudioLoaded(index)"
                    @timeupdate="updateAudioProgress(index)"
                    @ended="onAudioEnded(index)"
                    @error="onAudioError(index)"
                    preload="metadata"
                />

                <div class="audio-controls">
                  <button
                      class="play-button"
                      @click="toggleAudio(index)"
                      :disabled="audioLoading[index]"
                      :class="{ playing: isPlaying[index], loading: audioLoading[index] }"
                  >
                    <div class="play-icon">
                      <i v-if="audioLoading[index]" class="fas fa-spinner fa-spin"></i>
                      <i v-else-if="isPlaying[index]" class="fas fa-pause"></i>
                      <i v-else class="fas fa-play"></i>
                    </div>
                  </button>

                  <div class="audio-progress-section">
                    <div class="time-display">{{ audioCurrentTime[index] || '00:00' }}</div>
                    <div class="progress-slider">
                      <input
                          type="range"
                          class="audio-range"
                          v-model="audioProgress[index]"
                          @input="seekAudio(index)"
                          min="0"
                          max="100"
                          :disabled="!audioDuration[index] || audioLoading[index]"
                      />
                    </div>
                    <div class="time-display">{{ audioDuration[index] || '00:00' }}</div>
                  </div>
                </div>

                <div class="audio-visualizer">
                  <div v-for="n in 20" :key="n" class="visualizer-bar" :class="{ active: isPlaying[index] }"></div>
                </div>
              </div>

              <!-- Enhanced Questions -->
              <div class="questions-grid">
                <div
                    v-for="(question, qIndex) in subSection.questions"
                    :key="`listening-${index}-${qIndex}`"
                    class="question-card"
                    :class="{
                    answered: !!answers[question.content],
                    'multiple-choice': question.type === 1,
                    'text-input': question.type !== 1
                  }"
                >
                  <div class="question-header">
                    <div class="question-number">{{ getQuestionNumber(subSection, qIndex) }}</div>
                    <div class="question-status">
                      <i v-if="answers[question.content]" class="fas fa-check-circle"></i>
                      <i v-else class="far fa-circle"></i>
                    </div>
                  </div>

                  <div class="question-content">
                    <p class="question-text">{{ question.content }}</p>

                    <!-- Multiple Choice Options -->
                    <div v-if="question.type === 1" class="options-container">
                      <label
                          v-for="(option, optIndex) in question.options"
                          :key="`${question.content}-${optIndex}`"
                          class="option-label"
                          :class="{ selected: answers[question.content] === extractOptionValue(option) }"
                      >
                        <input
                            class="option-input"
                            type="radio"
                            :name="`question-${question.content}`"
                            :value="extractOptionValue(option)"
                            v-model="answers[question.content]"
                        />
                        <div class="option-content">
                          <div class="option-indicator"></div>
                          <span class="option-text">{{ option }}</span>
                        </div>
                      </label>
                    </div>

                    <!-- Text Input -->
                    <div v-else class="text-input-container">
                      <input
                          type="text"
                          class="text-input"
                          v-model="answers[question.content]"
                          placeholder="Type your answer here..."
                          maxlength="200"
                      />
                      <div class="input-counter">{{ (answers[question.content] || '').length }}/200</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reading Section -->
          <div v-if="activeTab === 'reading' && readingSection" class="section-content reading-section">
            <div v-for="(subSection, index) in readingSection.subSections" :key="index" class="subsection">
              <div class="subsection-header">
                <h2 class="subsection-title">{{ subSection.title }}</h2>
              </div>

              <div class="reading-layout">
                <!-- Enhanced Passage -->
                <div class="passage-panel">
                  <div class="passage-container">
                    <div class="passage-content" v-html="formatPassage(subSection.content)"></div>
                  </div>
                </div>

                <!-- Enhanced Questions -->
                <div class="questions-panel">
                  <div class="questions-container">
                    <div
                        v-for="(question, qIndex) in subSection.questions"
                        :key="`reading-${index}-${qIndex}`"
                        class="question-card"
                        :class="{
                        answered: !!answers[question.content],
                        'multiple-choice': question.type === 1,
                        'text-input': question.type !== 1
                      }"
                    >
                      <div class="question-header">
                        <div class="question-number">{{ getQuestionNumber(subSection, qIndex) }}</div>
                        <div class="question-status">
                          <i v-if="answers[question.content]" class="fas fa-check-circle"></i>
                          <i v-else class="far fa-circle"></i>
                        </div>
                      </div>

                      <div class="question-content">
                        <p class="question-text">{{ question.content }}</p>

                        <!-- Multiple Choice Options -->
                        <div v-if="question.type === 1" class="options-container">
                          <label
                              v-for="(option, optIndex) in question.options"
                              :key="`${question.content}-${optIndex}`"
                              class="option-label"
                              :class="{ selected: answers[question.content] === extractOptionValue(option) }"
                          >
                            <input
                                class="option-input"
                                type="radio"
                                :name="`question-${question.content}`"
                                :value="extractOptionValue(option)"
                                v-model="answers[question.content]"
                            />
                            <div class="option-content">
                              <div class="option-indicator"></div>
                              <span class="option-text">{{ option }}</span>
                            </div>
                          </label>
                        </div>

                        <!-- Text Input -->
                        <div v-else class="text-input-container">
                          <input
                              type="text"
                              class="text-input"
                              v-model="answers[question.content]"
                              placeholder="Type your answer here..."
                              maxlength="200"
                          />
                          <div class="input-counter">{{ (answers[question.content] || '').length }}/200</div>
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
    </main>

    <!-- Enhanced Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-icon">
            <i class="fas fa-paper-plane"></i>
          </div>
          <h3 class="modal-title">Submit Your Test</h3>
          <button class="modal-close" @click="showConfirmModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <p class="modal-description">Are you ready to submit your answers?</p>

          <div class="submission-stats">
            <div class="stat-item">
              <div class="stat-value">{{ answeredCount }}</div>
              <div class="stat-label">Answered</div>
            </div>
            <div class="stat-divider">/</div>
            <div class="stat-item">
              <div class="stat-value">{{ totalQuestions }}</div>
              <div class="stat-label">Total</div>
            </div>
          </div>

          <div v-if="unansweredCount > 0" class="warning-message">
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ unansweredCount }} questions remain unanswered</span>
          </div>

          <div class="time-remaining-info">
            <i class="fas fa-clock"></i>
            <span>Time remaining: {{ formatTime(timeLeft) }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showConfirmModal = false">
            Cancel
          </button>
          <button class="btn btn-primary" @click="confirmSubmit">
            <i class="fas fa-check"></i>
            Submit Test
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getMockTestById, submitMockTest } from '@/api/test.js';

const TEST_DURATION = 45 * 60;

export default {
  name: 'TestComponent',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const testId = route.params.id;

    const test = ref(null);
    const error = ref('');
    const activeTab = ref('listening');
    const answers = ref({});
    const timeLeft = ref(TEST_DURATION);
    const submitting = ref(false);
    const showConfirmModal = ref(false);

    // Fixed audio state management
    const audioRefs = ref([]);
    const isPlaying = ref([]);
    const audioProgress = ref([]);
    const audioCurrentTime = ref([]);
    const audioDuration = ref([]);
    const audioLoading = ref([]);

    let timerInterval = null;

    const listeningSection = computed(() =>
        test.value?.sections.find(section => section.skill === 'Listening')
    );

    const readingSection = computed(() =>
        test.value?.sections.find(section => section.skill === 'Reading')
    );

    const totalQuestions = computed(() =>
        test.value?.sections.reduce((total, section) =>
            total + section.subSections.reduce((subTotal, subSection) =>
                subTotal + subSection.questions.length, 0), 0) || 0
    );

    const answeredCount = computed(() =>
        Object.values(answers.value).filter(a => a !== null && a !== undefined && a !== '').length
    );

    const unansweredCount = computed(() =>
        totalQuestions.value - answeredCount.value
    );

    const formatTime = (seconds) => {
      const min = Math.floor(seconds / 60);
      const sec = seconds % 60;
      return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const extractOptionValue = (option) => {
      const match = option.match(/^[A-D]\.\s*(.+)$/);
      return match ? match[1].trim() : option.trim();
    };

    const getQuestionNumber = (subSection, qIndex) => {
      let num = 1;
      for (const section of test.value.sections) {
        for (const subSec of section.subSections) {
          if (subSec === subSection) return num + qIndex;
          num += subSec.questions.length;
        }
      }
      return qIndex + 1;
    };

    const fetchTest = async () => {
      try {
        error.value = '';
        const res = await getMockTestById(testId);
        test.value = res.data;

        test.value.sections.forEach(section => {
          section.subSections.forEach(sub => {
            sub.questions.forEach(q => {
              if (!(q.content in answers.value)) {
                answers.value[q.content] = '';
              }
            });
          });
        });
      } catch (err) {
        console.error(err);
        error.value = err.response?.data?.message || 'Failed to load test.';
      }
    };

    const startTimer = () => {
      timerInterval = setInterval(() => {
        timeLeft.value--;
        if (timeLeft.value <= 0) {
          clearInterval(timerInterval);
          timeLeft.value = 0;
          autoSubmit();
        }
      }, 1000);
    };

    const setAudioRef = (el, index) => {
      if (el) {
        audioRefs.value[index] = el;
        if (isPlaying.value[index] === undefined) {
          isPlaying.value[index] = false;
          audioProgress.value[index] = 0;
          audioCurrentTime.value[index] = '00:00';
          audioDuration.value[index] = '00:00';
          audioLoading.value[index] = true;
        }
      }
    };

    const stopTimer = () => {
      clearInterval(timerInterval);
    };

    const toggleAudio = (index) => {
      const audio = audioRefs.value[index];
      if (!audio || typeof audio.play !== 'function') {
        console.error(`Audio at index ${index} is not ready or invalid`, audio);
        return;
      }

      audioRefs.value.forEach((otherAudio, otherIndex) => {
        if (otherIndex !== index && otherAudio && isPlaying.value[otherIndex]) {
          otherAudio.pause();
          isPlaying.value[otherIndex] = false;
        }
      });

      if (isPlaying.value[index]) {
        audio.pause();
        isPlaying.value[index] = false;
      } else {
        audioLoading.value[index] = true;
        audio.play().then(() => {
          isPlaying.value[index] = true;
          audioLoading.value[index] = false;
        }).catch(err => {
          console.error(`Audio playback error for index ${index}:`, err);
          audioLoading.value[index] = false;
          error.value = 'Failed to play audio. Please try again.';
        });
      }
    };


    const seekAudio = (index) => {
      const audio = audioRefs.value[index];
      if (audio && audio.duration) {
        const newTime = (audioProgress.value[index] / 100) * audio.duration;
        audio.currentTime = newTime;
      }
    };

    const updateAudioProgress = (index) => {
      const audio = audioRefs.value[index];
      if (!audio) return;

      const current = audio.currentTime || 0;
      const duration = audio.duration || 0;

      if (duration > 0) {
        audioProgress.value[index] = (current / duration) * 100;
      }

      audioCurrentTime.value[index] = formatTime(Math.floor(current));
      audioDuration.value[index] = formatTime(Math.floor(duration));
    };

    const onAudioLoaded = (index) => {
      updateAudioProgress(index);
      audioLoading.value[index] = false;
    };

    const onAudioEnded = (index) => {
      isPlaying.value[index] = false;
      audioProgress.value[index] = 100;
    };

    const onAudioError = (index) => {
      console.error(`Audio error for index ${index}`);
      error.value = 'Audio failed to load.';
      isPlaying.value[index] = false;
      audioLoading.value[index] = false;
    };

    const submitTest = () => {
      if (unansweredCount.value > 0) {
        showConfirmModal.value = true;
      } else {
        confirmSubmit();
      }
    };

    const confirmSubmit = async () => {
      if (submitting.value) return;
      submitting.value = true;
      stopTimer();

      // Stop all audio players
      audioRefs.value.forEach((audio, index) => {
        if (audio && isPlaying.value[index]) {
          audio.pause();
          isPlaying.value[index] = false;
        }
      });

      const submitData = {
        mockTestId: testId,
        answers: Object.entries(answers.value).filter(([_, a]) => a).map(([content, answer]) => {
          const q = test.value.sections.flatMap(s => s.subSections).flatMap(ss => ss.questions)
              .find(q => q.content === content);
          return {
            questionId: q?.id || content,
            answer: answer.trim(),
          };
        }),
        timeTaken: Math.min(TEST_DURATION - timeLeft.value, 2147483647),
      };

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token');

        const res = await submitMockTest(testId, submitData);
        const resultId = res.data?.resultId || res.data?.id || res.data?._id;

        if (!/^[0-9a-fA-F]{24}$/.test(resultId)) {
          throw new Error('Invalid resultId');
        }

        localStorage.setItem('lastTestResult', JSON.stringify({
          resultId, testId, timestamp: Date.now(),
        }));

        router.push(`/result/${resultId}`);
      } catch (e) {
        console.error(e);
        error.value = e.response?.data?.message || e.message || 'Submit failed.';
        submitting.value = false;
        startTimer();
      }
    };

    const autoSubmit = () => {
      if (!submitting.value) {
        error.value = 'Time is up! Submitting...';
        setTimeout(() => confirmSubmit(), 1000);
      }
    };

    const handleBeforeUnload = (e) => {
      if (!submitting.value && answeredCount.value > 0) {
        e.preventDefault();
        e.returnValue = 'Your answers will be lost. Are you sure?';
      }
    };

    onMounted(async () => {
      console.log('testId in onMounted:', testId);

      if (performance.getEntriesByType('navigation')[0]?.type === 'reload') {
        localStorage.removeItem(`test-${testId}-answers`);
      }

      await fetchTest();
      startTimer();

      window.addEventListener('beforeunload', handleBeforeUnload);
    });

    onUnmounted(() => {
      stopTimer();

      audioRefs.value.forEach((audio, index) => {
        if (audio && typeof audio.pause === 'function') {
          audio.pause();
          audio.removeEventListener('loadedmetadata', () => onAudioLoaded(index));
          audio.removeEventListener('timeupdate', () => updateAudioProgress(index));
          audio.removeEventListener('ended', () => onAudioEnded(index));
          audio.removeEventListener('error', () => onAudioError(index));
        }
      });

      window.removeEventListener('beforeunload', handleBeforeUnload);
    });

    const formatPassage = (content) => {
      if (!content) return '';
      return content.replace(/\n/g, '<br>');
    };

    return {
      test,
      error,
      activeTab,
      answers,
      timeLeft,
      submitting,
      showConfirmModal,
      isPlaying,
      audioProgress,
      audioCurrentTime,
      audioDuration,
      audioLoading,
      listeningSection,
      readingSection,
      totalQuestions,
      answeredCount,
      unansweredCount,
      formatTime,
      extractOptionValue,
      getQuestionNumber,
      toggleAudio,
      seekAudio,
      submitTest,
      confirmSubmit,
      audioRefs,
      setAudioRef,
      updateAudioProgress,
      onAudioLoaded,
      onAudioEnded,
      onAudioError,
      formatPassage,
    };
  }
};
</script>


<style>
/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #1a202c;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.test-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

/* Enhanced Header */
.test-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.test-info {
  flex: 1;
}

.test-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-indicators {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: rgba(203, 213, 225, 0.6);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 12px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.timer-widget {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.timer-icon {
  color: #ef4444;
  font-size: 1.2rem;
}

.timer-content {
  text-align: center;
}

.time-remaining {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ef4444;
  font-family: 'Courier New', monospace;
}

.timer-label {
  font-size: 0.75rem;
  color: #dc2626;
  font-weight: 500;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-btn.submitting {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

/* Main Content */
.test-main {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.test-content-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

/* Alert Styles */
.alert {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  margin: 1.5rem;
  border-radius: 12px;
  position: relative;
}

.alert-error {
  background: rgba(254, 226, 226, 0.9);
  border: 1px solid #fca5a5;
  color: #dc2626;
}

.alert-icon {
  margin-right: 1rem;
  font-size: 1.2rem;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alert-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.alert-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 64px;
  height: 64px;
  border: 4px solid rgba(99, 102, 241, 0.2);
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 2rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.loading-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

/* Modern Tab Navigation */
.section-tabs {
  display: flex;
  background: rgba(243, 244, 246, 0.8);
  border-radius: 16px;
  padding: 0.5rem;
  margin: 2rem;
  margin-bottom: 0;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
}

.tab-button.active {
  background: white;
  color: #1f2937;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.tab-button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
  color: #374151;
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-content {
  text-align: left;
}

.tab-title {
  font-weight: 600;
  font-size: 1rem;
}

.tab-subtitle {
  font-size: 0.8rem;
  opacity: 0.7;
}

/* Section Content */
.section-content {
  padding: 2rem;
}

.subsection {
  margin-bottom: 3rem;
}

.subsection-header {
  margin-bottom: 2rem;
}

.subsection-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid transparent;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  border-image: linear-gradient(135deg, #667eea, #764ba2) 1;
}

/* Enhanced Audio Player */
.audio-player-widget {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.play-button {
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.play-button:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.play-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.play-button.loading {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

.play-icon {
  font-size: 1.5rem;
}

.audio-progress-section {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.time-display {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  min-width: 45px;
}

.progress-slider {
  flex: 1;
}

.audio-range {
  width: 100%;
  height: 8px;
  border-radius: 12px;
  background: rgba(203, 213, 225, 0.6);
  outline: none;
  appearance: none;
  cursor: pointer;
}

.audio-range::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
  transition: all 0.2s ease;
}

.audio-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
}

.audio-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

/* Audio Visualizer */
.audio-visualizer {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 2px;
  height: 40px;
}

.visualizer-bar {
  width: 3px;
  height: 8px;
  background: rgba(148, 163, 184, 0.4);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.visualizer-bar.active {
  background: linear-gradient(to top, #3b82f6, #1d4ed8);
  animation: visualizer-bounce 1s ease-in-out infinite alternate;
}

.visualizer-bar:nth-child(2n).active {
  animation-delay: 0.1s;
}

.visualizer-bar:nth-child(3n).active {
  animation-delay: 0.2s;
}

@keyframes visualizer-bounce {
  0% { height: 8px; }
  100% { height: 30px; }
}

/* Questions Grid */
.questions-grid {
  display: grid;
  gap: 1.5rem;
}

.questions-container {
  display: grid;
  gap: 1.5rem;
}

/* Question Cards */
.question-card {
  background: white;
  border: 2px solid rgba(229, 231, 235, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.question-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.question-card.answered {
  border-color: rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.02), rgba(5, 150, 105, 0.02));
}

.question-card.answered::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #10b981, #059669);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.question-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.9rem;
}

.question-status {
  color: #10b981;
  font-size: 1.2rem;
}

.question-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

/* Multiple Choice Options */
.options-container {
  display: grid;
  gap: 0.75rem;
}

.option-label {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid rgba(229, 231, 235, 0.8);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: rgba(249, 250, 251, 0.5);
}

.option-label:hover {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(99, 102, 241, 0.05);
  transform: translateX(4px);
}

.option-label.selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.05));
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.option-input {
  display: none;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.option-indicator {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.option-label.selected .option-indicator {
  border-color: #3b82f6;
  background: #3b82f6;
}

.option-label.selected .option-indicator::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.option-text {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #374151;
}

/* Text Input */
.text-input-container {
  position: relative;
}

.text-input {
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid rgba(229, 231, 235, 0.8);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(249, 250, 251, 0.5);
  font-family: inherit;
}

.text-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.input-counter {
  position: absolute;
  right: 1rem;
  bottom: -1.5rem;
  font-size: 0.8rem;
  color: #6b7280;
}

/* Reading Layout */
.reading-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.passage-panel {
  position: sticky;
  top: 120px;
}

.passage-container {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 2rem;
  max-height: 600px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.passage-content {
  font-size: 1rem;
  line-height: 1.8;
  color: #374151;
}

.passage-content p {
  margin-bottom: 1rem;
}

/* Enhanced Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-container {
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 100%;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem 2rem 1rem;
  position: relative;
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.modal-title {
  flex: 1;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(107, 114, 128, 0.2);
  color: #374151;
}

.modal-body {
  padding: 1rem 2rem 2rem;
}

.modal-description {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.submission-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(29, 78, 216, 0.05));
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-divider {
  font-size: 1.5rem;
  color: #d1d5db;
  font-weight: 300;
}

.warning-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 12px;
  color: #d97706;
  font-size: 0.9rem;
  margin: 1rem 0;
}

.time-remaining-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem 2rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.2);
}

.btn-secondary:hover {
  background: rgba(107, 114, 128, 0.2);
  color: #374151;
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .reading-layout {
    grid-template-columns: 1fr;
  }

  .passage-panel {
    position: static;
  }

  .passage-container {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .progress-bar {
    width: 150px;
  }

  .test-main {
    padding: 1rem;
  }

  .section-tabs {
    margin: 1rem;
  }

  .tab-button {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 0.5rem;
  }

  .audio-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .audio-progress-section {
    width: 100%;
  }

  .modal-overlay {
    padding: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0.5rem;
  }

  .test-title {
    font-size: 1.4rem;
  }

  .timer-widget {
    padding: 0.75rem 1rem;
  }

  .submit-btn {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .section-content {
    padding: 1rem;
  }

  .audio-player-widget {
    padding: 1rem;
  }

  .question-card {
    padding: 1rem;
  }
}
</style>