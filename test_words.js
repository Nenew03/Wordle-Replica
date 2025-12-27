// DATA-001 validation script (run with: node test_words.js)
// - No dependencies
// - Loads js/words.js in a sandbox and validates schema + basic DATA-001 constraints

const fs = require("fs");
const vm = require("vm");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function describeLen(len) {
  return `${len}-letter`;
}

try {
  const wordsPath = "js/words.js";
  const stat = fs.statSync(wordsPath);

  // DATA-001 budget: keep file size reasonable (<500KB total).
  assert(stat.size < 500 * 1024, `words.js too large: ${stat.size} bytes (budget: < 512000)`);

  const code = fs.readFileSync(wordsPath, "utf8");
  const ctx = { window: {}, console };
  vm.runInNewContext(code, ctx, { filename: "words.js" });

  const WORDS = ctx.window.WORDS;
  assert(WORDS && typeof WORDS === "object", "window.WORDS missing or not an object");

  const MIN_ANSWERS = { 5: 500, 6: 500, 7: 500, 8: 500 };
  const MAX_ANSWERS = { 5: 2000, 6: 1500, 7: 1000, 8: 1000 };

  // DATA-001 curation/profanity filtering
  // - Required: no offensive/inappropriate words in answers
  // - Recommended: also keep them out of valid guesses
  const BLOCKED_WORDS = new Set([
    "ASSHOLE",
    "BITCH",
    "JIHAD",
    "PENIS",
    "PORNO",
    "PRICK",
    "WHORE",
  ]);

  console.log("✅ Word lists loaded successfully");

  for (const len of [5, 6, 7, 8]) {
    const bucket = WORDS[len];
    assert(bucket && typeof bucket === "object", `Missing WORDS[${len}] bucket`);

    const answers = bucket.answers;
    const valid = bucket.valid;
    assert(Array.isArray(answers), `WORDS[${len}].answers must be an array`);
    assert(Array.isArray(valid), `WORDS[${len}].valid must be an array`);

    // Count ranges from feature_map.md
    const minA = MIN_ANSWERS[len];
    const maxA = MAX_ANSWERS[len];
    assert(
      answers.length >= minA && answers.length <= maxA,
      `${describeLen(len)} answers out of range: ${answers.length} (expected ~${minA}-${maxA})`
    );

    // Valid guesses should be larger (or at least not smaller) for validation.
    assert(
      valid.length >= answers.length,
      `${describeLen(len)} valid list is smaller than answers: valid=${valid.length}, answers=${answers.length}`
    );

    const answersSet = new Set(answers);
    const validSet = new Set(valid);

    // No duplicates (after normalization/hygiene pass)
    assert(answersSet.size === answers.length, `${describeLen(len)} answers contains duplicates`);
    assert(validSet.size === valid.length, `${describeLen(len)} valid contains duplicates`);

    // All entries should be uppercase A–Z and correct length
    for (const w of answers) {
      assert(typeof w === "string", `${describeLen(len)} answers contains non-string entry`);
      assert(w.length === len, `${describeLen(len)} answers contains wrong-length word: ${w}`);
      assert(/^[A-Z]+$/.test(w), `${describeLen(len)} answers contains non A–Z word: ${w}`);
      assert(validSet.has(w), `${describeLen(len)} answers word missing from valid: ${w}`);
      assert(!BLOCKED_WORDS.has(w), `${describeLen(len)} answers contains blocked word: ${w}`);
    }
    for (const w of valid) {
      assert(typeof w === "string", `${describeLen(len)} valid contains non-string entry`);
      assert(w.length === len, `${describeLen(len)} valid contains wrong-length word: ${w}`);
      assert(/^[A-Z]+$/.test(w), `${describeLen(len)} valid contains non A–Z word: ${w}`);
      assert(!BLOCKED_WORDS.has(w), `${describeLen(len)} valid contains blocked word: ${w}`);
    }

    console.log(`📊 ${len}-letter: ${answers.length} answers, ${valid.length} valid guesses`);
  }

  console.log("\n🎉 All DATA-001 checks passed.");
} catch (error) {
  console.error("❌ Test failed:", error && error.message ? error.message : String(error));
  process.exit(1);
}