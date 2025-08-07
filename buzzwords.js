// Predefined buzzwords for AI model launches
const DEFAULT_BUZZWORDS = [
  // User-specified examples
  "excited",
  "frontier",
  "smartest",
  "agent",
  "accurate",
  "faster",
  "reliable",
  "most advanced",
  "agi",
  "benchmark",

  // Common AI/ML technical terms
  "transformer",
  "neural network",
  "deep learning",
  "machine learning",
  "artificial intelligence",
  "parameters",
  "tokens",
  "inference",
  "training",
  "fine-tuning",
  "rlhf",
  "reinforcement learning",
  "few-shot",
  "zero-shot",
  "prompt engineering",
  "hallucination",
  "latency",
  "throughput",
  "multimodal",
  "reasoning",
  "emergent",
  "scaling",
  "alignment",

  // Marketing and performance buzzwords
  "revolutionary",
  "breakthrough",
  "game-changing",
  "unprecedented",
  "next-generation",
  "cutting-edge",
  "state-of-the-art",
  "industry-leading",
  "world-class",
  "superior",
  "advanced",
  "innovative",
  "groundbreaking",
  "disruptive",
  "transformative",
  "powerful",
  "robust",
  "scalable",
  "efficient",
  "optimized",

  // Capability and feature terms
  "understand",
  "generate",
  "create",
  "analyze",
  "process",
  "interpret",
  "learn",
  "adapt",
  "improve",
  "enhance",
  "optimize",
  "automate",
  "intelligent",
  "smart",
  "autonomous",
  "cognitive",
  "contextual",
  "personalized",
  "customized",
  "seamless",
  "intuitive",

  // Comparison and superlative terms
  "better",
  "best",
  "superior",
  "outperform",
  "exceed",
  "surpass",
  "leading",
  "top",
  "first",
  "only",
  "unique",
  "exclusive",
  "proprietary",
  "novel",
  "new",
  "latest",
  "modern",
  "future",
  "next-level",
];

// Bingo card management class
class BuzzwordManager {
  constructor() {
    this.buzzwords = new Map();
    this.customBuzzwords = new Set();
    this.bingoCard = [];
    this.markedSquares = new Set();
    this.initializeDefaultBuzzwords();
  }

  initializeDefaultBuzzwords() {
    DEFAULT_BUZZWORDS.forEach((word) => {
      this.buzzwords.set(word.toLowerCase(), {
        word: word,
        count: 0,
        isCustom: false,
        lastDetected: null,
      });
    });
  }

  addCustomBuzzword(word) {
    if (!word || typeof word !== "string") return false;

    const normalizedWord = word.toLowerCase().trim();
    if (normalizedWord.length === 0) return false;

    if (!this.buzzwords.has(normalizedWord)) {
      this.buzzwords.set(normalizedWord, {
        word: word.trim(),
        count: 0,
        isCustom: true,
        lastDetected: null,
      });
      this.customBuzzwords.add(normalizedWord);
      return true;
    }
    return false;
  }

  removeBuzzword(word) {
    const normalizedWord = word.toLowerCase();
    const buzzwordData = this.buzzwords.get(normalizedWord);

    if (buzzwordData && buzzwordData.isCustom) {
      this.buzzwords.delete(normalizedWord);
      this.customBuzzwords.delete(normalizedWord);
      return true;
    }
    return false;
  }

  incrementCount(word) {
    const normalizedWord = word.toLowerCase();
    const buzzwordData = this.buzzwords.get(normalizedWord);

    if (buzzwordData) {
      buzzwordData.count++;
      buzzwordData.lastDetected = new Date();
      return buzzwordData.count;
    }
    return 0;
  }

  getCount(word) {
    const normalizedWord = word.toLowerCase();
    const buzzwordData = this.buzzwords.get(normalizedWord);
    return buzzwordData ? buzzwordData.count : 0;
  }

  getAllBuzzwords() {
    return Array.from(this.buzzwords.values()).sort((a, b) => {
      // Sort by count (descending), then alphabetically
      if (a.count !== b.count) {
        return b.count - a.count;
      }
      return a.word.localeCompare(b.word);
    });
  }

  getTotalCount() {
    return Array.from(this.buzzwords.values()).reduce(
      (total, data) => total + data.count,
      0
    );
  }

  resetCounts() {
    this.buzzwords.forEach((data) => {
      data.count = 0;
      data.lastDetected = null;
    });
  }

  detectBuzzwords(text) {
    if (!text || typeof text !== "string") return [];

    const detectedWords = [];
    const normalizedText = text.toLowerCase();

    // Split text into words and phrases
    const words = normalizedText.match(/\b\w+(?:\s+\w+)*\b/g) || [];

    this.buzzwords.forEach((data, buzzword) => {
      // Check for exact word matches and phrase matches
      const regex = new RegExp(
        `\\b${buzzword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "gi"
      );
      const matches = text.match(regex);

      if (matches) {
        matches.forEach(() => {
          this.incrementCount(buzzword);
          detectedWords.push({
            word: data.word,
            count: data.count,
            position: text.toLowerCase().indexOf(buzzword),
          });
        });
      }
    });

    return detectedWords;
  }

  exportResults() {
    const results = {
      timestamp: new Date().toISOString(),
      totalCount: this.getTotalCount(),
      buzzwords: this.getAllBuzzwords().filter((data) => data.count > 0),
      customBuzzwords: Array.from(this.customBuzzwords),
    };

    return results;
  }

  importResults(data) {
    try {
      if (data.buzzwords) {
        data.buzzwords.forEach((item) => {
          const normalizedWord = item.word.toLowerCase();
          if (this.buzzwords.has(normalizedWord)) {
            this.buzzwords.get(normalizedWord).count = item.count || 0;
          }
        });
      }

      if (data.customBuzzwords) {
        data.customBuzzwords.forEach((word) => {
          this.addCustomBuzzword(word);
        });
      }

      return true;
    } catch (error) {
      console.error("Error importing results:", error);
      return false;
    }
  }

  generateBingoCard() {
    // Get all available buzzwords
    const allWords = Array.from(this.buzzwords.values());

    // Shuffle and select 24 words (25th square is FREE)
    const shuffled = allWords.sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, 24);

    // Create 5x5 grid with FREE space in center
    this.bingoCard = [];
    for (let i = 0; i < 25; i++) {
      if (i === 12) {
        // Center square (index 12 in 5x5 grid)
        this.bingoCard.push({
          word: "FREE",
          isFree: true,
          isMarked: true,
        });
      } else {
        const wordIndex = i < 12 ? i : i - 1; // Adjust for FREE space
        this.bingoCard.push({
          word: selectedWords[wordIndex]?.word || "Empty",
          isFree: false,
          isMarked: false,
        });
      }
    }

    // Mark the FREE space as marked
    this.markedSquares.clear();
    this.markedSquares.add(12);

    return this.bingoCard;
  }

  markSquare(index) {
    if (index >= 0 && index < 25 && this.bingoCard[index]) {
      this.bingoCard[index].isMarked = !this.bingoCard[index].isMarked;

      if (this.bingoCard[index].isMarked) {
        this.markedSquares.add(index);
      } else {
        this.markedSquares.delete(index);
      }

      return this.checkForWin();
    }
    return { isWin: false, winningPattern: null };
  }

  checkForWin() {
    // Define winning patterns (rows, columns, diagonals)
    const winPatterns = [
      // Rows
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24],
      // Columns
      [0, 5, 10, 15, 20],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      // Diagonals
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20],
    ];

    // Check each pattern
    for (const pattern of winPatterns) {
      if (pattern.every((index) => this.markedSquares.has(index))) {
        return { isWin: true, winningPattern: pattern };
      }
    }

    return { isWin: false, winningPattern: null };
  }

  getMarkedCount() {
    return this.markedSquares.size;
  }

  getBingoCard() {
    return this.bingoCard;
  }

  resetBingoCard() {
    this.markedSquares.clear();
    this.bingoCard.forEach((square, index) => {
      if (square.isFree) {
        square.isMarked = true;
        this.markedSquares.add(index);
      } else {
        square.isMarked = false;
      }
    });
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = { BuzzwordManager, DEFAULT_BUZZWORDS };
}
