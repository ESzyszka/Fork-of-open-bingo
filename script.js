// Main application logic
class YouTubeBuzzwordBingo {
  constructor() {
    this.buzzwordManager = new BuzzwordManager();
    this.transcriptionService = new TranscriptionService();
    this.youtubePlayer = null;
    this.isTracking = false;
    this.currentVideoId = null;
    this.transcriptionVisible = false;
    this.winningPattern = null;

    this.initializeElements();
    this.setupEventListeners();
    this.generateNewBingoCard();
    this.checkBrowserSupport();
  }

  initializeElements() {
    // Get DOM elements
    this.elements = {
      urlInput: document.getElementById("youtube-url"),
      startBtn: document.getElementById("start-btn"),
      status: document.getElementById("status"),
      videoSection: document.getElementById("video-section"),
      bingoCard: document.getElementById("bingo-card"),
      markedCount: document.getElementById("marked-count"),
      newCard: document.getElementById("new-card"),
      customInput: document.getElementById("custom-buzzword"),
      addBtn: document.getElementById("add-buzzword"),
      toggleTranscription: document.getElementById("toggle-transcription"),
      resetCounters: document.getElementById("reset-counters"),
      exportResults: document.getElementById("export-results"),
      transcriptionSection: document.getElementById("transcription-section"),
      transcriptionDisplay: document.getElementById("transcription-display"),
    };
  }

  setupEventListeners() {
    // Start button
    this.elements.startBtn.addEventListener("click", () => this.handleStart());

    // Enter key in URL input
    this.elements.urlInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleStart();
      }
    });

    // Custom buzzword input
    this.elements.addBtn.addEventListener("click", () =>
      this.addCustomBuzzword()
    );
    this.elements.customInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addCustomBuzzword();
      }
    });

    // Control buttons
    this.elements.newCard.addEventListener("click", () =>
      this.generateNewBingoCard()
    );
    this.elements.toggleTranscription.addEventListener("click", () =>
      this.toggleTranscriptionDisplay()
    );
    this.elements.resetCounters.addEventListener("click", () =>
      this.resetCounters()
    );
    this.elements.exportResults.addEventListener("click", () =>
      this.exportResults()
    );

    // Transcription service callbacks
    this.transcriptionService.setTranscriptionCallback((data) =>
      this.handleTranscription(data)
    );
    this.transcriptionService.setErrorCallback((error) =>
      this.handleTranscriptionError(error)
    );
  }

  checkBrowserSupport() {
    if (!this.transcriptionService.isSupported) {
      this.updateStatus(
        "Speech recognition not supported in this browser. Transcription features will be limited.",
        "error"
      );
      this.elements.toggleTranscription.disabled = true;
    }
  }

  async handleStart() {
    const url = this.elements.urlInput.value.trim();

    if (!url) {
      this.updateStatus("Please enter a YouTube URL", "error");
      return;
    }

    if (!YouTubeHelper.isValidYouTubeUrl(url)) {
      this.updateStatus("Please enter a valid YouTube URL", "error");
      return;
    }

    const videoId = YouTubeHelper.extractVideoId(url);
    if (!videoId) {
      this.updateStatus("Could not extract video ID from URL", "error");
      return;
    }

    this.currentVideoId = videoId;
    this.updateStatus("Loading video...", "processing");

    try {
      await this.loadYouTubeVideo(videoId);
      this.startTracking();
    } catch (error) {
      console.error("Error loading video:", error);
      this.updateStatus("Error loading video. Please try again.", "error");
    }
  }

  loadYouTubeVideo(videoId) {
    return new Promise((resolve, reject) => {
      // Show video section
      this.elements.videoSection.style.display = "block";

      // Initialize YouTube player
      if (typeof YT !== "undefined" && YT.Player) {
        this.initializeYouTubePlayer(videoId, resolve, reject);
      } else {
        // Wait for YouTube API to load
        window.onYouTubeIframeAPIReady = () => {
          this.initializeYouTubePlayer(videoId, resolve, reject);
        };
      }
    });
  }

  initializeYouTubePlayer(videoId, resolve, reject) {
    try {
      this.youtubePlayer = new YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          enablejsapi: 1,
          origin: window.location.origin,
          autoplay: 0,
        },
        events: {
          onReady: (event) => {
            console.log("YouTube player ready");
            resolve();
          },
          onError: (event) => {
            console.error("YouTube player error:", event.data);
            reject(new Error("YouTube player error: " + event.data));
          },
          onStateChange: (event) => {
            this.handlePlayerStateChange(event);
          },
        },
      });
    } catch (error) {
      reject(error);
    }
  }

  handlePlayerStateChange(event) {
    // YT.PlayerState constants: UNSTARTED (-1), ENDED (0), PLAYING (1), PAUSED (2), BUFFERING (3), CUED (5)
    switch (event.data) {
      case YT.PlayerState.PLAYING:
        if (this.isTracking && this.transcriptionService.isSupported) {
          this.startTranscription();
        }
        break;
      case YT.PlayerState.PAUSED:
      case YT.PlayerState.ENDED:
        this.pauseTranscription();
        break;
    }
  }

  startTracking() {
    this.isTracking = true;
    this.elements.startBtn.textContent = "Tracking...";
    this.elements.startBtn.disabled = true;
    this.updateStatus(
      "Video loaded! Click play to start transcription.",
      "success"
    );

    // Enable control buttons
    this.elements.toggleTranscription.disabled = false;
    this.elements.resetCounters.disabled = false;
    this.elements.exportResults.disabled = false;
  }

  startTranscription() {
    if (!this.transcriptionService.isSupported) {
      this.updateStatus(
        "Starting demo mode with simulated transcription...",
        "processing"
      );
      this.startDemoMode();
      return;
    }

    try {
      this.transcriptionService.startListening();
      this.updateStatus(
        "Transcription active - listening for buzzwords...",
        "success"
      );
    } catch (error) {
      console.error("Error starting transcription:", error);
      this.updateStatus(
        "Error starting transcription: " + error.message,
        "error"
      );
      this.startDemoMode();
    }
  }

  pauseTranscription() {
    if (this.transcriptionService.isListening) {
      this.transcriptionService.stopListening();
    }
  }

  startDemoMode() {
    // Simulate transcription with AI-related content for demonstration
    const demoText = `
            We're excited to announce our revolutionary new AI model that represents a breakthrough in artificial intelligence.
            This cutting-edge transformer architecture with billions of parameters delivers unprecedented performance on benchmarks.
            Our smartest agent yet demonstrates emergent reasoning capabilities and multimodal understanding.
            The model is faster, more accurate, and more reliable than previous versions.
            We've achieved state-of-the-art results through advanced fine-tuning and RLHF techniques.
            This represents the most advanced AI system we've ever built, bringing us closer to AGI.
            The frontier model showcases superior few-shot and zero-shot learning capabilities.
            Our innovative approach to prompt engineering and alignment ensures robust and safe AI.
        `;

    this.transcriptionService.simulateTranscription(demoText, 3000);
    this.updateStatus(
      "Demo mode: Simulating AI launch transcription...",
      "processing"
    );
  }

  handleTranscription(data) {
    if (!data.text) return;

    // Update transcription display
    if (this.transcriptionVisible) {
      this.updateTranscriptionDisplay(data);
    }

    // Detect buzzwords in the transcription
    const detectedWords = this.buzzwordManager.detectBuzzwords(data.text);

    if (detectedWords.length > 0) {
      console.log("Detected buzzwords:", detectedWords);
      // For bingo mode, we could auto-mark squares, but let's keep it manual for now
      // Users can click squares when they hear the words
    }
  }

  handleTranscriptionError(error) {
    console.error("Transcription error:", error);
    this.updateStatus("Transcription error: " + error, "error");
  }

  updateTranscriptionDisplay(data) {
    const display = this.elements.transcriptionDisplay;
    const timestamp = data.timestamp.toLocaleTimeString();
    const className = data.isFinal ? "final" : "interim";

    // Add new transcription with timestamp
    const transcriptionLine = document.createElement("div");
    transcriptionLine.className = `transcription-line ${className}`;
    transcriptionLine.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${data.text}`;

    display.appendChild(transcriptionLine);
    display.scrollTop = display.scrollHeight;

    // Highlight detected buzzwords
    this.highlightBuzzwords(transcriptionLine, data.text);
  }

  highlightBuzzwords(element, text) {
    let highlightedText = text;

    this.buzzwordManager.buzzwords.forEach((data, buzzword) => {
      const regex = new RegExp(
        `\\b(${buzzword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`,
        "gi"
      );
      highlightedText = highlightedText.replace(
        regex,
        '<span class="transcription-highlight">$1</span>'
      );
    });

    // Update the text content while preserving the timestamp
    const timestampSpan = element.querySelector(".timestamp");
    element.innerHTML = timestampSpan.outerHTML + " " + highlightedText;
  }

  generateNewBingoCard() {
    this.buzzwordManager.generateBingoCard();
    this.renderBingoCard();
    this.updateMarkedCount();
    this.clearWinningState();
  }

  renderBingoCard() {
    const card = this.elements.bingoCard;
    card.innerHTML = "";

    const bingoData = this.buzzwordManager.getBingoCard();

    bingoData.forEach((square, index) => {
      const squareElement = this.createBingoSquare(square, index);
      card.appendChild(squareElement);
    });
  }

  createBingoSquare(square, index) {
    const squareElement = document.createElement("div");
    squareElement.className = "bingo-square";
    squareElement.dataset.index = index;
    squareElement.textContent = square.word;

    if (square.isFree) {
      squareElement.classList.add("free");
    }

    if (square.isMarked) {
      squareElement.classList.add("marked");
    }

    // Add click handler for manual marking
    squareElement.addEventListener("click", () => {
      this.handleSquareClick(index);
    });

    return squareElement;
  }

  handleSquareClick(index) {
    const result = this.buzzwordManager.markSquare(index);
    this.updateSquareDisplay(index);
    this.updateMarkedCount();

    if (result.isWin) {
      this.handleBingoWin(result.winningPattern);
    }
  }

  updateSquareDisplay(index) {
    const square = this.elements.bingoCard.children[index];
    const bingoData = this.buzzwordManager.getBingoCard();

    if (bingoData[index].isMarked) {
      square.classList.add("marked");
    } else {
      square.classList.remove("marked");
    }
  }

  updateMarkedCount() {
    this.elements.markedCount.textContent =
      this.buzzwordManager.getMarkedCount();
  }

  handleBingoWin(winningPattern) {
    this.winningPattern = winningPattern;

    // Highlight winning squares
    winningPattern.forEach((index) => {
      const square = this.elements.bingoCard.children[index];
      square.classList.add("winning");
    });

    // Show celebration modal
    this.showBingoWinner();
  }

  showBingoWinner() {
    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "bingo-overlay";

    // Create winner modal
    const winner = document.createElement("div");
    winner.className = "bingo-winner";
    winner.innerHTML = `
            <h2>🎉 BINGO! 🎉</h2>
            <p>Congratulations! You got 5 in a row!</p>
            <button onclick="app.closeBingoWinner()">New Game</button>
        `;

    document.body.appendChild(overlay);
    document.body.appendChild(winner);
  }

  closeBingoWinner() {
    // Remove overlay and modal
    const overlay = document.querySelector(".bingo-overlay");
    const winner = document.querySelector(".bingo-winner");

    if (overlay) overlay.remove();
    if (winner) winner.remove();

    // Generate new card
    this.generateNewBingoCard();
  }

  clearWinningState() {
    // Remove winning classes from all squares
    const squares = this.elements.bingoCard.querySelectorAll(".bingo-square");
    squares.forEach((square) => {
      square.classList.remove("winning");
    });
    this.winningPattern = null;
  }

  addCustomBuzzword() {
    const word = this.elements.customInput.value.trim();

    if (!word) {
      return;
    }

    if (this.buzzwordManager.addCustomBuzzword(word)) {
      this.elements.customInput.value = "";
      this.updateStatus(`Added custom buzzword: "${word}"`, "success");
    } else {
      this.updateStatus(`Buzzword "${word}" already exists`, "error");
    }
  }

  removeBuzzword(word) {
    if (this.buzzwordManager.removeBuzzword(word)) {
      this.renderBuzzwords();
      this.updateTotalCount();
      this.updateStatus(`Removed buzzword: "${word}"`, "success");
    }
  }

  toggleTranscriptionDisplay() {
    this.transcriptionVisible = !this.transcriptionVisible;
    this.elements.transcriptionSection.style.display = this.transcriptionVisible
      ? "block"
      : "none";
    this.elements.toggleTranscription.textContent = this.transcriptionVisible
      ? "Hide Transcription"
      : "Show Transcription";
  }

  resetCounters() {
    if (confirm("Are you sure you want to reset the bingo card?")) {
      this.buzzwordManager.resetBingoCard();
      this.renderBingoCard();
      this.updateMarkedCount();
      this.clearWinningState();
      this.elements.transcriptionDisplay.innerHTML =
        "Transcription will appear here...";
      this.updateStatus("Bingo card reset", "success");
    }
  }

  exportResults() {
    const results = this.buzzwordManager.exportResults();
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    // Create download link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `buzzword-bingo-results-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    // Also copy to clipboard
    navigator.clipboard
      .writeText(dataStr)
      .then(() => {
        this.updateStatus(
          "Results exported and copied to clipboard",
          "success"
        );
      })
      .catch(() => {
        this.updateStatus("Results exported to file", "success");
      });
  }

  updateStatus(message, type = "") {
    this.elements.status.textContent = message;
    this.elements.status.className = "status " + type;
  }
}

// Initialize the application when the page loads
let app;

document.addEventListener("DOMContentLoaded", () => {
  app = new YouTubeBuzzwordBingo();
});

// Make sure YouTube API callback is available globally
window.onYouTubeIframeAPIReady = function () {
  console.log("YouTube API ready");
  if (app && app.currentVideoId) {
    // Re-initialize if we were waiting for the API
    app.loadYouTubeVideo(app.currentVideoId);
  }
};
