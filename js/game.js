// UI-001: Game Board Grid
// - Single source of truth renderer: renderBoard()
// - Minimal state shape for UI: wordLength, currentGuess, guesses[]

const state = {
  wordLength: 5, // 5–8
  targetWord: "CRANE",
  currentGuess: "",
  guesses: /** @type {Array<{ word: string; evaluation?: Array<'correct'|'present'|'absent'> }>} */ (
    []
  ),
  /** @type {Map<string, 'absent'|'present'|'correct'>} */
  letterStatus: new Map(),
  gameOver: false,
  won: false,
};

function getWordsData() {
  // words.js should define window.WORDS; fallback to empty object.
  const w = /** @type {any} */ (window).WORDS;
  return w && typeof w === "object" ? w : {};
}

/** @type {Record<number, {answers: string[], valid: string[]}>} */
const WORDS = getWordsData();

/** @type {Record<number, Set<string>>} */
const VALID_SET_BY_LENGTH = {};

function rebuildValidSets() {
  for (const len of [5, 6, 7, 8]) {
    const answers = WORDS?.[len]?.answers;
    const valid = WORDS?.[len]?.valid;

    const set = new Set();
    if (Array.isArray(answers)) {
      for (const w of answers) set.add(String(w).toUpperCase());
    }
    if (Array.isArray(valid)) {
      for (const w of valid) set.add(String(w).toUpperCase());
    }

    VALID_SET_BY_LENGTH[len] = set;
  }
}

rebuildValidSets();

function clampWordLength(n) {
  const next = Number(n);
  if (!Number.isFinite(next)) return 5;
  return Math.min(8, Math.max(5, Math.trunc(next)));
}

function getStatusEl() {
  const el = document.getElementById("status");
  if (!el) throw new Error("Missing #status element");
  return el;
}

function getPlayAgainEl() {
  const el = document.getElementById("play-again");
  if (!el) throw new Error("Missing #play-again element");
  return /** @type {HTMLButtonElement} */ (el);
}

let statusTimer = /** @type {number | null} */ (null);

/**
 * @param {string} message
 * @param {'error'|'success'|'info'} [kind]
 * @param {number} [autoClearMs]
 */
function setStatus(message, kind = "info", autoClearMs = 0) {
  const el = getStatusEl();
  el.classList.remove("error", "success", "info");
  el.classList.add(kind);
  el.textContent = message;

  if (statusTimer != null) {
    window.clearTimeout(statusTimer);
    statusTimer = null;
  }
  if (autoClearMs > 0) {
    statusTimer = window.setTimeout(() => {
      clearStatus();
    }, autoClearMs);
  }
}

function clearStatus() {
  const el = getStatusEl();
  el.classList.remove("error", "success", "info");
  el.textContent = "";
  if (statusTimer != null) {
    window.clearTimeout(statusTimer);
    statusTimer = null;
  }
}

function getKeyboardEl() {
  const el = document.getElementById("keyboard");
  if (!el) throw new Error("Missing #keyboard element");
  return el;
}

function getBoardEl() {
  const el = document.getElementById("board");
  if (!el) throw new Error("Missing #board element");
  return el;
}

function statusPrecedence(status) {
  if (status === "correct") return 3;
  if (status === "present") return 2;
  return 1; // absent (or unknown -> treat lowest)
}

function setBestLetterStatus(letter, nextStatus) {
  const ch = String(letter).toUpperCase();
  if (!/^[A-Z]$/.test(ch)) return;
  if (nextStatus !== "correct" && nextStatus !== "present" && nextStatus !== "absent") {
    return;
  }
  const prev = state.letterStatus.get(ch);
  if (!prev || statusPrecedence(nextStatus) > statusPrecedence(prev)) {
    state.letterStatus.set(ch, nextStatus);
  }
}

function updateLetterStatusFromEvaluation(word, evaluation) {
  if (!Array.isArray(evaluation)) return;
  for (let i = 0; i < word.length; i++) {
    const letter = word[i];
    const st = evaluation[i];
    setBestLetterStatus(letter, st);
  }
}

function evaluateGuess(guess, target) {
  const g = String(guess).toUpperCase();
  const t = String(target).toUpperCase();
  const result = Array(g.length).fill("absent");
  const targetLetters = [...t];

  // First pass: correct
  for (let i = 0; i < g.length; i++) {
    if (g[i] === t[i]) {
      result[i] = "correct";
      targetLetters[i] = null;
    }
  }

  // Second pass: present
  for (let i = 0; i < g.length; i++) {
    if (result[i] === "correct") continue;
    const idx = targetLetters.indexOf(g[i]);
    if (idx !== -1) {
      result[i] = "present";
      targetLetters[idx] = null;
    }
  }

  return /** @type {Array<'correct'|'present'|'absent'>} */ (result);
}

function renderKeyboard() {
  const keyboardEl = getKeyboardEl();
  keyboardEl.innerHTML = "";

  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
  ];

  for (const row of rows) {
    const rowEl = document.createElement("div");
    rowEl.className = "keyboard-row";

    for (const key of row) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "key";
      btn.dataset.key = key;

      if (key === "ENTER") {
        btn.classList.add("wide");
        btn.textContent = "Enter";
        btn.setAttribute("aria-label", "Enter");
      } else if (key === "BACKSPACE") {
        btn.classList.add("wide");
        btn.textContent = "⌫";
        btn.setAttribute("aria-label", "Backspace");
      } else {
        btn.textContent = key;
        btn.setAttribute("aria-label", key);
      }

      rowEl.appendChild(btn);
    }

    keyboardEl.appendChild(rowEl);
  }

  renderKeyboardColors();
}

function renderKeyboardColors() {
  const keyboardEl = getKeyboardEl();
  const buttons = keyboardEl.querySelectorAll("button.key[data-key]");
  for (const btn of buttons) {
    const key = String(btn.dataset.key || "").toUpperCase();
    if (!/^[A-Z]$/.test(key)) continue;

    btn.classList.remove("absent", "present", "correct");
    const st = state.letterStatus.get(key);
    if (st) btn.classList.add(st);
  }
}

function renderBoard() {
  const boardEl = getBoardEl();

  // Keep CSS var in sync (used by grid template + tile-size)
  boardEl.style.setProperty("--word-length", String(state.wordLength));

  // Simple MVP: rerender all tiles
  boardEl.innerHTML = "";

  for (let r = 0; r < 6; r++) {
    const isSubmitted = r < state.guesses.length;
    const isActive = r === state.guesses.length;

    const rowWord = isSubmitted
      ? state.guesses[r].word
      : isActive
        ? state.currentGuess
        : "";
    const rowEval = isSubmitted ? state.guesses[r].evaluation : undefined;

    for (let c = 0; c < state.wordLength; c++) {
      const letter = rowWord[c] ?? "";
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.setAttribute("role", "gridcell");

      if (letter === "") tile.classList.add("empty");
      else tile.classList.add("filled");

      if (isSubmitted && Array.isArray(rowEval)) {
        const status = rowEval[c];
        if (status === "correct" || status === "present" || status === "absent") {
          tile.classList.add(status);
        }
      }

      tile.textContent = letter;
      boardEl.appendChild(tile);
    }
  }
}

function pickRandomTargetWord(length) {
  const n = clampWordLength(length);
  const answers = WORDS?.[n]?.answers;
  const list = Array.isArray(answers) ? answers : [];
  if (list.length === 0) {
    return "CRANE".slice(0, n).padEnd(n, "A");
  }
  return String(list[Math.floor(Math.random() * list.length)]).toUpperCase();
}

function isValidGuessWord(word) {
  const w = String(word).toUpperCase();
  const set = VALID_SET_BY_LENGTH[state.wordLength];
  if (!set || set.size === 0) {
    // If no list loaded, don't hard-block guesses (keeps MVP usable while lists are small/being expanded).
    return true;
  }
  return set.has(w);
}

function getLengthSelectorEl() {
  return /** @type {HTMLElement|null} */ (document.querySelector(".length-selector"));
}

function syncLengthSelectorUI() {
  const selectorEl = getLengthSelectorEl();
  if (!selectorEl) return;

  const buttons = selectorEl.querySelectorAll("button.length-btn[data-length]");
  for (const btn of buttons) {
    const len = Number(btn.getAttribute("data-length"));
    const isActive = clampWordLength(len) === state.wordLength;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  }
}

function newGame() {
  state.targetWord = pickRandomTargetWord(state.wordLength);
  state.currentGuess = "";
  state.guesses = [];
  state.letterStatus = new Map();
  state.gameOver = false;
  state.won = false;
  clearStatus();
  getPlayAgainEl().hidden = true;
  renderBoard();
  renderKeyboardColors();
  syncLengthSelectorUI();
}

function setWordLength(nextLength) {
  const next = clampWordLength(nextLength);
  if (next === state.wordLength) return;
  state.wordLength = next;
  newGame();
}

function addLetter(letter) {
  if (state.gameOver) return;
  if (!letter || state.currentGuess.length >= state.wordLength) return;
  if (state.guesses.length >= 6) return;
  const ch = String(letter).toUpperCase();
  if (!/^[A-Z]$/.test(ch)) return;
  state.currentGuess += ch;
  renderBoard();
}

function deleteLetter() {
  if (state.gameOver) return;
  if (state.currentGuess.length === 0) return;
  state.currentGuess = state.currentGuess.slice(0, -1);
  renderBoard();
}

function submitGuess() {
  if (state.gameOver) return;
  if (state.guesses.length >= 6) return;
  if (state.currentGuess.length !== state.wordLength) return;

  if (!isValidGuessWord(state.currentGuess)) {
    setStatus("Not in word list", "error", 1200);
    return;
  }

  const evaluation = evaluateGuess(state.currentGuess, state.targetWord);
  state.guesses.push({ word: state.currentGuess, evaluation });
  updateLetterStatusFromEvaluation(state.currentGuess, evaluation);

  const submittedWord = state.currentGuess;
  state.currentGuess = "";
  renderBoard();
  renderKeyboardColors();

  // Win/lose detection
  if (submittedWord.toUpperCase() === String(state.targetWord).toUpperCase()) {
    state.gameOver = true;
    state.won = true;
    setStatus("You win!", "success");
    getPlayAgainEl().hidden = false;
    return;
  }

  if (state.guesses.length >= 6) {
    state.gameOver = true;
    state.won = false;
    setStatus(`You lose. The word was ${state.targetWord}.`, "info");
    getPlayAgainEl().hidden = false;
  }
}

// Minimal physical keyboard support (useful for manual testing UI-001)
document.addEventListener("keydown", (e) => {
  // Don't interfere with typing into form inputs (future-proofing)
  const target = /** @type {HTMLElement|null} */ (e.target);
  const tag = target?.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;

  if (e.key === "Enter") {
    submitGuess();
    return;
  }
  if (e.key === "Backspace") {
    deleteLetter();
    return;
  }
  if (/^[a-zA-Z]$/.test(e.key)) {
    addLetter(e.key);
  }
});

// On-screen keyboard (event delegation)
getKeyboardEl().addEventListener("click", (e) => {
  const btn = /** @type {HTMLElement|null} */ (e.target)?.closest?.("button.key[data-key]");
  if (!btn) return;

  const key = String(btn.getAttribute("data-key") || "").toUpperCase();
  if (key === "ENTER") submitGuess();
  else if (key === "BACKSPACE") deleteLetter();
  else addLetter(key);
});

// Word length selector (event delegation)
getLengthSelectorEl()?.addEventListener("click", (e) => {
  const btn = /** @type {HTMLElement|null} */ (e.target)?.closest?.(
    "button.length-btn[data-length]"
  );
  if (!btn) return;
  const nextLength = Number(btn.getAttribute("data-length"));
  setWordLength(nextLength);
});

// Expose for manual testing in console + future UI integrations
window.renderBoard = renderBoard;
window.renderKeyboard = renderKeyboard;
window.setWordLength = setWordLength;
window.newGame = newGame;
window.addLetter = addLetter;
window.deleteLetter = deleteLetter;
window.submitGuess = submitGuess;
window.__wordleState = state;

// Initial paint
renderKeyboard();
newGame();

// Play again
getPlayAgainEl().addEventListener("click", () => {
  newGame();
});

