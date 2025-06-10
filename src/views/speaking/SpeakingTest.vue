<template>
  <div class="speaking-test-container">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading speaking test...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      <div class="d-flex align-items-center">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <div>
          <h5 class="alert-heading mb-1">Error Loading Test</h5>
          <p class="mb-0">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Main Test Content -->
    <div v-else-if="topic" class="test-content">
      <!-- Header -->
      <div class="test-header card mb-4">
        <div class="card-body">
          <div class="row align-items-center">
            <div>
              <div class="d-flex align-items-center mb-2">
                <div>
                  <h1 class="test-title mb-1">{{ topic.title }}</h1>
                  <p class="test-subtitle text-muted mb-0">IELTS Speaking Test</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Test Instructions -->
      <div class="instructions-card card mb-4" v-if="!testStarted">
        <div class="card-body">
          <h5 class="card-title">
            <i class="fas fa-info-circle me-2"></i>
            Test Instructions
          </h5>
          <div class="instructions-content">
            <p>{{ topic.description || 'Please read the topic carefully and prepare your response.' }}</p>
            <ul class="instruction-list">
              <li>You will have <strong>{{ preparationTime / 60 }} minutes</strong> to prepare your response</li>
              <li>You can make notes during preparation time</li>
              <li>You will then have <strong>{{ speakingTime / 60 }} minutes</strong> to record your response</li>
              <li>Speak clearly and naturally</li>
              <li>Try to use the full time available</li>
            </ul>
          </div>
          <div class="text-center mt-4">
            <button @click="startTest" class="btn btn-primary btn-lg">
              <i class="fas fa-play me-2"></i>
              Start Test
            </button>
          </div>
        </div>
      </div>

      <!-- Test Phase Display -->
      <div v-if="testStarted" class="test-phase-container">
        <!-- Preparation Phase -->
        <div v-if="currentPhase === 'preparation'" class="preparation-phase">
          <div class="card mb-4">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="phase-title">
                  <i class="fas fa-book-open me-2"></i>
                  Preparation Time
                </h5>
                <div class="phase-timer">
                  <span class="timer-large">{{ formatTime(timeRemaining) }}</span>
                </div>
              </div>
              <div class="topic-content">
                <h6>Topic:</h6>
                <div class="topic-text">{{ topic.title }}</div>
                <div v-if="topic.description" class="topic-description mt-2">
                  <small class="text-muted">{{ topic.description }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes Area -->
          <div class="card">
            <div class="card-body">
              <h6 class="mb-3">
                <i class="fas fa-sticky-note me-2"></i>
                Your Notes
              </h6>
              <textarea
                  v-model="notes"
                  class="form-control notes-textarea"
                  placeholder="Write your notes here... (optional)"
                  rows="6"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Speaking Phase -->
        <div v-if="currentPhase === 'speaking'" class="speaking-phase">
          <div class="card mb-4">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="phase-title">
                  <i class="fas fa-microphone me-2"></i>
                  Speaking Time
                </h5>
                <div class="phase-timer">
                  <span class="timer-large">{{ formatTime(timeRemaining) }}</span>
                </div>
              </div>

              <!-- Recording Controls -->
              <div class="recording-controls text-center mb-4">
                <div class="recording-status mb-3">
                  <div class="status-indicator" :class="{ 'recording': isRecording, 'paused': isPaused }">
                    <i class="fas" :class="getRecordingIcon()"></i>
                  </div>
                  <p class="status-text">{{ getRecordingStatus() }}</p>
                </div>

                <div class="control-buttons">
                  <button
                      v-if="!isRecording && !audioBlob"
                      @click="startRecording"
                      class="btn btn-danger btn-lg me-3"
                  >
                    <i class="fas fa-circle me-2"></i>
                    Start Recording
                  </button>

                  <button
                      v-if="isRecording && !isPaused"
                      @click="pauseRecording"
                      class="btn btn-warning btn-lg me-3"
                  >
                    <i class="fas fa-pause me-2"></i>
                    Pause
                  </button>

                  <button
                      v-if="isRecording && isPaused"
                      @click="resumeRecording"
                      class="btn btn-success btn-lg me-3"
                  >
                    <i class="fas fa-play me-2"></i>
                    Resume
                  </button>

                  <button
                      v-if="isRecording"
                      @click="stopRecording"
                      class="btn btn-dark btn-lg"
                  >
                    <i class="fas fa-stop me-2"></i>
                    Stop Recording
                  </button>
                </div>
              </div>

              <!-- Audio Playback -->
              <div v-if="audioBlob" class="audio-playback card">
                <div class="card-body">
                  <h6 class="mb-3">
                    <i class="fas fa-play-circle me-2"></i>
                    Your Recording
                  </h6>
                  <audio :src="audioUrl" controls class="w-100 mb-3"></audio>
                  <div class="text-center">
                    <button @click="retryRecording" class="btn btn-outline-secondary me-2">
                      <i class="fas fa-redo me-2"></i>
                      Record Again
                    </button>
                    <button
                        @click="submitTest"
                        class="btn btn-primary"
                        :disabled="submitting || isSubmitted"
                    >
                      <i class="fas fa-paper-plane me-2"></i>
                      <span v-if="submitting">Submitting...</span>
                      <span v-else-if="isSubmitted">Submitted</span>
                      <span v-else>Submit Test</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Topic Reference -->
              <div class="topic-reference card mt-4">
                <div class="card-body">
                  <h6 class="mb-2">Topic Reference:</h6>
                  <div class="topic-text-small">{{ topic.title }}</div>
                  <div v-if="topic.description" class="topic-description-small mt-2">
                    <small class="text-muted">{{ topic.description }}</small>
                  </div>
                  <div v-if="notes" class="notes-reference mt-3">
                    <h6 class="mb-2">Your Notes:</h6>
                    <div class="notes-text">{{ notes }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Results Phase -->
        <div v-if="currentPhase === 'completed'" class="results-phase">
          <div class="card">
            <div class="card-body text-center">
              <div class="success-icon mb-3">
                <i class="fas fa-check-circle"></i>
              </div>
              <h4 class="mb-3">Test Completed Successfully!</h4>
              <p class="text-muted mb-4">Your speaking test has been submitted for evaluation.</p>

              <!-- Feedback Display -->
              <div v-if="testResult && testResult.feedback" class="feedback-section mt-4">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">
                      <i class="fas fa-comments me-2"></i>
                      Feedback & Evaluation
                    </h5>
                    <div class="feedback-content" v-html="renderedFeedback"></div>
                  </div>
                </div>
              </div>

              <!-- Transcription Display -->
              <div v-if="testResult && testResult.transcription" class="transcription-section mt-4">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">
                      <i class="fas fa-file-alt me-2"></i>
                      Transcription
                    </h6>
                    <div class="transcription-text">{{ testResult.transcription }}</div>
                  </div>
                </div>
              </div>

              <!-- Sample Answer (if available) -->
              <div v-if="topic.sampleAnswer" class="sample-answer mt-4">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">
                      <i class="fas fa-lightbulb me-2"></i>
                      Sample Answer
                    </h6>
                    <div class="sample-text">{{ topic.sampleAnswer }}</div>
                  </div>
                </div>
              </div>

              <div class="action-buttons mt-4">
                <router-link to="/skills" class="btn btn-outline-primary me-2">
                  <i class="fas fa-arrow-left me-2"></i>
                  Back to Skills
                </router-link>
                <button @click="retakeTest" class="btn btn-primary">
                  <i class="fas fa-redo me-2"></i>
                  Take Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getSpeakingTopicById, submitSpeakingAttempt } from '@/api/speaking.js';
import MarkdownIt from 'markdown-it';

const route = useRoute();

// Initialize markdown-it
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true
});

// Data
const topic = ref(null);
const loading = ref(true);
const error = ref(null);
const testStarted = ref(false);
const currentPhase = ref('preparation'); // preparation, speaking, completed
const notes = ref('');
const submitting = ref(false);
const isSubmitted = ref(false); // NEW: Track if already submitted
const testResult = ref(null); // NEW: Store test result

// Timer
const timeRemaining = ref(0);
const timer = ref(null);
const preparationTime = 5; // 60 seconds = 1 minute
const speakingTime = 5; // 120 seconds = 2 minutes

// Recording
const isRecording = ref(false);
const isPaused = ref(false);
const audioBlob = ref(null);
const audioUrl = ref('');
const mediaRecorder = ref(null);
const audioChunks = ref([]);
const mediaStream = ref(null);

// NEW: Computed property for rendered feedback
const renderedFeedback = computed(() => {
  if (!testResult.value?.feedback) return '';
  return md.render(testResult.value.feedback);
});

// Computed
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Methods
const fetchTopic = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await getSpeakingTopicById(route.params.id);
    if (response.data) {
      topic.value = response.data;
    } else {
      throw new Error('No topic data received');
    }
  } catch (err) {
    console.error('Failed to fetch speaking topic:', err);
    error.value = err.response?.data?.message || 'Failed to load speaking topic';
  } finally {
    loading.value = false;
  }
};

const startTest = () => {
  testStarted.value = true;
  currentPhase.value = 'preparation';
  timeRemaining.value = preparationTime;
  startTimer();
};

const startTimer = () => {
  timer.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    } else {
      if (currentPhase.value === 'preparation') {
        // Move to the speaking phase
        currentPhase.value = 'speaking';
        timeRemaining.value = speakingTime;
      } else if (currentPhase.value === 'speaking') {
        // Auto submit if time runs out
        if (audioBlob.value && !isSubmitted.value) {
          submitTest();
        } else {
          stopTimer();
          alert('Time is up! Please record your response.');
        }
      }
    }
  }, 1000);
};

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

const startRecording = async () => {
  try {
    // Stop any existing stream first
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach(track => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 44100,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    mediaStream.value = stream;

    // Reset audio chunks for new recording
    audioChunks.value = [];

    // Check for supported MIME types
    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ''; // Let the browser choose
        }
      }
    }

    const options = mimeType ? { mimeType } : {};
    mediaRecorder.value = new MediaRecorder(stream, options);

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.value.push(event.data);
      }
    };

    mediaRecorder.value.onstop = () => {
      try {
        // Determine the correct MIME type for the blob
        const recordedMimeType = mediaRecorder.value.mimeType || 'audio/webm';
        const blob = new Blob(audioChunks.value, { type: recordedMimeType });

        // Validate that we have audio data
        if (blob.size === 0) {
          throw new Error('No audio data recorded');
        }

        audioBlob.value = blob;

        // Clean up previous URL
        if (audioUrl.value) {
          URL.revokeObjectURL(audioUrl.value);
        }

        audioUrl.value = URL.createObjectURL(blob);

        console.log('Recording completed:', {
          size: blob.size,
          type: blob.type,
          chunks: audioChunks.value.length
        });
      } catch (err) {
        console.error('Error processing recorded audio:', err);
        alert('Error processing recorded audio. Please try again.');
      }

      // Clean up stream
      cleanupMediaStream();
    };

    mediaRecorder.value.onerror = (event) => {
      console.error('MediaRecorder error:', event.error);
      alert('Recording error occurred. Please try again.');
      cleanupMediaStream();
    };

    // Start recording with time slice for better compatibility
    mediaRecorder.value.start(1000);
    isRecording.value = true;
    isPaused.value = false;

    console.log('Recording started with MIME type:', mediaRecorder.value.mimeType);
  } catch (err) {
    console.error('Failed to start recording:', err);
    let errorMessage = 'Failed to access microphone. ';

    if (err.name === 'NotAllowedError') {
      errorMessage += 'Please allow microphone access and try again.';
    } else if (err.name === 'NotFoundError') {
      errorMessage += 'No microphone found. Please check your audio devices.';
    } else {
      errorMessage += 'Please check your permissions and try again.';
    }

    alert(errorMessage);
    cleanupMediaStream();
  }
};

const cleanupMediaStream = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop());
    mediaStream.value = null;
  }
};

const pauseRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.pause();
    isPaused.value = true;
  }
};

const resumeRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'paused') {
    mediaRecorder.value.resume();
    isPaused.value = false;
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop();
    isRecording.value = false;
    isPaused.value = false;
  }
};

const retryRecording = () => {
  // Clean up previous recording
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }

  audioBlob.value = null;
  audioUrl.value = '';
  isRecording.value = false;
  isPaused.value = false;
  audioChunks.value = [];

  cleanupMediaStream();
};

const getRecordingIcon = () => {
  if (isRecording.value && !isPaused.value) return 'fa-circle';
  if (isPaused.value) return 'fa-pause';
  return 'fa-microphone';
};

const getRecordingStatus = () => {
  if (isRecording.value && !isPaused.value) return 'Recording...';
  if (isPaused.value) return 'Recording Paused';
  if (audioBlob.value) return 'Recording Complete';
  return 'Ready to Record';
};

const submitTest = async () => {
  // FIXED: Prevent double submission
  if (!audioBlob.value || submitting.value || isSubmitted.value) {
    if (!audioBlob.value) {
      alert('Please record your response before submitting.');
    }
    return;
  }

  submitting.value = true;
  isSubmitted.value = true; // FIXED: Mark as submitted immediately

  try {
    // Create FormData to send the audio file
    const formData = new FormData();
    formData.append('TopicId', topic.value.id);

    // Create a proper file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = audioBlob.value.type.includes('webm') ? 'webm' :
        audioBlob.value.type.includes('mp4') ? 'mp4' : 'audio';
    const fileName = `recording-${timestamp}.${fileExtension}`;

    // Create File object instead of just appending blob
    const audioFile = new File([audioBlob.value], fileName, {
      type: audioBlob.value.type
    });

    formData.append('AudioFile', audioFile);

    // Optional: Add notes if available
    if (notes.value.trim()) {
      formData.append('Notes', notes.value.trim());
    }

    console.log('Submitting speaking attempt:', {
      topicId: topic.value.id,
      fileName: fileName,
      fileSize: audioBlob.value.size,
      fileType: audioBlob.value.type,
      hasNotes: !!notes.value.trim()
    });

    const response = await submitSpeakingAttempt(formData);
    console.log('Speaking attempt submitted successfully:', response.data);

    // FIXED: Store the result data
    testResult.value = response.data;
    console.log('Speaking test result:', testResult.value);

    currentPhase.value = 'completed';
    stopTimer();
  } catch (err) {
    console.error('Failed to submit speaking attempt:', err);

    // FIXED: Reset submission state on error
    isSubmitted.value = false;

    let errorMessage = 'Failed to submit test. ';
    if (err.response?.status === 413) {
      errorMessage += 'Audio file is too large. Please try recording a shorter response.';
    } else if (err.response?.status === 415) {
      errorMessage += 'Audio format not supported. Please try recording again.';
    } else if (err.response?.data?.message) {
      errorMessage += err.response.data.message;
    } else {
      errorMessage += 'Please check your connection and try again.';
    }

    alert(errorMessage);
  } finally {
    submitting.value = false;
  }
};

const retakeTest = () => {
  // Clean up previous recording
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }

  // Reset all states
  testStarted.value = false;
  currentPhase.value = 'preparation';
  notes.value = '';
  isRecording.value = false;
  isPaused.value = false;
  audioBlob.value = null;
  audioUrl.value = '';
  timeRemaining.value = 0;
  audioChunks.value = [];
  submitting.value = false;
  isSubmitted.value = false; // FIXED: Reset submission state
  testResult.value = null; // FIXED: Clear previous result

  stopTimer();
  cleanupMediaStream();
};

// Lifecycle
onMounted(() => {
  fetchTopic();
});

onUnmounted(() => {
  stopTimer();

  // Clean up audio URL to prevent memory leaks
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }

  // Stop any ongoing recording and cleanup
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop();
  }

  cleanupMediaStream();
});
</script>

<style scoped>
.speaking-test-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 1rem;
}

.test-content {
  max-width: 900px;
  margin: 0 auto;
}

/* Header */
.test-header {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.test-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #0056d2, #007bff);
  color: white;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.test-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
}

.test-subtitle {
  font-size: 1rem;
  color: #64748b;
}

.timer-display {
  background: #f8fafc;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  border: 2px solid #e2e8f0;
}

.timer-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0056d2;
}

/* Instructions */
.instructions-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.instruction-list {
  text-align: left;
  margin: 1rem 0;
}

.instruction-list li {
  margin: 0.5rem 0;
  color: #64748b;
}

/* Phase displays */
.phase-title {
  color: #1e293b;
  font-weight: 600;
}

.phase-timer .timer-large {
  font-size: 2rem;
  font-weight: 700;
  color: #0056d2;
  background: #f0f8ff;
  padding: 0.5rem 1rem;
  border-radius: 10px;
}

/* Topic content */
.topic-text, .topic-text-small {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #0056d2;
  font-weight: 500;
  line-height: 1.6;
}

.topic-text-small {
  font-size: 0.9rem;
  padding: 0.75rem;
}

.topic-description, .topic-description-small {
  font-style: italic;
  padding: 0.5rem;
  background: #f1f3f4;
  border-radius: 6px;
}

.sample-answer {
  margin-top: 2rem;
}

.sample-text {
  background: #e8f5e8;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  text-align: left;
  line-height: 1.6;
  font-style: italic;
}

/* NEW: Feedback and Transcription Styles */
.feedback-section, .transcription-section {
  text-align: left;
}

.feedback-content {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  line-height: 1.7;
}

.feedback-content :deep(h1),
.feedback-content :deep(h2),
.feedback-content :deep(h3),
.feedback-content :deep(h4),
.feedback-content :deep(h5),
.feedback-content :deep(h6) {
  color: #1e293b;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.feedback-content :deep(h1) { font-size: 1.5rem; }
.feedback-content :deep(h2) { font-size: 1.3rem; }
.feedback-content :deep(h3) { font-size: 1.2rem; }
.feedback-content :deep(h4) { font-size: 1.1rem; }

.feedback-content :deep(p) {
  margin-bottom: 1rem;
  color: #374151;
}

.feedback-content :deep(ul),
.feedback-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.feedback-content :deep(li) {
  margin: 0.5rem 0;
  color: #374151;
}

.feedback-content :deep(strong) {
  color: #1e293b;
  font-weight: 600;
}

.feedback-content :deep(code) {
  background: #e5e7eb;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.feedback-content :deep(blockquote) {
  border-left: 4px solid #d1d5db;
  margin: 1rem 0;
  padding-left: 1rem;
  color: #6b7280;
  font-style: italic;
}

.transcription-text {
  background: #fff7ed;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
  font-style: italic;
  line-height: 1.6;
  color: #92400e;
}

/* Notes */
.notes-textarea {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: border-color 0.2s ease;
}

.notes-textarea {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: border-color 0.2s ease;
}

.notes-textarea:focus {
  border-color: #0056d2;
  box-shadow: 0 0 0 3px rgba(0, 86, 210, 0.1);
  outline: none;
}

.notes-reference {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #6c757d;
}

.notes-text {
  background: #ffffff;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  white-space: pre-wrap;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Recording Controls */
.recording-controls {
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.recording-status {
  margin-bottom: 1.5rem;
}

.status-indicator {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 2rem;
  background: #6c757d;
  color: white;
  transition: all 0.3s ease;
}

.status-indicator.recording {
  background: #dc3545;
  animation: pulse 2s infinite;
}

.status-indicator.paused {
  background: #ffc107;
  color: #212529;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
  }
}

.status-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
}

.control-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.control-buttons .btn {
  min-width: 150px;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;
}

.control-buttons .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Audio Playback */
.audio-playback {
  background: #e8f5e8;
  border: 2px solid #d4edda;
  border-radius: 12px;
}

.audio-playback .card-body {
  padding: 1.5rem;
}

.audio-playback audio {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Topic Reference */
.topic-reference {
  background: #fff3cd;
  border: 2px solid #ffeaa7;
  border-radius: 12px;
}

/* Results Phase */
.results-phase {
  text-align: center;
}

.success-icon {
  color: #28a745;
  font-size: 4rem;
  margin-bottom: 1rem;
}

.results-phase h4 {
  color: #1e293b;
  font-weight: 700;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-buttons .btn {
  min-width: 150px;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.action-buttons .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Loading State */
.loading-container {
  padding: 3rem 2rem;
}

.loading-container .spinner-border {
  width: 3rem;
  height: 3rem;
}

.loading-container p {
  font-size: 1.1rem;
  color: #6c757d;
}

/* Error State */
.alert-danger {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 20px rgba(220, 53, 69, 0.15);
}

.alert-danger .fas {
  font-size: 1.2rem;
}

/* Cards */
.card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-body {
  padding: 1.5rem;
}

.card-title {
  color: #1e293b;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* Buttons */
.btn {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
  padding: 0.75rem 1.5rem;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary {
  background: linear-gradient(45deg, #0056d2, #007bff);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(45deg, #004bb5, #0056d2);
}

.btn-danger {
  background: linear-gradient(45deg, #dc3545, #e74c3c);
  color: white;
}

.btn-danger:hover {
  background: linear-gradient(45deg, #c82333, #dc3545);
}

.btn-warning {
  background: linear-gradient(45deg, #ffc107, #f39c12);
  color: #212529;
}

.btn-warning:hover {
  background: linear-gradient(45deg, #e0a800, #ffc107);
}

.btn-success {
  background: linear-gradient(45deg, #28a745, #2ecc71);
  color: white;
}

.btn-success:hover {
  background: linear-gradient(45deg, #218838, #28a745);
}

.btn-dark {
  background: linear-gradient(45deg, #343a40, #495057);
  color: white;
}

.btn-dark:hover {
  background: linear-gradient(45deg, #23272b, #343a40);
}

.btn-outline-primary {
  border: 2px solid #0056d2;
  color: #0056d2;
  background: transparent;
}

.btn-outline-primary:hover {
  background: #0056d2;
  color: white;
}

.btn-outline-secondary {
  border: 2px solid #6c757d;
  color: #6c757d;
  background: transparent;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .speaking-test-container {
    padding: 1rem 0.5rem;
  }

  .test-content {
    max-width: 100%;
  }

  .test-title {
    font-size: 1.5rem;
  }

  .test-icon {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }

  .timer-display {
    margin-top: 1rem;
    text-align: center;
  }

  .phase-timer .timer-large {
    font-size: 1.5rem;
  }

  .control-buttons {
    flex-direction: column;
    align-items: center;
  }

  .control-buttons .btn {
    min-width: 200px;
    margin: 0.25rem 0;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-buttons .btn {
    width: 100%;
    max-width: 250px;
    margin: 0.5rem 0;
  }

  .status-indicator {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .card-body {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .speaking-test-container {
    padding: 0.5rem;
  }

  .test-title {
    font-size: 1.3rem;
  }

  .test-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }

  .phase-timer .timer-large {
    font-size: 1.3rem;
    padding: 0.4rem 0.8rem;
  }

  .notes-textarea {
    font-size: 0.9rem;
  }

  .topic-text, .topic-text-small {
    font-size: 0.9rem;
    padding: 0.75rem;
  }
}

/* Print styles */
@media print {
  .speaking-test-container {
    background: white;
    padding: 1rem;
  }

  .btn,
  .recording-controls,
  .control-buttons,
  .action-buttons {
    display: none;
  }

  .card {
    box-shadow: none;
    border: 1px solid #000;
  }
}

/* Focus styles for accessibility */
.btn:focus,
.notes-textarea:focus {
  outline: 3px solid #0056d2;
  outline-offset: 2px;
}

/* Custom scrollbar */
.notes-textarea::-webkit-scrollbar {
  width: 8px;
}

.notes-textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.notes-textarea::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.notes-textarea::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

</style>