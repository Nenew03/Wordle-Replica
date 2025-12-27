# Integration Audit Prompt

**Purpose:** Run this prompt periodically to verify your codebase aligns with project goals, constraints, and architecture. Best used after implementing multiple features, before releases, or when something feels "off."

---

## When to Run This Audit

- After completing 3-5 features
- Before major releases or demos
- When onboarding a new AI session after a break
- When you notice code "drift" or inconsistencies
- Monthly (for active projects)

---

## The Audit Prompt

Copy and paste the following into a new conversation:

```
## Integration Audit Request

Please perform a comprehensive integration audit of this codebase against the project context documents.

### Step 1: Load Context
Read these files first:
- `docs/context/briefing_{ProjectName}.md`
- `docs/context/feature_map_{ProjectName}.md`
- `docs/context/architecture_{ProjectName}.md`

### Step 2: Codebase Scan
Scan the codebase structure and key implementation files. Focus on:
- Entry points and main modules
- Data models and database schema
- API routes and handlers
- Core business logic
- Configuration and environment setup

### Step 3: Alignment Check

For each area below, identify any **drift**, **conflicts**, or **opportunities**:

#### A. Constraint Compliance
Compare implementation against "My Constraints" in briefing:
- Are we using technologies/patterns we said we'd avoid?
- Are we overcomplicating things when simplicity was a goal?
- Are we respecting scope boundaries?

#### B. Feature Completeness
Compare implementation against feature_map:
- Which P0 features are fully implemented?
- Which are partially done or missing acceptance criteria?
- Any features implemented that aren't in the map? (scope creep)

#### C. Architecture Adherence
Compare implementation against architecture:
- Does the actual data model match the documented one?
- Are API patterns consistent with what's documented?
- Is the tech stack what we said it would be?
- Any undocumented integrations or dependencies?

#### D. Code Quality & Efficiency
- Duplicated logic that should be consolidated?
- Inconsistent patterns across similar features?
- Performance concerns (N+1 queries, unnecessary re-renders, etc.)?
- Dead code or unused dependencies?

#### E. Technical Debt Inventory
- Shortcuts taken that need addressing
- TODOs and FIXMEs in the code
- Hardcoded values that should be configurable
- Missing error handling or edge cases

### Step 4: Output Format

Please provide:

1. **Executive Summary** (3-5 sentences)
   - Overall health assessment
   - Biggest concern
   - Biggest win

2. **Alignment Scorecard**
   | Area | Status | Notes |
   |------|--------|-------|
   | Constraints | ✅/⚠️/❌ | |
   | Features | ✅/⚠️/❌ | |
   | Architecture | ✅/⚠️/❌ | |
   | Code Quality | ✅/⚠️/❌ | |

3. **Issues Found** (prioritized)
   - 🔴 Critical: [blocks progress or violates core constraints]
   - 🟡 Important: [should fix soon]
   - 🟢 Minor: [nice to fix when convenient]

4. **Recommended Actions**
   Ordered list of specific, actionable fixes

5. **Context Document Updates**
   Any updates needed to briefing/feature_map/architecture based on:
   - Decisions made during implementation
   - Lessons learned
   - Scope changes that should be documented

```

---

## Quick Audit (Lighter Version)

For faster check-ins, use this abbreviated version:

```
## Quick Integration Check

Scan the codebase against `docs/context/briefing_{ProjectName}.md`.

Answer these questions:
1. Are we still building what the briefing says we're building?
2. Have we violated any stated constraints?
3. What's the one thing most out of alignment?
4. What's working well that we should keep doing?

Keep response under 200 words.
```

---

## Post-Audit Actions

After running an audit:

1. **Update Context Docs**
   - Add any new decisions to briefing's "Decisions Made" table
   - Update feature statuses in feature_map
   - Document any architecture changes

2. **Create Issues/Tasks**
   - Convert critical/important issues to actionable tasks
   - Add to your project management system

3. **Update Lessons Learned**
   - Add new lessons to briefing's "What I've Learned" section
   - Graduate repeated lessons to `.cursorrules`

4. **Schedule Next Audit**
   - Set a reminder for your next audit cycle

---

## Audit History Log

Track your audits here:

| Date | Auditor | Health | Key Finding | Action Taken |
|------|---------|--------|-------------|--------------|
| | | | | |
| | | | | |
| | | | | |

---

## Customization

Add project-specific checks here:

### {ProjectName}-Specific Checks
- [ ] [Custom check 1 relevant to your project]
- [ ] [Custom check 2 relevant to your project]
- [ ] [Custom check 3 relevant to your project]

### Integration Points to Verify
- [ ] [External API 1] still working as expected
- [ ] [External API 2] credentials valid and not expiring soon
- [ ] [Third-party service] within usage limits

### Security Checklist
- [ ] No secrets committed to repo
- [ ] Dependencies up to date (no critical vulnerabilities)
- [ ] Auth flows working correctly
- [ ] Rate limiting in place where needed