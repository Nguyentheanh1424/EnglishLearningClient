<template>
  <div class="dashboard-container d-flex">
    <!-- Main Content -->
    <div class="main-content flex-grow-1 d-flex flex-column">
      <div class="flex-grow-1 p-4">
        <div class="row g-4 mx-0">
          <!-- Loading State -->
          <div v-if="loading" class="col-12">
            <div class="text-center py-5">
              <div class="loading-container">
                <div class="loading-spinner">
                  <div class="spinner-ring"></div>
                  <div class="spinner-ring"></div>
                  <div class="spinner-ring"></div>
                </div>
                <p class="loading-text">Loading writing prompt...</p>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="col-12">
            <div class="error-card">
              <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <h3>Oops! Something went wrong</h3>
              <p>{{ error }}</p>
              <button @click="fetchPrompt" class="btn btn-primary pulse-animation">
                <i class="fas fa-redo me-2"></i>Try Again
              </button>
            </div>
          </div>

          <!-- Main Test Content -->
          <template v-else-if="prompt">
            <!-- Header -->
            <div class="col-12">
              <div class="test-header card gradient-border">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="header-content">
                      <div class="d-flex align-items-center mb-3">
                        <div class="test-icon">
                          <i class="fas fa-pen-fancy"></i>
                        </div>
                        <div>
                          <h1 class="test-title">{{ prompt.title }}</h1>
                          <div class="test-meta">
                            <span class="meta-badge time-badge">
                              <i class="fas fa-clock me-1"></i>{{ timeLimit }} minutes
                            </span>
                            <span class="meta-badge word-badge">
                              <i class="fas fa-edit me-1"></i>{{ wordCountRange }} words
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="timer-section">
                      <div class="timer-display" :class="{ 'timer-warning': timeLeft <= 300, 'timer-critical': timeLeft <= 60 }">
                        <div class="timer-icon">
                          <i class="fas fa-stopwatch"></i>
                        </div>
                        <div class="timer-content">
                          <span class="timer-text">{{ formattedTime }}</span>
                          <span class="timer-label">Time Left</span>
                        </div>
                      </div>
                      <div class="timer-controls">
                        <button
                            @click="toggleTimer"
                            class="btn timer-btn"
                            :class="timerRunning ? 'btn-pause' : 'btn-play'"
                        >
                          <i :class="timerRunning ? 'fas fa-pause' : 'fas fa-play'"></i>
                          {{ timerRunning ? 'Pause' : 'Start' }}
                        </button>
                        <button @click="resetTimer" class="btn btn-reset">
                          <i class="fas fa-redo"></i>
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Instructions -->
            <div class="col-12">
              <div class="card instructions-card">
                <div class="card-header">
                  <div class="header-icon">
                    <i class="fas fa-clipboard-list"></i>
                  </div>
                  <h5>Writing Task Instructions</h5>
                </div>
                <div class="card-body">
                  <div class="instruction-content">
                    <p class="instruction-text">{{ prompt.description }}</p>
                    <div class="writing-tips">
                      <h6 class="tips-title">
                        <i class="fas fa-lightbulb"></i>
                        Pro Writing Tips
                      </h6>
                      <div class="tips-grid">
                        <div class="tip-item">
                          <i class="fas fa-list"></i>
                          <span>Plan your essay structure</span>
                        </div>
                        <div class="tip-item">
                          <i class="fas fa-layer-group"></i>
                          <span>Include intro, body & conclusion</span>
                        </div>
                        <div class="tip-item">
                          <i class="fas fa-palette"></i>
                          <span>Use varied vocabulary</span>
                        </div>
                        <div class="tip-item">
                          <i class="fas fa-ruler"></i>
                          <span>Stay within word count</span>
                        </div>
                        <div class="tip-item">
                          <i class="fas fa-spell-check"></i>
                          <span>Check grammar & spelling</span>
                        </div>
                        <div class="tip-item">
                          <i class="fas fa-clock"></i>
                          <span>Manage your time wisely</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Writing Area -->
            <div class="col-12">
              <div class="writing-section card">
                <div class="card-header">
                  <div class="d-flex justify-content-between align-items-center w-100">
                    <div class="writing-header">
                      <div class="header-icon">
                        <i class="fas fa-edit"></i>
                      </div>
                      <h5>Your Essay</h5>
                    </div>
                    <div class="writing-stats">
                      <div class="stat-item word-count" :class="getWordCountClass()">
                        <i class="fas fa-font"></i>
                        <span class="stat-number">{{ wordCount }}</span>
                        <span class="stat-label">words</span>
                      </div>
                      <div class="stat-item char-count">
                        <i class="fas fa-keyboard"></i>
                        <span class="stat-number">{{ charCount }}</span>
                        <span class="stat-label">chars</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-body p-0">
                  <div class="writing-container">
                    <textarea
                        v-model="userEssay"
                        class="writing-textarea"
                        :placeholder="writingPlaceholder"
                        @input="updateStats"
                        @keydown="handleKeydown"
                    ></textarea>
                    <div class="writing-overlay" v-if="!userEssay.trim()">
                      <div class="overlay-content">
                        <i class="fas fa-pen-nib"></i>
                        <p>Start writing your masterpiece...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="col-12">
              <div class="action-section">
                <div class="left-actions">
                  <button @click="showSampleAnswer = !showSampleAnswer" class="btn btn-outline-primary">
                    <i class="fas fa-eye me-2"></i>
                    {{ showSampleAnswer ? 'Hide' : 'View' }} Sample Answer
                  </button>
                  <button @click="clearEssay" class="btn btn-outline-warning" :disabled="!userEssay.trim()">
                    <i class="fas fa-trash me-2"></i>Clear Essay
                  </button>
                </div>
                <div class="right-actions">
                  <button @click="saveDraft" class="btn btn-secondary" :disabled="!userEssay.trim()">
                    <i class="fas fa-save me-2"></i>Save Draft
                  </button>
                  <button @click="submitEssay" class="btn btn-primary submit-btn" :disabled="!canSubmit">
                    <i class="fas fa-paper-plane me-2"></i>Submit Essay
                  </button>
                </div>
              </div>
            </div>

            <!-- Sample Answer -->
            <div v-if="showSampleAnswer && prompt.sampleAnswer" class="col-12">
              <div class="card sample-answer-card slide-in">
                <div class="card-header">
                  <div class="header-icon sample-icon">
                    <i class="fas fa-star"></i>
                  </div>
                  <h5>Sample Answer</h5>
                  <div class="sample-badge">
                    <i class="fas fa-trophy"></i>
                    High Score Example
                  </div>
                </div>
                <div class="card-body">
                  <div class="sample-content">
                    <p class="sample-text">{{ prompt.sampleAnswer }}</p>
                    <div class="sample-stats">
                      <div class="sample-stat">
                        <i class="fas fa-font"></i>
                        <span>{{ getSampleWordCount() }} words</span>
                      </div>
                      <div class="sample-stat">
                        <i class="fas fa-medal"></i>
                        <span>Band 8-9 Level</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Submit Modal -->
    <div class="modal fade" id="submitModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content modern-modal">
          <div class="modal-header">
            <div class="modal-title-section">
              <div class="modal-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <h5>Submit Your Essay</h5>
            </div>
            <button type="button" class="btn-close modern-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="submission-summary">
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-icon word-icon">
                    <i class="fas fa-font"></i>
                  </div>
                  <div class="summary-content">
                    <span class="summary-label">Word Count</span>
                    <span class="summary-value" :class="getWordCountClass()">{{ wordCount }}</span>
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-icon time-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="summary-content">
                    <span class="summary-label">Time Used</span>
                    <span class="summary-value">{{ getTimeUsed() }}</span>
                  </div>
                </div>
              </div>
              <div class="essay-preview">
                <h6>Essay Preview</h6>
                <div class="preview-content">
                  {{ userEssay.substring(0, 200) }}{{ userEssay.length > 200 ? '...' : '' }}
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-2"></i>Cancel
            </button>
            <button type="button" @click="confirmSubmit" class="btn btn-primary" :disabled="submitting">
              <i class="fas fa-paper-plane me-2"></i>
              {{ submitting ? 'Submitting...' : 'Confirm Submit' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast-container position-fixed top-0 end-0 p-3">
      <div class="toast" id="draftToast" role="alert">
        <div class="toast-header">
          <i class="fas fa-save text-success me-2"></i>
          <strong class="me-auto">Draft Saved</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
          Your essay has been saved as a draft successfully!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getWritingPromptById, submitWritingSubmission } from '@/api/writing.js';
import * as bootstrap from 'bootstrap';

const route = useRoute();
const router = useRouter();

// State
const prompt = ref(null);
const loading = ref(true);
const error = ref('');
const userEssay = ref('');
const showSampleAnswer = ref(false);
const submitting = ref(false);

// Timer state
const timeLimit = ref(40);
const timeLeft = ref(40 * 60);
const timerRunning = ref(false);
const timerInterval = ref(null);

// Stats
const wordCount = ref(0);
const charCount = ref(0);
const wordCountRange = ref('150-200');

// Fetch prompt data
const fetchPrompt = async () => {
  try {
    loading.value = true;
    error.value = '';
    const response = await getWritingPromptById(route.params.id);
    prompt.value = response.data;

    if (prompt.value.description.includes('150-200')) {
      wordCountRange.value = '150-200';
    } else if (prompt.value.description.includes('250')) {
      wordCountRange.value = '250+';
      timeLimit.value = 60;
      timeLeft.value = 60 * 60;
    }
  } catch (err) {
    error.value = 'Failed to load writing prompt. Please try again.';
    console.error('Error fetching prompt:', err);
  } finally {
    loading.value = false;
  }
};

// Timer functions
const toggleTimer = () => {
  if (timerRunning.value) {
    clearInterval(timerInterval.value);
  } else {
    timerInterval.value = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--;
      } else {
        clearInterval(timerInterval.value);
        timerRunning.value = false;
        alert('Time is up! Please submit your essay.');
      }
    }, 1000);
  }
  timerRunning.value = !timerRunning.value;
};

const resetTimer = () => {
  clearInterval(timerInterval.value);
  timerRunning.value = false;
  timeLeft.value = timeLimit.value * 60;
};

// Computed properties
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const writingPlaceholder = computed(() => {
  return `Begin your essay here...

💡 Remember to:
• Structure your essay with clear introduction, body, and conclusion
• Aim for ${wordCountRange.value} words
• Use diverse vocabulary and sentence structures
• Proofread for grammar and spelling

Start typing to see your word count update in real-time!`;
});

const canSubmit = computed(() => {
  return userEssay.value.trim().length > 0 && wordCount.value >= 50;
});

// Update stats
const updateStats = () => {
  const text = userEssay.value;
  charCount.value = text.length;
  wordCount.value = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
};

// Word count styling
const getWordCountClass = () => {
  if (wordCountRange.value === '150-200') {
    if (wordCount.value < 150) return 'text-warning';
    if (wordCount.value > 200) return 'text-danger';
    return 'text-success';
  } else if (wordCountRange.value === '250+') {
    if (wordCount.value < 250) return 'text-warning';
    return 'text-success';
  }
  return '';
};

// Get sample word count
const getSampleWordCount = () => {
  if (!prompt.value?.sampleAnswer) return 0;
  return prompt.value.sampleAnswer.trim().split(/\s+/).length;
};

// Get time used
const getTimeUsed = () => {
  const totalSeconds = timeLimit.value * 60;
  const usedSeconds = totalSeconds - timeLeft.value;
  const minutes = Math.floor(usedSeconds / 60);
  const seconds = usedSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Actions
const clearEssay = () => {
  if (confirm('Are you sure you want to clear your essay? This action cannot be undone.')) {
    userEssay.value = '';
    updateStats();
  }
};

const saveDraft = () => {
  const draft = {
    promptId: route.params.id,
    content: userEssay.value,
    wordCount: wordCount.value,
    timeUsed: getTimeUsed(),
    savedAt: new Date().toISOString()
  };

  // Save to localStorage (note: this is just for demo, real app would use proper storage)
  const savedDrafts = JSON.parse(sessionStorage.getItem('writingDrafts') || '{}');
  savedDrafts[route.params.id] = draft;
  sessionStorage.setItem('writingDrafts', JSON.stringify(savedDrafts));

  // Show toast notification
  const toastEl = document.getElementById('draftToast');
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
};

const submitEssay = () => {
  const modal = new bootstrap.Modal(document.getElementById('submitModal'));
  modal.show();
};

const confirmSubmit = async () => {
  try {
    submitting.value = true;

    const submissionData = {
      promptId: route.params.id,
      content: userEssay.value,
    };

    const res = await submitWritingSubmission(submissionData);

    // Clear draft if exists
    const savedDrafts = JSON.parse(sessionStorage.getItem('writingDrafts') || '{}');
    delete savedDrafts[route.params.id];
    sessionStorage.setItem('writingDrafts', JSON.stringify(savedDrafts));

    router.push(`/writing/result/${res.data.id}`);

  } catch (err) {
    console.error('Error submitting essay:', err);
    alert('Failed to submit essay. Please try again.');
  } finally {
    submitting.value = false;
  }
};

// Keyboard shortcuts
const handleKeydown = (event) => {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
    saveDraft();
  }
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    if (canSubmit.value) {
      submitEssay();
    }
  }
};

// Load draft if exists
const loadDraft = () => {
  const savedDrafts = JSON.parse(sessionStorage.getItem('writingDrafts') || '{}');
  const draft = savedDrafts[route.params.id];
  if (draft) {
    userEssay.value = draft.content || '';
    updateStats();
  }
};

// Lifecycle
onMounted(() => {
  fetchPrompt();
  loadDraft();
});

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
});
</script>

<style>
/* Modern CSS Variables */
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --warning-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  --danger-gradient: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  --glass-bg: rgba(255, 255, 255, 0.25);
  --glass-border: rgba(255, 255, 255, 0.18);
  --shadow-soft: 0 8px 32px rgba(31, 38, 135, 0.37);
  --shadow-hover: 0 15px 35px rgba(31, 38, 135, 0.5);
  --border-radius: 16px;
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Base styles */
body {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.dashboard-container {
  min-height: 100vh;
  background: transparent;
}

.main-content {
  background: transparent;
}

.row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Enhanced Loading */
.loading-container {
  padding: 4rem 2rem;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
}

.spinner-ring {
  position: absolute;
  border: 4px solid transparent;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.spinner-ring:nth-child(1) {
  width: 80px;
  height: 80px;
  border-top-color: #667eea;
  animation-delay: 0s;
}

.spinner-ring:nth-child(2) {
  width: 60px;
  height: 60px;
  border-top-color: #764ba2;
  animation-delay: -0.5s;
  top: 10px;
  left: 10px;
}

.spinner-ring:nth-child(3) {
  width: 40px;
  height: 40px;
  border-top-color: #4facfe;
  animation-delay: -1s;
  top: 20px;
  left: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #64748b;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Enhanced Error State */
.error-card {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 1px solid #f87171;
  border-radius: var(--border-radius);
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: var(--shadow-soft);
}

.error-icon {
  width: 80px;
  height: 80px;
  background: var(--danger-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: white;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-card h3 {
  color: #dc2626;
  margin-bottom: 1rem;
}

.error-card p {
  color: #7f1d1d;
  margin-bottom: 2rem;
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Enhanced Header */
.test-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(10px);
  transition: var(--transition-smooth);
}

.test-header:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.gradient-border {
  position: relative;
  overflow: hidden;
}

.gradient-border::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-gradient);
}

.test-icon {
  width: 70px;
  height: 70px;
  background: var(--primary-gradient);
  color: white;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin-right: 1.5rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: var(--transition-smooth);
}

.test-icon:hover {
  transform: scale(1.05);
}

.test-title {
  font-size: 2rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-right: 0.75rem;
  margin-bottom: 0.5rem;
  transition: var(--transition-smooth);
}

.time-badge {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.word-badge {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(67, 233, 123, 0.3);
}

/* Enhanced Timer */
.timer-section {
  text-align: right;
}

.timer-display {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid #cbd5e1;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: var(--transition-smooth);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.timer-icon {
  width: 50px;
  height: 50px;
  background: var(--primary-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.timer-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.timer-text {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.timer-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.timer-warning {
  background: var(--warning-gradient);
  border-color: #f59e0b;
  color: white;
  animation: pulse-warning 2s infinite;
}

.timer-warning .timer-text {
  color: white;
}

.timer-critical {
  background: var(--danger-gradient);
  border-color: #ef4444;
  color: white;
  animation: pulse-critical 1s infinite;
}

.timer-critical .timer-text {
  color: white;
}

@keyframes pulse-warning {
  0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); }
  50% { transform: scale(1.02); box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6); }
}

@keyframes pulse-critical {
  0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 8px 25px rgba(239, 68, 68, 0.8); }
}

.timer-controls {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.timer-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 25px;
  font-weight: 600;
  transition: var(--transition-smooth);
  border: none;
}

.btn-play {
  background: var(--success-gradient);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.btn-pause {
  background: var(--warning-gradient);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.btn-reset {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-reset:hover {
  background: #e2e8f0;
  color: #475569;
  transform: translateY(-1px);
}

/* Instructions Card */
.instructions-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  transition: var(--transition-smooth);
}

.instructions-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.instructions-card .card-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #cbd5e1;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: var(--border-radius) var(--border-radius) 0 0 !important;
}

.header-icon {
  width: 45px;
  height: 45px;
  background: var(--primary-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.instruction-content {
  padding: 1rem 0;
}

.instruction-text {
  font-size: 1.1rem;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.writing-tips {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: var(--border-radius);
  padding: 1.5rem;
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0284c7;
  font-weight: 700;
  margin-bottom: 1rem;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  transition: var(--transition-smooth);
}

.tip-item:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tip-item i {
  color: #0284c7;
  font-size: 1.1rem;
}

/* Writing Section */
.writing-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  transition: var(--transition-smooth);
}

.writing-section:hover {
  box-shadow: var(--shadow-hover);
}

.writing-section .card-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #cbd5e1;
  border-radius: var(--border-radius) var(--border-radius) 0 0 !important;
}

.writing-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.writing-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 25px;
  font-weight: 600;
  transition: var(--transition-smooth);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.word-count {
  border: 2px solid #10b981;
}

.word-count.text-warning {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.word-count.text-danger {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.word-count.text-success {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.char-count {
  border: 2px solid #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.stat-number {
  font-size: 1.2rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
}

.writing-container {
  position: relative;
  min-height: 500px;
}

.writing-textarea {
  width: 100%;
  min-height: 500px;
  border: none;
  outline: none;
  resize: vertical;
  padding: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
  background: transparent;
  font-family: 'Georgia', serif;
  color: #374151;
}

.writing-textarea::placeholder {
  color: #9ca3af;
  font-style: italic;
}

.writing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(4px);
}

.overlay-content {
  text-align: center;
  color: #9ca3af;
}

.overlay-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Action Section */
.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.left-actions, .right-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  transition: var(--transition-smooth);
  border: 2px solid transparent;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-outline-primary {
  color: #667eea;
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.btn-outline-primary:hover {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-outline-warning {
  color: #f59e0b;
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.btn-outline-warning:hover {
  background: var(--warning-gradient);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.btn-secondary {
  background: #64748b;
  color: white;
  border-color: #64748b;
}

.btn-secondary:hover {
  background: #475569;
  box-shadow: 0 4px 15px rgba(100, 116, 139, 0.4);
}

.submit-btn {
  background: var(--primary-gradient);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.submit-btn:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Sample Answer */
.sample-answer-card {
  background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
  border: 1px solid #fcd34d;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
  transition: var(--transition-smooth);
}

.sample-answer-card .card-header {
  background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
  border-bottom: 1px solid #fcd34d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: var(--border-radius) var(--border-radius) 0 0 !important;
}

.sample-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.sample-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
}

.sample-content {
  padding: 1rem 0;
}

.sample-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #92400e;
  margin-bottom: 1.5rem;
}

.sample-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.sample-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(245, 158, 11, 0.2);
  border-radius: 20px;
  color: #92400e;
  font-weight: 600;
}

.slide-in {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal */
.modern-modal {
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-hover);
  border: none;
}

.modern-modal .modal-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #cbd5e1;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon {
  width: 45px;
  height: 45px;
  background: var(--success-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.modern-close {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submission-summary {
  padding: 1rem 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: var(--border-radius);
  transition: var(--transition-smooth);
}

.summary-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.word-icon {
  background: var(--success-gradient);
}

.time-icon {
  background: var(--primary-gradient);
}

.summary-content {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.summary-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
}

.essay-preview {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: var(--border-radius);
  padding: 1.5rem;
}

.essay-preview h6 {
  color: #0284c7;
  font-weight: 700;
  margin-bottom: 1rem;
}

.preview-content {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  color: #374151;
  line-height: 1.6;
  font-style: italic;
}

/* Toast */
.toast {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid #86efac;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-soft);
}

.toast-header {
  background: linear-gradient(135deg, #d1fae5 0%, #bbf7d0 100%);
  border-bottom: 1px solid #86efac;
}

/* Responsive */
@media (max-width: 768px) {
  .test-title {
    font-size: 1.5rem;
  }

  .timer-display {
    flex-direction: column;
    text-align: center;
  }

  .timer-content {
    align-items: center;
  }

  .action-section {
    flex-direction: column;
    align-items: stretch;
  }

  .left-actions, .right-actions {
    justify-content: center;
  }

  .tips-grid {
    grid-template-columns: 1fr;
  }

  .writing-stats {
    flex-direction: column;
    gap: 0.5rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>