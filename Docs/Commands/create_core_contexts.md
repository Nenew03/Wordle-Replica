# Core Context Documentation Guidelines

This file defines the standards for creating and maintaining project context documents. All context files should follow these guidelines to ensure consistency across versions and enable effective AI-assisted development.

---

## Document Hierarchy

```
docs/context/                       ← Current/active context files
├── briefing.md                     ← Business requirements & product spec
├── feature_map.md                  ← Granular feature breakdown
├── architecture.md                 ← Technical implementation approach
└── archive/                        ← Previous versions
    ├── briefing_v1.md
    ├── briefing_v2.md
    ├── feature_map_v1.md
    └── architecture_v1.md

.cursorrules                        ← AI behavior constraints (references docs/context/)
```

**Principle:** Each document answers a different question:
- **Briefing:** *What* are we building, *why*, and *under what constraints*?
- **Feature Map:** *What exactly* needs to be implemented, broken into units of work?
- **Architecture:** *How* will it be built technically to support the feature map?

---

## Versioning Protocol

**Core Principle:** The latest version of each context document is ALWAYS the file with just the name (no version suffix). Versioned files (v1, v2, etc.) are archived for historical reference only.

### File Naming Convention

| File Type | Location | Purpose |
|-----------|----------|---------|
| `briefing.md` | `docs/context/` | **Active** — current product spec |
| `feature_map.md` | `docs/context/` | **Active** — current feature breakdown |
| `architecture.md` | `docs/context/` | **Active** — current technical design |
| `briefing_v1.md` | `docs/context/archive/` | **Archive** — historical reference only |
| `briefing_v2.md` | `docs/context/archive/` | **Archive** — historical reference only |
| `feature_map_v1.md` | `docs/context/archive/` | **Archive** — historical reference only |

**Important:** Never reference versioned filenames (e.g., `briefing_v2.md`) in active docs or `.cursorrules`. Always use canonical paths (`docs/context/briefing.md`).

### When to Version

Version-worthy changes include:
- Adding or removing major stages/components
- Changing core technology choices
- Pivoting target outcomes or success criteria
- Restructuring the data model

Minor changes (threshold tweaks, copy edits) should be made in-place with inline annotations: `*(updated YYYY-MM-DD)*`

### How to Version

When making significant changes to any context document:

1. **Archive** the current file with its version number:
   - `docs/context/briefing.md` → `docs/context/archive/briefing_v{current}.md`
   
2. **Update** the file in place at its canonical path:
   - Edit `docs/context/briefing.md` directly
   - Increment the version number in the header
   - Add a changelog entry describing the changes

3. **Verify** `.cursorrules` still references `docs/context/` (no change needed if using canonical paths)

### Example Workflow

```bash
# You have briefing.md at v2, making significant changes for v3

# Step 1: Archive current version
mv docs/context/briefing.md docs/context/archive/briefing_v2.md

# Step 2: Create new version at canonical path
# (copy from archive and edit, or create fresh)
cp docs/context/archive/briefing_v2.md docs/context/briefing.md
# Then edit docs/context/briefing.md with v3 changes

# Step 3: Update header in briefing.md
# Version: 3.0
# Add changelog entry for v3


---

# Briefing Guidelines

**Filename:** `docs/context/briefing.md`

**Purpose:** Define the product from a business/functional perspective AND the constraints that shape how it should be built. This is the "what", "why", and "how we want to build it."

## Required Sections

### Header Block

```
# [Project Name] — Product Briefing

**Version:** 3.0
**Last Updated:** YYYY-MM-DD
**Status:** Draft | Active | Deprecated

## Changelog
- **v3 (YYYY-MM-DD):** [Summary of changes from v2]
- **v2 (YYYY-MM-DD):** [Summary of changes from v1]
- **v1 (YYYY-MM-DD):** Initial spec
```

## What I'm Building
[2-3 sentences max]

## Who It's For
[1 sentence]

## What "Done" Looks Like
- [ ] Concrete outcome 1
- [ ] Concrete outcome 2
- [ ] Concrete outcome 3

## My Constraints
- I can: [skills]
- I can't: [anti-skills]  
- I want: [preferences - simple, cheap, maintainable, etc.]

## Current State
**Last session:** [date]
**Working:** [what works]
**Broken:** [what's broken]
**Next:** [one concrete next step]

## Decisions Made
| Date | Decision | Why |
|------|----------|-----|
| | | |

## What I've Learned (Lessons)
 Active Lessons (not yet in .cursorrules)
   - [DATE] [seen: x times; severity:low/medium/high/critical]
   
 Graduated to .cursorrules
   - [DATE] 
   
 Rejected / One-off
   - [DATE] 
---

# Feature Map Guidelines

**Filename:** `docs/context/feature_map.md`

**Purpose:** Break down the product into implementable units of work. This is the task-level view for development.

> The feature map should ONLY include what needs to be built in code. If an external tool (e.g., n8n) handles the pipeline, those aren't features here.

## Required Sections

### Header Block

```markdown
# [Project Name] — Feature Map

**Version:** 2.0
**Last Updated:** YYYY-MM-DD
**Briefing Reference:** `docs/context/briefing.md` (v3)

## Changelog
- **v2 (YYYY-MM-DD):** [Summary of changes]
- **v1 (YYYY-MM-DD):** Initial feature breakdown
```

### 1. Scope Statement
Clearly state what's in scope for this feature map:


## Scope

This feature map covers the **web app** (frontend + backend).

**Out of scope** (handled elsewhere):

### 2. Feature Inventory
Organized by domain/stage. Each feature should include:


### [STAGE-ID] Feature Name

**Priority:** P0 | P1 | P2
**Status:** Not Started | In Progress | Complete | Blocked
**Dependencies:** [List other feature IDs]

**Description:**
Brief explanation of what this feature does.

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Technical Notes:**
Any implementation hints, gotchas, or references to architecture.md sections.


### 3. Suggested ID Convention

```
API-001      Backend API features
DASH-001     Dashboard/frontend features
AUTH-001     Authentication features
INFRA-001    Infrastructure/deployment features
DATA-001     Data model/migration features
```

### 4. MVP Scope
Explicitly mark which features constitute MVP:
- List P0 features that must ship together
- Note what's explicitly deferred to post-MVP
- Include effort estimate

### 5. Out of Scope
Explicit list of what's NOT in this feature map (handled elsewhere).

---

# Architecture Guidelines

**Filename:** `docs/context/architecture.md`

**Purpose:** Define the technical implementation approach needed to support all features in feature_map.md. This is the "how"—specific technologies, data flow, and system design.

> The architecture should directly reflect the practical needs of feature_map.md and the Build Constraints in briefing.md.

## Required Sections

### Header Block

```markdown
# [Project Name] — Technical Architecture

**Version:** 2.0
**Last Updated:** YYYY-MM-DD
**Briefing Reference:** `docs/context/briefing.md` (v3)
**Feature Map Reference:** `docs/context/feature_map.md` (v2)

## Changelog
- **v2 (YYYY-MM-DD):** [Summary of changes]
- **v1 (YYYY-MM-DD):** Initial architecture
```

### 1. Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | | |
| Backend | | |
| Database | | |
| Auth | | |

### 2. System Diagram
ASCII or Mermaid diagram showing major components and data flow.

### 3. Data Model
Core entities, relationships, and key fields.

### 4. API Design
Endpoint patterns, key routes, auth approach.

### 5. LLM Integration Pattern (if applicable)
Models, prompt management, cost considerations.

### 6. Pipeline Orchestration (if applicable)
Triggers, state management, error handling.

### 7. Deployment & Infrastructure
Where it runs, environment variables, CI/CD approach.

### 8. Technical Risks & Mitigations
Scaling concerns, dependency risks, security considerations.

### 9. What's NOT in This Architecture (if applicable)
Explicit list of what's handled by external systems.

---

# Maintenance Checklist

When updating any context document:

- [ ] If major change: archive current version to `docs/context/archive/` with version suffix
- [ ] Update the version number and date in the header
- [ ] Add changelog entry
- [ ] Check cross-references still resolve (should be stable with canonical paths)
- [ ] Notify AI in next session: "Context docs have been updated—review [filename]"

---

# Integration with .cursorrules

Your `.cursorrules` should include a reference block:

```markdown
## Project Context

Current context documents (always use these paths):
- Product spec: `docs/context/briefing.md`
- Feature map: `docs/context/feature_map.md`
- Architecture: `docs/context/architecture.md`
- Previous versions: `docs/context/archive/`

Before implementing features, verify alignment with these documents.
If a task conflicts with documented architecture, flag it before proceeding.
Pay special attention to Build Constraints in the briefing — respect scope boundaries.
```

**Critical:** Always reference the canonical filenames (without version suffixes). The AI should NEVER be told to read `briefing_v2.md` or similar — only `briefing.md`. This ensures the current version is always the source of truth without needing to track version numbers in paths or cross-references.

---

# Quick Reference: Versioning Commands

```bash
# Create archive directory if it doesn't exist
mkdir -p docs/context/archive

# Archive and update briefing
cp docs/context/briefing.md docs/context/archive/briefing_v$(grep -m1 "Version:" docs/context/briefing.md | grep -oP '\d+').md
# Then edit docs/context/briefing.md with new version

# Archive and update feature_map
cp docs/context/feature_map.md docs/context/archive/feature_map_v$(grep -m1 "Version:" docs/context/feature_map.md | grep -oP '\d+').md
# Then edit docs/context/feature_map.md with new version

# Archive and update architecture
cp docs/context/architecture.md docs/context/archive/architecture_v$(grep -m1 "Version:" docs/context/architecture.md | grep -oP '\d+').md
# Then edit docs/context/architecture.md with new version
```