# Context Alignment Check — Prompt Template

Use this prompt before starting work on a new feature to ensure your core context documents are in sync.

---

## Quick Command

Copy and paste this into your AI assistant (Cursor, Claude, etc.):

```
Review the following context documents for alignment issues:
- briefing.md
- feature_map.md  
- architecture.md

Check for:
1. Features in feature_map.md that lack architectural support
2. Architecture components that aren't needed by any feature
3. Constraints in briefing.md that are violated by feature_map or architecture
4. Scope boundary violations (features doing things briefing says they shouldn't)
5. Missing dependencies or circular dependencies
6. Tech stack mismatches (feature assumes tech not in architecture)

Output:
- List of alignment issues (severity: Critical / Warning / Note)
- For each issue, recommend a fix and which doc to update
- Confirm if ready to proceed with implementation or if fixes needed first
```

---

## Detailed Alignment Check Prompt

For a more thorough review, use this expanded version:

```
## Context Alignment Audit

I need you to audit my project context documents for consistency before I continue development.

### Documents to Review
- `briefing.md` — Product requirements and build constraints
- `feature_map.md` — Implementation task breakdown  
- `architecture.md` — Technical design

### Audit Checklist

**1. Briefing → Feature Map Alignment**
- [ ] Every process/pipeline stage in briefing has corresponding features
- [ ] Build constraints (Section 6) are respected in feature scope
- [ ] Scope boundaries ("should NOT do") are not violated by any feature
- [ ] Success criteria can be met by the planned features

**2. Feature Map → Architecture Alignment**
- [ ] Every feature has the technical components it needs (API endpoints, data models, etc.)
- [ ] No orphan architecture (components not used by any feature)
- [ ] Dependencies between features are supported by architecture
- [ ] Tech stack in architecture covers all feature requirements

**3. Architecture → Briefing Alignment**
- [ ] Architecture respects maintenance constraints (team size, skills)
- [ ] Architecture respects scope boundaries (what system should NOT do)
- [ ] Reliability/scalability targets are achievable with this architecture
- [ ] No over-engineering beyond what briefing constraints allow

**4. Cross-Document Consistency**
- [ ] Terminology is consistent across all three docs
- [ ] Version references are correct (feature_map references correct briefing version)
- [ ] No contradictory statements between documents

### Output Format

For each issue found:

```
### [SEVERITY] Issue Title

**Location:** Which doc(s) have the problem
**Problem:** What's wrong
**Impact:** What breaks if not fixed
**Recommended Fix:** What to change and where
**Effort:** Quick fix / Moderate / Significant rework
```

Then provide:
1. Summary table of all issues by severity
2. Recommended fix order (what to fix first)
3. Go/No-Go recommendation for proceeding with implementation
```

---

## Pre-Feature Checklist Prompt

Use this shorter version before starting any specific feature:

```
I'm about to implement [FEATURE-ID: Feature Name].

Before I start, verify:
1. This feature is in feature_map.md with clear acceptance criteria
2. Architecture.md has all components this feature needs
3. This feature doesn't violate any scope boundaries in briefing.md
4. All dependencies (other features) are complete or not blocking
5. No alignment issues that would cause rework

If there are issues, list them. Otherwise, confirm ready to proceed.
```

---

## Fix Plan Prompt

After identifying issues, use this to create a fix plan:

```
Based on the alignment issues identified:

[Paste issues here]

Create a fix plan that:
1. Groups related fixes together
2. Orders fixes to avoid cascading changes (fix upstream docs first)
3. Estimates effort for each fix
4. Identifies which fixes are blocking vs. can be deferred

Output as a numbered action list I can execute sequentially.
```

---

## Adding to .cursorrules

Add this to your `.cursorrules` to make alignment checks automatic:

```markdown
## Alignment Check Protocol

Before implementing any feature:
1. Verify the feature exists in `feature_map.md` with status "Not Started"
2. Confirm `architecture.md` supports all technical needs
3. Check feature doesn't violate scope boundaries in `briefing.md`
4. If any misalignment found, stop and report before proceeding

When modifying any context document:
1. Check if change affects other documents
2. Propose updates to related documents
3. Update version numbers and changelog if significant
```

---

## Example Alignment Issue Output

Here's what good issue identification looks like:

```
### [CRITICAL] Feature DASH-003 requires WebSocket but architecture has no WebSocket support

**Location:** feature_map.md (DASH-003), architecture.md (Section 2)
**Problem:** DASH-003 acceptance criteria includes "real-time updates" but architecture only shows REST API
**Impact:** Feature cannot be implemented as specified; will require architecture change or feature descope
**Recommended Fix:** 
  - Option A: Add WebSocket/SSE to architecture.md Section 4
  - Option B: Change DASH-003 to use polling instead of real-time (simpler, aligns with "minimal custom code" constraint)
**Effort:** Option A = Moderate, Option B = Quick fix

---

### [WARNING] Architecture includes Redis caching but no feature requires it

**Location:** architecture.md (Section 1 Tech Stack)
**Problem:** Redis listed in tech stack but not used by any feature in feature_map.md
**Impact:** Unnecessary complexity; violates "minimal custom code" constraint in briefing
**Recommended Fix:** Remove Redis from architecture unless future feature needs it
**Effort:** Quick fix

---

### [NOTE] Terminology mismatch: "shortlist" vs "candidates"

**Location:** briefing.md uses "shortlist", feature_map.md uses "candidates" interchangeably
**Problem:** Inconsistent terminology may cause confusion
**Impact:** Low - cosmetic issue
**Recommended Fix:** Standardize on "candidates" (more precise) throughout all docs
**Effort:** Quick fix
```

---

## Workflow Summary

```
┌─────────────────────────────────────────┐
│         Before Starting Feature         │
└─────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Run Alignment Check  │
        │  (use prompts above)  │
        └───────────────────────┘
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
   ┌─────────────┐     ┌─────────────┐
   │ Issues Found│     │  No Issues  │
   └─────────────┘     └─────────────┘
          │                   │
          ▼                   │
   ┌─────────────┐            │
   │  Fix Issues │            │
   │  (fix plan) │            │
   └─────────────┘            │
          │                   │
          ▼                   ▼
        ┌───────────────────────┐
        │  Proceed with Feature │
        └───────────────────────┘
```