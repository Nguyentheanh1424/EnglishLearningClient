// Audio service to handle audio playback
class AudioService {
  constructor() {
    this.audioElement = null;
    this.isPlaying = false;
    this.isLoading = false;
    this.isReady = false;
    this.currentTime = 0;
    this.duration = 0;
    this.onTimeUpdateCallback = null;
    this.onEndedCallback = null;
    this.onErrorCallback = null;
    this.onReadyCallback = null;
    this.onLoadingCallback = null;
  }

  initialize() {
    if (this.audioElement) {
      this.cleanup();
    }

    this.audioElement = new Audio();
    this.setupEventListeners();
    return true;
  }

  setupEventListeners() {
    if (!this.audioElement) return;

    this.audioElement.addEventListener('loadedmetadata', () => {
      this.duration = this.audioElement.duration;
      this.isReady = true;
      if (this.onReadyCallback) this.onReadyCallback();
    });

    this.audioElement.addEventListener('timeupdate', () => {
      this.currentTime = this.audioElement.currentTime;
      if (this.onTimeUpdateCallback) this.onTimeUpdateCallback(this.currentTime, this.duration);
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      if (this.onEndedCallback) this.onEndedCallback();
    });

    this.audioElement.addEventListener('error', (error) => {
      this.isPlaying = false;
      this.isLoading = false;
      this.isReady = false;
      if (this.onErrorCallback) this.onErrorCallback(error);
    });

    this.audioElement.addEventListener('waiting', () => {
      this.isLoading = true;
      if (this.onLoadingCallback) this.onLoadingCallback(true);
    });

    this.audioElement.addEventListener('canplay', () => {
      this.isLoading = false;
      this.isReady = true;
      if (this.onLoadingCallback) this.onLoadingCallback(false);
    });

    this.audioElement.addEventListener('loadstart', () => {
      this.isLoading = true;
      this.isReady = false;
      if (this.onLoadingCallback) this.onLoadingCallback(true);
    });
  }

  setSource(src) {
    if (!this.audioElement) {
      this.initialize();
    }

    this.isReady = false;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.audioElement.src = src;
    this.audioElement.load();
  }

  async play() {
    if (!this.audioElement) {
      throw new Error('Audio element not initialized');
    }

    if (!this.isReady) {
      // Wait for audio to be ready
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio loading timeout'));
        }, 10000); // 10 second timeout

        const checkReady = () => {
          if (this.isReady) {
            clearTimeout(timeout);
            resolve();
          } else if (this.audioElement.error) {
            clearTimeout(timeout);
            reject(new Error('Audio loading failed'));
          } else {
            setTimeout(checkReady, 100);
          }
        };

        checkReady();
      });
    }

    try {
      this.isLoading = true;
      await this.audioElement.play();
      this.isPlaying = true;
    } catch (error) {
      this.isPlaying = false;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  pause() {
    if (!this.audioElement) return;
    this.audioElement.pause();
    this.isPlaying = false;
  }

  seek(time) {
    if (!this.audioElement || !this.isReady) return;
    this.audioElement.currentTime = time;
  }

  setVolume(volume) {
    if (!this.audioElement) return;
    this.audioElement.volume = Math.max(0, Math.min(1, volume));
  }

  cleanup() {
    if (this.audioElement) {
      this.pause();
      this.audioElement.removeEventListener('loadedmetadata', () => {});
      this.audioElement.removeEventListener('timeupdate', () => {});
      this.audioElement.removeEventListener('ended', () => {});
      this.audioElement.removeEventListener('error', () => {});
      this.audioElement.removeEventListener('waiting', () => {});
      this.audioElement.removeEventListener('canplay', () => {});
      this.audioElement.removeEventListener('loadstart', () => {});
      this.audioElement = null;
    }
    this.isPlaying = false;
    this.isLoading = false;
    this.isReady = false;
    this.currentTime = 0;
    this.duration = 0;
  }

  // Callback setters
  onTimeUpdate(callback) {
    this.onTimeUpdateCallback = callback;
  }

  onEnded(callback) {
    this.onEndedCallback = callback;
  }

  onError(callback) {
    this.onErrorCallback = callback;
  }

  onReady(callback) {
    this.onReadyCallback = callback;
  }

  onLoading(callback) {
    this.onLoadingCallback = callback;
  }
}

// Create a singleton instance
const audioService = new AudioService();

export default audioService; 