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
  streaks: { 5: 0, 6: 0, 7: 0, 8: 0 }, // UI-006: Session streak counters
};

const DEFINITION_CACHE = new Map();

function getWordsData() {
  // words.js should define window.WORDS; fallback to empty object.
  const w = /** @type {any} */ (window).WORDS;
  return w && typeof w === "object" ? w : {};
}

/** @type {Record<number, {answers: string[], valid: string[]}>} */
const WORDS = getWordsData();

function clampWordLength(n) {
  const next = Number(n);
  if (!Number.isFinite(next)) return 5;
  return Math.min(8, Math.max(5, Math.trunc(next)));
}

function getMaxTries(wordLength) {
  return wordLength <= 6 ? 6 : wordLength;
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

function getHintEl() {
  const el = document.getElementById("hint-container");
  if (!el) throw new Error("Missing #hint-container element");
  return el;
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

async function fetchDefinition(word) {
  const w = word.toLowerCase();
  if (DEFINITION_CACHE.has(w)) return DEFINITION_CACHE.get(w);

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${w}`);
    if (!response.ok) throw new Error("Not found");
    const data = await response.json();
    const entry = data[0]?.meanings[0]?.definitions[0];
    const result = {
      definition: entry?.definition || "No definition found.",
      example: entry?.example || null,
    };
    DEFINITION_CACHE.set(w, result);
    return result;
  } catch (err) {
    console.error("Failed to fetch definition:", err);
    return { definition: "Definition unavailable.", example: null };
  }
}

async function showHint() {
  const hintEl = getHintEl();
  const { definition } = await fetchDefinition(state.targetWord);
  hintEl.innerHTML = `<span class="hint-label">Hint</span>${definition}`;
  hintEl.hidden = false;
}

function getDetailsEl() {
  const el = document.getElementById("details-container");
  if (!el) throw new Error("Missing #details-container element");
  return el;
}

async function showGameEndDetails(word) {
  const detailsEl = getDetailsEl();
  const { definition, example } = await fetchDefinition(word);

  let html = `<span class="details-word">${word}</span>: ${definition}`;
  if (example) {
    html += `<span class="details-example">Example: "${example}"</span>`;
  }

  detailsEl.innerHTML = html;
  detailsEl.hidden = false;
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

  // Dynamic gap: smaller for 7-8 letters to save space on mobile
  const gap = state.wordLength > 6 ? 4 : 6;

  // Keep CSS vars in sync (used by grid template + responsive sizing)
  boardEl.style.setProperty("--word-length", String(state.wordLength));
  boardEl.style.setProperty("--gap", `${gap}px`);

  // Simple MVP: rerender all tiles
  boardEl.innerHTML = "";

  const maxTries = getMaxTries(state.wordLength);

  for (let r = 0; r < maxTries; r++) {
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

function renderStreaks() {
  const container = document.getElementById("streaks-container");
  if (!container) return;

  container.innerHTML = "";

  for (const length of [5, 6, 7, 8]) {
    const streakValue = state.streaks[length];
    const isCurrent = length === state.wordLength;

    const item = document.createElement("div");
    item.className = `streak-item${isCurrent ? " current" : ""}`;

    item.innerHTML = `
      <div class="streak-label">${length}-letter</div>
      <div class="streak-length">${streakValue}</div>
    `;

    container.appendChild(item);
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
  getHintEl().hidden = true;
  getDetailsEl().hidden = true;
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
  if (state.guesses.length >= getMaxTries(state.wordLength)) return;
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

function isReasonableGuess(guess) {
  const word = guess.toUpperCase();

  // Reject words with no vowels (too obvious)
  if (!/[AEIOU]/.test(word)) return false;

  // Reject words with 5+ consecutive consonants (very unlikely in English)
  if (/[^AEIOU]{5,}/.test(word)) return false;

  // Reject words with 4+ consecutive vowels (very rare)
  if (/[AEIOU]{4,}/.test(word)) return false;

  return true;
}

function submitGuess() {
  if (state.gameOver) return;
  if (state.guesses.length >= getMaxTries(state.wordLength)) return;
  if (state.currentGuess.length !== state.wordLength) return;

  // Basic pattern validation
  if (!isReasonableGuess(state.currentGuess)) {
    setStatus("Please enter a more realistic word combination", "error");
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
    showGameEndDetails(state.targetWord);
    getPlayAgainEl().hidden = false;
    return;
  }

  if (state.guesses.length >= getMaxTries(state.wordLength)) {
    state.gameOver = true;
    state.won = false;
    setStatus(`You lose. The word was ${state.targetWord}.`, "info");
    showGameEndDetails(state.targetWord);
    getPlayAgainEl().hidden = false;
  }

  // UI-006: Update streaks based on win/loss
  if (state.gameOver) {
    if (state.won) {
      state.streaks[state.wordLength]++;
    } else {
      state.streaks[state.wordLength] = 0;
    }
    renderStreaks();
  }

  // Trigger hint after 4th failed guess
  if (state.guesses.length === 4 && !state.gameOver) {
    showHint();
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
renderStreaks();
newGame();

// Play again
getPlayAgainEl().addEventListener("click", () => {
  newGame();
});

