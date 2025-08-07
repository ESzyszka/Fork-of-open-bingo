// Transcription service for YouTube videos
class TranscriptionService {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    this.onTranscriptionCallback = null;
    this.onErrorCallback = null;
    this.transcriptionBuffer = "";
    this.lastTranscriptionTime = 0;
    this.audioContext = null;
    this.mediaStream = null;
    this.isSupported = this.checkSupport();
  }

  checkSupport() {
    // Check for Web Speech API support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SpeechRecognition;
  }

  initialize() {
    if (!this.isSupported) {
      throw new Error("Speech recognition is not supported in this browser");
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure recognition settings
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 1;

    // Set up event handlers
    this.recognition.onstart = () => {
      console.log("Speech recognition started");
      this.isListening = true;
    };

    this.recognition.onend = () => {
      console.log("Speech recognition ended");
      this.isListening = false;

      // Restart recognition if it was stopped unexpectedly
      if (this.shouldRestart) {
        setTimeout(() => {
          if (this.shouldRestart) {
            this.startListening();
          }
        }, 1000);
      }
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }

      // Handle specific errors
      switch (event.error) {
        case "network":
          this.handleNetworkError();
          break;
        case "not-allowed":
          this.handlePermissionError();
          break;
        case "no-speech":
          // This is normal, just restart
          break;
        default:
          console.warn("Unhandled speech recognition error:", event.error);
      }
    };

    this.recognition.onresult = (event) => {
      this.handleSpeechResult(event);
    };
  }

  handleSpeechResult(event) {
    let interimTranscript = "";
    let finalTranscript = "";

    // Process all results
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }

    // Update transcription buffer with final results
    if (finalTranscript) {
      this.transcriptionBuffer += finalTranscript;
      this.lastTranscriptionTime = Date.now();

      // Trigger callback with new transcription
      if (this.onTranscriptionCallback) {
        this.onTranscriptionCallback({
          text: finalTranscript.trim(),
          isFinal: true,
          timestamp: new Date(),
        });
      }
    }

    // Also send interim results for real-time display
    if (interimTranscript && this.onTranscriptionCallback) {
      this.onTranscriptionCallback({
        text: interimTranscript.trim(),
        isFinal: false,
        timestamp: new Date(),
      });
    }
  }

  startListening() {
    if (!this.isSupported) {
      throw new Error("Speech recognition is not supported");
    }

    if (!this.recognition) {
      this.initialize();
    }

    if (this.isListening) {
      return;
    }

    try {
      this.shouldRestart = true;
      this.recognition.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error.message);
      }
    }
  }

  stopListening() {
    this.shouldRestart = false;

    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  setTranscriptionCallback(callback) {
    this.onTranscriptionCallback = callback;
  }

  setErrorCallback(callback) {
    this.onErrorCallback = callback;
  }

  getTranscriptionBuffer() {
    return this.transcriptionBuffer;
  }

  clearTranscriptionBuffer() {
    this.transcriptionBuffer = "";
  }

  handleNetworkError() {
    console.warn("Network error in speech recognition");
    // Could implement retry logic here
  }

  handlePermissionError() {
    const errorMsg =
      "Microphone permission denied. Please allow microphone access to use transcription.";
    console.error(errorMsg);
    if (this.onErrorCallback) {
      this.onErrorCallback(errorMsg);
    }
  }

  // Alternative method: Try to capture audio from YouTube video
  async captureVideoAudio(videoElement) {
    try {
      // This approach tries to capture audio from the video element
      // Note: This may not work due to CORS restrictions with YouTube
      if (!videoElement) {
        throw new Error("Video element not found");
      }

      // Create audio context
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Try to create media element source
      const source = this.audioContext.createMediaElementSource(videoElement);

      // Create analyser for audio processing
      const analyser = this.audioContext.createAnalyser();
      source.connect(analyser);
      analyser.connect(this.audioContext.destination);

      console.log("Audio capture setup complete");
      return true;
    } catch (error) {
      console.error("Error capturing video audio:", error);
      return false;
    }
  }

  // Fallback method: Use YouTube's auto-generated captions
  async getYouTubeCaption(videoId) {
    try {
      // This would require a backend service or YouTube API
      // For now, we'll return a placeholder
      console.warn(
        "YouTube caption extraction not implemented - would require backend service"
      );
      return null;
    } catch (error) {
      console.error("Error fetching YouTube captions:", error);
      return null;
    }
  }

  // Method to simulate transcription for testing
  simulateTranscription(testText, intervalMs = 2000) {
    if (!testText) return;

    const words = testText.split(" ");
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex >= words.length) {
        clearInterval(interval);
        return;
      }

      // Send chunks of 3-5 words at a time
      const chunkSize = Math.floor(Math.random() * 3) + 3;
      const chunk = words
        .slice(currentIndex, currentIndex + chunkSize)
        .join(" ");

      if (this.onTranscriptionCallback) {
        this.onTranscriptionCallback({
          text: chunk,
          isFinal: true,
          timestamp: new Date(),
        });
      }

      currentIndex += chunkSize;
    }, intervalMs);

    return interval;
  }
}

// Utility functions for YouTube integration
class YouTubeHelper {
  static extractVideoId(url) {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  static isValidYouTubeUrl(url) {
    return this.extractVideoId(url) !== null;
  }

  static isLiveStream(url) {
    return url.includes("/live/") || url.includes("live=1");
  }

  static createEmbedUrl(videoId, autoplay = false) {
    const params = new URLSearchParams({
      enablejsapi: "1",
      origin: window.location.origin,
    });

    if (autoplay) {
      params.set("autoplay", "1");
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TranscriptionService, YouTubeHelper };
}
