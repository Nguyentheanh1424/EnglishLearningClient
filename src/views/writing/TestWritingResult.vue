<template>
  <div class="results-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading your results...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p>{{ error }}</p>
      <router-link to="/skills" class="btn btn-primary">
        ← Back to Skills
      </router-link>
    </div>

    <!-- Results Content -->
    <div v-else-if="result" class="results-content">
      <!-- Header Section -->
      <div class="header-section">
        <div class="success-badge">
          <div class="check-icon">✓</div>
          <div class="header-text">
            <h1>Test Completed!</h1>
            <p>{{ result.promptTitle }}</p>
          </div>
        </div>

        <div class="header-meta">
          <span class="meta-item">
            📅 {{ formatDate(result.submittedAt) }}
          </span>
          <span class="meta-item">
            👤 {{ result.userId }}
          </span>
        </div>

        <div class="header-actions">
          <button @click="printResult" class="btn btn-secondary">
            🖨️ Print
          </button>
          <router-link to="/skills" class="btn btn-primary">
            ← Back to Skills
          </router-link>
        </div>
      </div>

      <!-- Overall Score -->
      <div v-if="parsedFeedback.overallScore" class="score-section">
        <h2>Overall Band Score</h2>
        <div class="score-display">
          <div class="score-circle" :class="getScoreClass(parsedFeedback.overallScore)">
            <span class="score-number">{{ parsedFeedback.overallScore }}</span>
            <span class="score-text">Band</span>
          </div>
          <div class="score-info">
            <h3>{{ getScoreDescription(parsedFeedback.overallScore) }}</h3>
            <p>{{ getScoreDetails(parsedFeedback.overallScore) }}</p>
          </div>
        </div>
      </div>

      <!-- Criteria Scores -->
      <div v-if="parsedFeedback.criteriaScores?.length" class="criteria-section">
        <h2>Detailed Assessment</h2>
        <div class="criteria-grid">
          <div
              v-for="criteria in parsedFeedback.criteriaScores"
              :key="criteria.name"
              class="criteria-card"
          >
            <div class="criteria-score" :class="getScoreClass(criteria.score)">
              {{ criteria.score }}
            </div>
            <h4>{{ criteria.name }}</h4>
            <p>{{ criteria.description }}</p>
          </div>
        </div>
      </div>

      <!-- Your Essay -->
      <div class="essay-section">
        <div class="section-header">
          <h2>Your Essay</h2>
          <div class="essay-stats">
            <span>{{ getWordCount(result.content) }} words</span>
            <span>{{ result.content.length }} characters</span>
          </div>
        </div>
        <div class="essay-content">
          {{ cleanedContent }}
        </div>
      </div>

      <!-- Feedback -->
      <div v-if="result.feedback" class="feedback-section">
        <h2>Detailed Feedback</h2>
        <div class="feedback-content" v-html="formattedFeedback"></div>
      </div>

      <!-- Suggestions -->
      <div v-if="parsedFeedback.suggestions?.length" class="suggestions-section">
        <h2>💡 Tips for Improvement</h2>
        <div class="suggestions-list">
          <div
              v-for="(suggestion, index) in parsedFeedback.suggestions"
              :key="index"
              class="suggestion-item"
          >
            <div class="suggestion-number">{{ index + 1 }}</div>
            <div class="suggestion-text">
              <h4>{{ suggestion.title }}</h4>
              <p>{{ suggestion.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Model Answer -->
      <div v-if="parsedFeedback.modelAnswer" class="model-section">
        <h2>🏆 Model Answer (Band {{ parsedFeedback.modelAnswer.band }})</h2>
        <div class="model-content">
          <div class="model-text">{{ parsedFeedback.modelAnswer.content }}</div>
          <div class="model-stats">
            <span>{{ parsedFeedback.modelAnswer.wordCount }} words</span>
            <span>Band {{ parsedFeedback.modelAnswer.band }}</span>
          </div>
          <div v-if="parsedFeedback.modelAnswer.explanation" class="model-explanation">
            <h4>Why this scores Band {{ parsedFeedback.modelAnswer.band }}:</h4>
            <div v-html="parsedFeedback.modelAnswer.explanation"></div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions-section">
        <button @click="takeAnotherTest" class="btn btn-primary btn-large">
          🔄 Take Another Test
        </button>
        <button @click="reviewTest" class="btn btn-secondary btn-large">
          👁️ Review Test
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getWritingSubmissionById } from '@/api/writing.js';
import MarkdownIt from 'markdown-it';

const route = useRoute();
const router = useRouter();

// Initialize markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// State
const result = ref(null);
const loading = ref(true);
const error = ref('');

// Fetch result data
const fetchResult = async () => {
  try {
    loading.value = true;
    error.value = '';

    const submissionId = route.params.id || route.query.submissionId;
    if (!submissionId) {
      throw new Error('No submission ID provided');
    }

    const response = await getWritingSubmissionById(submissionId);
    result.value = response.data;

  } catch (err) {
    error.value = 'Failed to load test results. Please try again.';
    console.error('Error fetching result:', err);
  } finally {
    loading.value = false;
  }
};

// Parse feedback content
const parsedFeedback = computed(() => {
  if (!result.value?.feedback) return {};

  const feedback = result.value.feedback;
  const parsed = {
    overallScore: null,
    criteriaScores: [],
    suggestions: [],
    modelAnswer: null
  };

  // Extract overall band score
  const overallMatch = feedback.match(/Overall Band Score.*?(\d(?:\.\d)?)/i);
  if (overallMatch) {
    parsed.overallScore = parseFloat(overallMatch[1]);
  }

  // Extract criteria scores
  const criteriaRegex = /### \d+\.\s*(.*?)\n.*?Band Score:\s*(\d(?:\.\d)?)\**(.*?)(?=###|$)/gs;
  let criteriaMatch;
  while ((criteriaMatch = criteriaRegex.exec(feedback)) !== null) {
    const name = criteriaMatch[1].trim();
    const score = parseFloat(criteriaMatch[2]);
    const description = criteriaMatch[3].replace(/\*.*?:/g, '').trim();

    parsed.criteriaScores.push({
      name,
      score,
      description: description.substring(0, 100) + (description.length > 100 ? '...' : '')
    });
  }

  // Extract suggestions
  const suggestionsMatch = feedback.match(/### \d+\.\s*Suggestions for Improvement(.*?)(?=###|$)/s);
  if (suggestionsMatch) {
    const suggestionsList = suggestionsMatch[1].match(/\*\s*(.*?):/g);
    if (suggestionsList) {
      suggestionsList.forEach(item => {
        const title = item.replace(/\*\s*/, '').replace(':', '').trim();
        parsed.suggestions.push({
          title,
          description: 'Focus on improving this aspect of your writing.'
        });
      });
    }
  }

  // Extract model answer
  const modelMatch = feedback.match(/### \d+\.\s*Model Answer.*?\n\n(.*?)(?:\(\d+ words\))/s);
  if (modelMatch) {
    const content = modelMatch[1].trim();
    const wordCount = content.split(/\s+/).length;
    const bandMatch = feedback.match(/Band (\d-\d)/);

    parsed.modelAnswer = {
      content,
      wordCount,
      band: bandMatch ? bandMatch[1] : '8-9',
      explanation: null
    };

    // Extract explanation
    const explanationMatch = feedback.match(/Why this is Band.*?:(.*?)$/s);
    if (explanationMatch) {
      parsed.modelAnswer.explanation = explanationMatch[1].trim();
    }
  }

  return parsed;
});

// Format feedback for display
const formattedFeedback = computed(() => {
  if (!result.value?.feedback) return '';

  // Clean and prepare markdown content
  let feedbackContent = result.value.feedback
      // Convert ### headings to proper markdown
      .replace(/###\s*(\d+\.?\s*.*)/g, '## $1')
      // Ensure proper line breaks before headings
      .replace(/(?<!^|\n)\n##/g, '\n\n##')
      // Clean up extra asterisks and formatting
      .replace(/\*{3,}/g, '**')
      // Ensure proper spacing around bold text
      .replace(/\*\*([^*]+)\*\*/g, '**$1**');

  // Render markdown to HTML
  return md.render(feedbackContent);
});

// Clean essay content
const cleanedContent = computed(() => {
  if (!result.value?.content) return '';

  let content = result.value.content;

  const patterns = [
    /Write a short essay.*?Check your grammar and spelling/g,
    /Writing Tips:.*?Check your grammar and spelling/g
  ];

  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches && matches.length > 1) {
      content = content.replace(pattern, matches[0]);
    }
  });

  return content.trim();
});

// Utility functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getWordCount = (content) => {
  return content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
};

const getScoreClass = (score) => {
  if (score >= 7) return 'score-excellent';
  if (score >= 6) return 'score-good';
  if (score >= 5) return 'score-average';
  return 'score-poor';
};

const getScoreDescription = (score) => {
  if (score >= 8) return 'Excellent';
  if (score >= 7) return 'Very Good';
  if (score >= 6) return 'Good';
  if (score >= 5) return 'Average';
  return 'Needs Improvement';
};

const getScoreDetails = (score) => {
  if (score >= 8) return 'Outstanding performance with minimal errors';
  if (score >= 7) return 'Good performance with few errors';
  if (score >= 6) return 'Competent with some errors';
  if (score >= 5) return 'Modest with frequent errors';
  return 'Limited performance';
};

// Actions
const printResult = () => {
  window.print();
};

const takeAnotherTest = () => {
  router.push('/skills');
};

const reviewTest = () => {
  if (result.value?.promptId) {
    router.push(`/writing/${result.value.promptId}`);
  }
};

// Lifecycle
onMounted(() => {
  fetchResult();
});
</script>

<style scoped>
/* Base Styles */
.results-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #333;
}

/* Loading & Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Header Section */
.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.success-badge {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.check-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 1rem;
}

.header-text h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.header-text p {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
}

.header-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.meta-item {
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Score Section */
.score-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  text-align: center;
}

.score-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
}

.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.score-excellent { background: linear-gradient(45deg, #10b981, #059669); }
.score-good { background: linear-gradient(45deg, #3b82f6, #2563eb); }
.score-average { background: linear-gradient(45deg, #f59e0b, #d97706); }
.score-poor { background: linear-gradient(45deg, #ef4444, #dc2626); }

.score-number {
  font-size: 2rem;
  line-height: 1;
}

.score-text {
  font-size: 0.8rem;
  opacity: 0.9;
}

.score-info {
  text-align: left;
}

.score-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.score-info p {
  margin: 0;
  color: #666;
}

/* Criteria Section */
.criteria-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.criteria-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.criteria-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.2s ease;
}

.criteria-card:hover {
  transform: translateY(-2px);
}

.criteria-card .criteria-score {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.criteria-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #333;
}

.criteria-card p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

/* Essay Section */
.essay-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.essay-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.essay-content {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  white-space: pre-wrap;
  line-height: 1.7;
  max-height: 400px;
  overflow-y: auto;
}

/* Feedback Section */
.feedback-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.feedback-content {
  margin-top: 1.5rem;
  line-height: 1.7;
}

.feedback-content h2 {
  color: #007bff;
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.feedback-content h2:first-child {
  margin-top: 0;
}

.feedback-content p {
  margin-bottom: 1rem;
}

.feedback-content strong {
  color: #333;
  font-weight: 600;
}

.feedback-content ul,
.feedback-content ol {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.feedback-content li {
  margin-bottom: 0.5rem;
}

.feedback-content blockquote {
  background: #f8f9fa;
  border-left: 4px solid #007bff;
  margin: 1rem 0;
  padding: 1rem 1.5rem;
  border-radius: 0 8px 8px 0;
}

.feedback-content code {
  background: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

/* Suggestions Section */
.suggestions-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.suggestions-list {
  margin-top: 1.5rem;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.suggestion-number {
  width: 24px;
  height: 24px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  flex-shrink: 0;
}

.suggestion-text h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #333;
}

.suggestion-text p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* Model Section */
.model-section {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #10b981;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.model-content {
  margin-top: 1.5rem;
}

.model-text {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  white-space: pre-wrap;
  line-height: 1.7;
  margin-bottom: 1rem;
}

.model-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #059669;
  font-weight: 500;
  margin-bottom: 1rem;
}

.model-explanation {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

.model-explanation h4 {
  margin: 0 0 1rem 0;
  color: #059669;
}

/* Actions Section */
.actions-section {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Common Section Titles */
h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

/* Responsive Design */
@media (max-width: 768px) {
  .results-page {
    padding: 1rem 0.5rem;
  }

  .score-display {
    flex-direction: column;
    gap: 1rem;
  }

  .score-info {
    text-align: center;
  }

  .criteria-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .essay-stats {
    flex-direction: column;
    gap: 0.5rem;
  }

  .actions-section {
    flex-direction: column;
  }

  .header-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

/* Print Styles */
@media print {
  .header-actions,
  .actions-section {
    display: none !important;
  }

  .results-page {
    max-width: none;
    padding: 0;
  }

  * {
    box-shadow: none !important;
  }
}
</style>