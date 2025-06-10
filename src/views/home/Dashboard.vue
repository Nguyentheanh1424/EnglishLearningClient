<template>
  <div class="project-dashboard">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
          <div class="shape shape-4"></div>
        </div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <i class="fas fa-graduation-cap"></i>
          <span>English Learning Platform</span>
        </div>
        <h1 class="hero-title">Master English with <span class="gradient-text">Interactive Learning</span></h1>
        <p class="hero-subtitle">Comprehensive platform combining speaking, listening, reading, and writing practice with AI-powered feedback</p>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">1000+</div>
            <div class="stat-label">Active Users</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">500+</div>
            <div class="stat-label">Lessons</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">95%</div>
            <div class="stat-label">Success Rate</div>
          </div>
        </div>
        <div class="hero-buttons">
          <button class="btn-primary">
            <i class="fas fa-play"></i>
            Get Started
          </button>
          <button class="btn-secondary">
            <i class="fas fa-info-circle"></i>
            Learn More
          </button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Powerful Features</h2>
          <p class="section-subtitle">Everything you need to master English effectively</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon speaking">
              <i class="fas fa-microphone"></i>
            </div>
            <h3>Speaking Practice</h3>
            <p>AI-powered speech recognition and pronunciation feedback to improve your speaking skills</p>
            <div class="feature-stats">
              <span class="feature-number">200+</span>
              <span class="feature-text">Speaking Topics</span>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon listening">
              <i class="fas fa-headphones"></i>
            </div>
            <h3>Listening Skills</h3>
            <p>Interactive listening exercises with various accents and difficulty levels</p>
            <div class="feature-stats">
              <span class="feature-number">300+</span>
              <span class="feature-text">Audio Materials</span>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon reading">
              <i class="fas fa-book-open"></i>
            </div>
            <h3>Reading Comprehension</h3>
            <p>Diverse reading passages with comprehension questions and vocabulary building</p>
            <div class="feature-stats">
              <span class="feature-number">150+</span>
              <span class="feature-text">Reading Passages</span>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon writing">
              <i class="fas fa-pen"></i>
            </div>
            <h3>Writing Practice</h3>
            <p>Structured writing exercises with automated grammar and style feedback</p>
            <div class="feature-stats">
              <span class="feature-number">100+</span>
              <span class="feature-text">Writing Prompts</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Technology Section -->
    <section class="tech-section">
      <div class="container">
        <div class="tech-content">
          <div class="tech-info">
            <h2>Built with Modern Technology</h2>
            <p>Our platform leverages cutting-edge technology to provide the best learning experience</p>
            <div class="tech-features">
              <div class="tech-item">
                <i class="fas fa-robot"></i>
                <div>
                  <h4>AI-Powered Feedback</h4>
                  <p>Advanced algorithms analyze your performance and provide personalized feedback</p>
                </div>
              </div>
              <div class="tech-item">
                <i class="fas fa-chart-line"></i>
                <div>
                  <h4>Progress Tracking</h4>
                  <p>Detailed analytics to monitor your learning journey and identify areas for improvement</p>
                </div>
              </div>
              <div class="tech-item">
                <i class="fas fa-mobile-alt"></i>
                <div>
                  <h4>Mobile Responsive</h4>
                  <p>Learn anywhere, anytime with our fully responsive design across all devices</p>
                </div>
              </div>
            </div>
          </div>
          <div class="tech-visual">
            <div class="tech-card">
              <div class="code-snippet">
                <div class="code-header">
                  <div class="dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>learning-platform.js</span>
                </div>
                <div class="code-body">
                  <div class="code-line"><span class="keyword">const</span> <span class="variable">learningPlatform</span> = {</div>
                  <div class="code-line">  <span class="property">features</span>: [<span class="string">'speaking'</span>, <span class="string">'listening'</span>],</div>
                  <div class="code-line">  <span class="property">ai</span>: <span class="boolean">true</span>,</div>
                  <div class="code-line">  <span class="property">responsive</span>: <span class="boolean">true</span>,</div>
                  <div class="code-line">  <span class="method">analyze</span>() {</div>
                  <div class="code-line">    <span class="keyword">return</span> <span class="string">'personalized feedback'</span>;</div>
                  <div class="code-line">  }</div>
                  <div class="code-line">};</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-background"></div>
      <div class="container">
        <div class="cta-content">
          <h2>Ready to Start Your English Journey?</h2>
          <p>Join thousands of learners who have improved their English skills with our platform</p>
          <div class="cta-buttons">
            <button class="btn-cta-primary">
              <i class="fas fa-rocket"></i>
              Start Learning Now
            </button>
            <button class="btn-cta-secondary">
              <i class="fas fa-calendar"></i>
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const isVisible = ref(false);

    onMounted(() => {
      // Add scroll animations
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, observerOptions);

      // Observe all feature cards and sections
      document.querySelectorAll('.feature-card, .tech-item, .section-header').forEach(el => {
        observer.observe(el);
      });

      // Floating animation for shapes
      const shapes = document.querySelectorAll('.shape');
      shapes.forEach((shape, index) => {
        shape.style.animationDelay = `${index * 0.5}s`;
      });
    });

    return {
      isVisible
    };
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.project-dashboard {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  color: #2d3748;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  top: 10%;
  right: 30%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  color: white;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 30px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Features Section */
.features-section {
  padding: 100px 0;
  background: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  padding: 40px 100px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(102, 126, 234, 0.1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--feature-color), var(--feature-color-light));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 25px;
  font-size: 30px;
  color: white;
}

.speaking {
  background: linear-gradient(135deg, #ff6b6b, #ffa500);
  --feature-color: #ff6b6b;
  --feature-color-light: #ffa500;
}

.listening {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  --feature-color: #4ecdc4;
  --feature-color-light: #44a08d;
}

.reading {
  background: linear-gradient(135deg, #667eea, #764ba2);
  --feature-color: #667eea;
  --feature-color-light: #764ba2;
}

.writing {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  --feature-color: #f093fb;
  --feature-color-light: #f5576c;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #2d3748;
}

.feature-card p {
  color: #718096;
  margin-bottom: 20px;
  line-height: 1.6;
}

.feature-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.feature-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #2d3748;
}

.feature-text {
  color: #718096;
  font-size: 0.9rem;
}

/* Technology Section */
.tech-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  color: white;
}

.tech-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.tech-info h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 20px;
}

.tech-info p {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.tech-features {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.tech-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  opacity: 0;
  transform: translateX(-50px);
  transition: all 0.6s ease;
}

.tech-item.animate-in {
  opacity: 1;
  transform: translateX(0);
}

.tech-item i {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.tech-item h4 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.tech-item p {
  opacity: 0.8;
  font-size: 0.95rem;
}

.tech-visual {
  display: flex;
  justify-content: center;
}

.tech-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.code-snippet {
  background: #1a202c;
  border-radius: 15px;
  overflow: hidden;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
}

.code-header {
  background: #2d3748;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #4a5568;
}

.dots {
  display: flex;
  gap: 5px;
}

.dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #718096;
}

.dots span:nth-child(1) { background: #ff5f56; }
.dots span:nth-child(2) { background: #ffbd2e; }
.dots span:nth-child(3) { background: #27ca3f; }

.code-body {
  padding: 20px;
}

.code-line {
  margin-bottom: 8px;
  color: #e2e8f0;
}

.keyword { color: #ff79c6; }
.variable { color: #8be9fd; }
.property { color: #50fa7b; }
.string { color: #f1fa8c; }
.boolean { color: #bd93f9; }
.method { color: #ffb86c; }

/* CTA Section */
.cta-section {
  position: relative;
  padding: 100px 0;
  text-align: center;
  color: white;
  overflow: hidden;
}

.cta-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
}

.cta-content {
  position: relative;
  z-index: 10;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 20px;
}

.cta-content p {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-cta-primary, .btn-cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 18px 35px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-cta-primary {
  background: white;
  color: #667eea;
}

.btn-cta-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.btn-cta-secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.btn-cta-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.6);
}

/* Animations */
.animate-in {
  opacity: 1 !important;
  transform: translateX(0) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-stats {
    gap: 20px;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }

  .section-title {
    font-size: 2rem;
  }

  .tech-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>