(() => {
  "use strict";

  const GRID_SIZE = 4;

  function createEmptyBoard(size = GRID_SIZE) {
    return Array.from({ length: size }, () => Array(size).fill(0));
  }

  function getEmptyCells(board) {
    const emptyCells = [];

    for (let row = 0; row < board.length; row += 1) {
      for (let col = 0; col < board[row].length; col += 1) {
        if (board[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }

    return emptyCells;
  }

  function spawnRandomTile(board, rng = Math.random) {
    const emptyCells = getEmptyCells(board);

    if (emptyCells.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(rng() * emptyCells.length);
    const targetCell = emptyCells[randomIndex];
    const value = rng() < 0.9 ? 2 : 4;

    board[targetCell.row][targetCell.col] = value;

    return { ...targetCell, value };
  }

  function slideAndMerge(line, size = GRID_SIZE) {
    const compact = line.filter((value) => value !== 0);
    const mergedLine = [];
    const mergeIndices = [];
    let gainedScore = 0;

    for (let index = 0; index < compact.length; index += 1) {
      const current = compact[index];
      const next = compact[index + 1];

      if (current === next) {
        const mergedValue = current * 2;
        mergedLine.push(mergedValue);
        mergeIndices.push(mergedLine.length - 1);
        gainedScore += mergedValue;
        index += 1;
      } else {
        mergedLine.push(current);
      }
    }

    while (mergedLine.length < size) {
      mergedLine.push(0);
    }

    const moved = mergedLine.some((value, idx) => value !== line[idx]);

    return {
      line: mergedLine,
      gainedScore,
      mergeIndices,
      moved,
    };
  }

  class Game2048 {
    constructor(options = {}) {
      this.size = options.size || GRID_SIZE;
      this.rng = options.rng || Math.random;
      this.onStateChange = options.onStateChange || (() => {});

      this.board = createEmptyBoard(this.size);
      this.score = 0;
      this.gameOver = false;
      this.newTiles = new Set();
      this.mergedTiles = new Set();
    }

    keyFor(row, col) {
      return `${row}-${col}`;
    }

    getLine(index, direction) {
      const values = [];
      const positions = [];

      for (let offset = 0; offset < this.size; offset += 1) {
        let row = 0;
        let col = 0;

        if (direction === "left") {
          row = index;
          col = offset;
        } else if (direction === "right") {
          row = index;
          col = this.size - 1 - offset;
        } else if (direction === "up") {
          row = offset;
          col = index;
        } else {
          row = this.size - 1 - offset;
          col = index;
        }

        values.push(this.board[row][col]);
        positions.push({ row, col });
      }

      return { values, positions };
    }

    setLine(index, direction, values) {
      for (let offset = 0; offset < this.size; offset += 1) {
        let row = 0;
        let col = 0;

        if (direction === "left") {
          row = index;
          col = offset;
        } else if (direction === "right") {
          row = index;
          col = this.size - 1 - offset;
        } else if (direction === "up") {
          row = offset;
          col = index;
        } else {
          row = this.size - 1 - offset;
          col = index;
        }

        this.board[row][col] = values[offset];
      }
    }

    hasAvailableMoves() {
      if (getEmptyCells(this.board).length > 0) {
        return true;
      }

      for (let row = 0; row < this.size; row += 1) {
        for (let col = 0; col < this.size; col += 1) {
          const value = this.board[row][col];

          if (row + 1 < this.size && this.board[row + 1][col] === value) {
            return true;
          }

          if (col + 1 < this.size && this.board[row][col + 1] === value) {
            return true;
          }
        }
      }

      return false;
    }

    startNewGame() {
      this.board = createEmptyBoard(this.size);
      this.score = 0;
      this.gameOver = false;
      this.newTiles.clear();
      this.mergedTiles.clear();

      for (let index = 0; index < 2; index += 1) {
        const spawned = spawnRandomTile(this.board, this.rng);
        if (spawned) {
          this.newTiles.add(this.keyFor(spawned.row, spawned.col));
        }
      }

      this.onStateChange();
    }

    move(direction) {
      if (this.gameOver) {
        return false;
      }

      this.newTiles.clear();
      this.mergedTiles.clear();

      let moved = false;
      let scoreDelta = 0;

      for (let index = 0; index < this.size; index += 1) {
        const { values, positions } = this.getLine(index, direction);
        const result = slideAndMerge(values, this.size);

        if (result.moved) {
          moved = true;
        }

        scoreDelta += result.gainedScore;
        this.setLine(index, direction, result.line);

        result.mergeIndices.forEach((mergeIndex) => {
          const mergeCell = positions[mergeIndex];
          this.mergedTiles.add(this.keyFor(mergeCell.row, mergeCell.col));
        });
      }

      if (!moved) {
        return false;
      }

      this.score += scoreDelta;
      const spawned = spawnRandomTile(this.board, this.rng);

      if (spawned) {
        this.newTiles.add(this.keyFor(spawned.row, spawned.col));
      }

      this.gameOver = !this.hasAvailableMoves();
      this.onStateChange();

      return true;
    }
  }

  if (typeof document !== "undefined") {
    const scoreEl = document.getElementById("score");
    const bestScoreEl = document.getElementById("best-score");
    const tileLayer = document.getElementById("tile-layer");
    const restartBtn = document.getElementById("restart-btn");
    const overlayRestartBtn = document.getElementById("overlay-restart-btn");
    const gameOverOverlay = document.getElementById("game-over");
    const boardEl = document.getElementById("board");

    const directionsByKey = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };

    let bestScore = 0;
    try {
      bestScore = Number(window.localStorage.getItem("bestScore2048") || 0);
    } catch {
      bestScore = 0;
    }

    const game = new Game2048({ onStateChange: render });

    function persistBestScore() {
      try {
        window.localStorage.setItem("bestScore2048", String(bestScore));
      } catch {
        // Ignore storage errors (private mode, blocked storage, etc.)
      }
    }

    function shakeBoard() {
      boardEl.classList.remove("board-shake");
      void boardEl.offsetWidth;
      boardEl.classList.add("board-shake");
    }

    function render() {
      scoreEl.textContent = String(game.score);
      bestScoreEl.textContent = String(bestScore);
      gameOverOverlay.classList.toggle("hidden", !game.gameOver);

      tileLayer.innerHTML = "";

      for (let row = 0; row < game.size; row += 1) {
        for (let col = 0; col < game.size; col += 1) {
          const value = game.board[row][col];

          if (value === 0) {
            continue;
          }

          const tile = document.createElement("div");
          tile.className = "tile";
          tile.style.gridRowStart = String(row + 1);
          tile.style.gridColumnStart = String(col + 1);

          const tierClass = value > 2048 ? "tile-super" : `tile-${value}`;
          tile.classList.add(tierClass);

          const key = game.keyFor(row, col);
          if (game.newTiles.has(key)) {
            tile.classList.add("tile-new");
          }

          if (game.mergedTiles.has(key)) {
            tile.classList.add("tile-merged");
          }

          tile.textContent = String(value);
          tileLayer.appendChild(tile);
        }
      }
    }

    function handleMove(direction) {
      const moved = game.move(direction);

      if (!moved) {
        shakeBoard();
        return;
      }

      if (game.score > bestScore) {
        bestScore = game.score;
        persistBestScore();
      }
    }

    document.addEventListener("keydown", (event) => {
      const direction = directionsByKey[event.key];
      if (!direction) {
        return;
      }

      event.preventDefault();
      handleMove(direction);
    });

    let touchStartX = 0;
    let touchStartY = 0;

    boardEl.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      },
      { passive: true }
    );

    boardEl.addEventListener(
      "touchend",
      (event) => {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const threshold = 24;

        if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
          return;
        }

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          handleMove(deltaX > 0 ? "right" : "left");
        } else {
          handleMove(deltaY > 0 ? "down" : "up");
        }
      },
      { passive: true }
    );

    restartBtn.addEventListener("click", () => game.startNewGame());
    overlayRestartBtn.addEventListener("click", () => game.startNewGame());

    game.startNewGame();
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      Game2048,
      createEmptyBoard,
      getEmptyCells,
      spawnRandomTile,
      slideAndMerge,
    };
  }
})();
