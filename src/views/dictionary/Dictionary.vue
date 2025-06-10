<template>
  <div class="dictionary-container">
    <!-- Hero Section -->
    <section class="dictionary-hero">
      <div class="hero-background">
        <div class="floating-elements">
          <div class="element element-1"></div>
          <div class="element element-2"></div>
          <div class="element element-3"></div>
        </div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title">English <span class="gradient-text">Dictionary</span></h1>
        <p class="hero-subtitle">Discover meanings, pronunciations, and examples of English words</p>
      </div>
    </section>

    <!-- Search Section -->
    <section class="search-section">
      <div class="container">
        <div class="search-card">
          <div class="search-wrapper">
            <div class="search-input-container">
              <div class="search-input-group">
                <i class="fas fa-search search-icon"></i>
                <input
                    v-model="searchWord"
                    type="text"
                    class="search-input"
                    placeholder="Enter a word to explore..."
                    @keyup.enter="handleSearch"
                    :disabled="isLoading"
                />
                <button
                    v-if="searchWord"
                    @click="clearSearch"
                    class="clear-btn"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <button
                  @click="handleSearch"
                  :disabled="isLoading || !searchWord.trim()"
                  class="search-btn"
              >
                <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-search"></i>
                <span>{{ isLoading ? 'Searching...' : 'Search' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Results Section -->
    <section class="results-section">
      <div class="container">
        <!-- Error Message -->
        <div v-if="error" class="error-card">
          <div class="error-content">
            <i class="fas fa-exclamation-triangle error-icon"></i>
            <div class="error-text">
              <h4>Oops! Something went wrong</h4>
              <p>{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-card">
          <div class="loading-content">
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
            <h4>Searching for your word...</h4>
            <p>Please wait while we find the best definition</p>
          </div>
        </div>

        <!-- Word Results -->
        <div v-if="result && !isLoading" class="result-card">
          <!-- Word Header -->
          <div class="word-header">
            <div class="word-main-info">
              <h1 class="word-title">{{ result.word }}</h1>
              <div v-if="result.phonetic" class="phonetic-section">
                <span class="phonetic-text">{{ result.phonetic }}</span>
                <button
                    v-if="getAudioUrl()"
                    @click="playAudio"
                    class="audio-btn"
                >
                  <i class="fas fa-volume-up"></i>
                  <span>Listen</span>
                </button>
              </div>
            </div>
            <div class="word-decoration">
              <div class="word-icon">
                <i class="fas fa-book-open"></i>
              </div>
            </div>
          </div>

          <!-- Word Meanings -->
          <div class="meanings-container">
            <div
                v-for="(meaning, index) in result.meanings"
                :key="index"
                class="meaning-section"
            >
              <!-- Part of Speech -->
              <div class="part-of-speech-header">
                <div class="part-of-speech-badge">
                  <i :class="getPartOfSpeechIcon(meaning.partOfSpeech)"></i>
                  <span>{{ meaning.partOfSpeech }}</span>
                </div>
                <div class="section-divider"></div>
              </div>

              <!-- Definitions -->
              <div class="definitions-list">
                <div
                    v-for="(def, defIndex) in meaning.definitions"
                    :key="defIndex"
                    class="definition-item"
                >
                  <div class="definition-number">{{ defIndex + 1 }}</div>
                  <div class="definition-content">
                    <p class="definition-text">{{ def.definition }}</p>

                    <!-- Example -->
                    <div v-if="def.example" class="example-section">
                      <div class="example-card">
                        <i class="fas fa-quote-left quote-icon"></i>
                        <p class="example-text">{{ def.example }}</p>
                      </div>
                    </div>

                    <!-- Synonyms & Antonyms -->
                    <div class="word-relations">
                      <div v-if="def.synonyms && def.synonyms.length" class="synonyms-section">
                        <div class="relation-header">
                          <i class="fas fa-plus-circle"></i>
                          <span>Synonyms</span>
                        </div>
                        <div class="relation-tags">
                          <span
                              v-for="(synonym, synIndex) in def.synonyms.slice(0, 5)"
                              :key="synIndex"
                              class="relation-tag synonyms-tag"
                          >
                            {{ synonym }}
                          </span>
                        </div>
                      </div>

                      <div v-if="def.antonyms && def.antonyms.length" class="antonyms-section">
                        <div class="relation-header">
                          <i class="fas fa-minus-circle"></i>
                          <span>Antonyms</span>
                        </div>
                        <div class="relation-tags">
                          <span
                              v-for="(antonym, antIndex) in def.antonyms.slice(0, 5)"
                              :key="antIndex"
                              class="relation-tag antonyms-tag"
                          >
                            {{ antonym }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Etymology -->
          <div v-if="result.origin" class="etymology-section">
            <div class="etymology-card">
              <div class="etymology-header">
                <i class="fas fa-history"></i>
                <h3>Etymology</h3>
              </div>
              <p class="etymology-text">{{ result.origin }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Hidden Audio Element -->
    <audio ref="audioRef" preload="auto" v-if="getAudioUrl()">
      <source :src="getAudioUrl()" type="audio/mpeg" />
    </audio>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// State variables
const searchWord = ref<string>('');
const result = ref<any>(null);
const error = ref<string | null>(null);
const isLoading = ref<boolean>(false);
const audioRef = ref<HTMLAudioElement | null>(null);

// Function to fetch word data from Dictionary API
const fetchWord = async () => {
  if (!searchWord.value.trim()) {
    error.value = 'Please enter a word to search.';
    return;
  }

  isLoading.value = true;
  error.value = null;
  result.value = null;

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord.value.trim()}`);

    if (response.ok) {
      const data = await response.json();
      result.value = data[0]; // API returns an array, take the first entry
    } else {
      error.value = 'Word not found. Please try another word.';
    }
  } catch (err) {
    error.value = 'An error occurred while fetching the word. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

// Handle form submission (Enter key or button click)
const handleSearch = () => {
  fetchWord();
};

// Clear search input and results
const clearSearch = () => {
  searchWord.value = '';
  result.value = null;
  error.value = null;
};

// Get audio URL
const getAudioUrl = () => {
  if (result.value?.phonetics) {
    const phoneticWithAudio = result.value.phonetics.find((p: any) => p.audio);
    return phoneticWithAudio?.audio;
  }
  return null;
};

// Play audio
const playAudio = () => {
  if (audioRef.value) {
    audioRef.value.play().catch(console.error);
  }
};

// Get part of the speech icon
const getPartOfSpeechIcon = (partOfSpeech: string) => {
  const icons = {
    'noun': 'fas fa-cube',
    'verb': 'fas fa-running',
    'adjective': 'fas fa-palette',
    'adverb': 'fas fa-tachometer-alt',
    'pronoun': 'fas fa-user',
    'preposition': 'fas fa-arrows-alt',
    'conjunction': 'fas fa-link',
    'interjection': 'fas fa-exclamation',
    'exclamation': 'fas fa-exclamation'
  };
  return icons[partOfSpeech.toLowerCase()] || 'fas fa-tag';
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dictionary-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  color: #2d3748;
  min-height: 100vh;
  background: #f8fafc;
}

/* Hero Section */
.dictionary-hero {
  position: relative;
  padding: 80px 0 60px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
}

.element {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 8s ease-in-out infinite;
}

.element-1 {
  width: 60px;
  height: 60px;
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.element-2 {
  width: 80px;
  height: 80px;
  top: 60%;
  right: 20%;
  animation-delay: 2s;
}

.element-3 {
  width: 40px;
  height: 40px;
  bottom: 30%;
  left: 70%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(180deg); }
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
}

.gradient-text {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 0;
}

/* Search Section */
.search-section {
  padding: 40px 0;
  background: linear-gradient(to bottom, #667eea, #f8fafc);
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.1);
  transform: translateY(-30px);
}

.search-input-container {
  display: flex;
  gap: 20px;
  align-items: center;
}

.search-input-group {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 20px;
  color: #718096;
  font-size: 18px;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 18px 20px 18px 55px;
  border: 2px solid #e2e8f0;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-btn {
  position: absolute;
  right: 15px;
  background: #e2e8f0;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #718096;
}

.clear-btn:hover {
  background: #cbd5e0;
  color: #4a5568;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 30px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.search-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Results Section */
.results-section {
  padding: 0 0 80px;
}

/* Error Card */
.error-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-left: 5px solid #f56565;
  margin-bottom: 30px;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.error-icon {
  font-size: 30px;
  color: #f56565;
}

.error-text h4 {
  color: #2d3748;
  margin-bottom: 8px;
  font-weight: 700;
}

.error-text p {
  color: #718096;
  margin: 0;
}

/* Loading Card */
.loading-card {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-bottom: 30px;
}

.loading-content h4 {
  color: #2d3748;
  margin-bottom: 10px;
  font-weight: 700;
}

.loading-content p {
  color: #718096;
  margin: 0;
}

.loading-spinner {
  margin-bottom: 30px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Result Card */
.result-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

/* Word Header */
.word-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.word-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 15px;
  text-transform: capitalize;
}

.phonetic-section {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.phonetic-text {
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 25px;
  font-family: 'Monaco', monospace;
}

.audio-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.audio-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.word-decoration {
  display: flex;
  align-items: center;
}

.word-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}

/* Meanings */
.meanings-container {
  padding: 40px;
}

.meaning-section {
  margin-bottom: 40px;
}

.meaning-section:last-child {
  margin-bottom: 0;
}

.part-of-speech-header {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  gap: 20px;
}

.part-of-speech-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 14px;
  text-transform: capitalize;
}

.section-divider {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, #667eea, transparent);
  border-radius: 1px;
}

.definitions-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.definition-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.definition-number {
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 2px;
}

.definition-content {
  flex: 1;
}

.definition-text {
  font-size: 16px;
  color: #2d3748;
  margin-bottom: 15px;
  line-height: 1.7;
  font-weight: 500;
}

/* Example Section */
.example-section {
  margin-bottom: 20px;
}

.example-card {
  background: #f8fafc;
  border-left: 4px solid #667eea;
  padding: 20px;
  border-radius: 0 15px 15px 0;
  position: relative;
}

.quote-icon {
  color: #667eea;
  font-size: 14px;
  margin-right: 10px;
}

.example-text {
  font-style: italic;
  color: #4a5568;
  margin: 0;
  line-height: 1.6;
}

/* Word Relations */
.word-relations {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.synonyms-section, .antonyms-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.relation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.synonyms-section .relation-header {
  color: #38a169;
}

.antonyms-section .relation-header {
  color: #e53e3e;
}

.relation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.relation-tag {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.synonyms-tag {
  background: rgba(56, 161, 105, 0.1);
  color: #38a169;
  border: 1px solid rgba(56, 161, 105, 0.2);
}

.synonyms-tag:hover {
  background: rgba(56, 161, 105, 0.2);
  transform: translateY(-2px);
}

.antonyms-tag {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
  border: 1px solid rgba(229, 62, 62, 0.2);
}

.antonyms-tag:hover {
  background: rgba(229, 62, 62, 0.2);
  transform: translateY(-2px);
}

/* Etymology */
.etymology-section {
  margin-top: 40px;
  border-top: 2px solid #e2e8f0;
  padding-top: 30px;
}

.etymology-card {
  background: #f8fafc;
  border-radius: 15px;
  padding: 25px;
  border: 1px solid #e2e8f0;
}

.etymology-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.etymology-header i {
  color: #667eea;
  font-size: 18px;
}

.etymology-header h3 {
  color: #2d3748;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}

.etymology-text {
  color: #4a5568;
  line-height: 1.7;
  margin: 0;
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .search-card {
    padding: 30px 20px;
    margin: 0 20px;
    transform: translateY(-20px);
  }

  .search-input-container {
    flex-direction: column;
    gap: 15px;
  }

  .word-header {
    padding: 30px 20px;
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .word-title {
    font-size: 2rem;
  }

  .meanings-container {
    padding: 30px 20px;
  }

  .definition-item {
    flex-direction: column;
    gap: 15px;
  }

  .definition-number {
    align-self: flex-start;
  }

  .part-of-speech-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .section-divider {
    display: none;
  }

  .word-relations {
    gap: 20px;
  }

  .relation-tags {
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }

  .search-card {
    margin: 0 15px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .phonetic-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>