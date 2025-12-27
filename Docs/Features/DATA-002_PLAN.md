# DATA-002: Dictionary API Integration — Plan

Integrate with the Free Dictionary API to provide word definitions and example sentences for educational feedback. This data layer serves both the end-of-game summary [UI-004] and the mid-game hint [UI-005].

## Relevant Files and Functions

### `js/game.js`
- **`DEFINITION_CACHE`**: A `Map` to store fetched definitions to minimize redundant API calls.
- **`fetchDefinition(word)`**: The primary asynchronous function for retrieving word data.

## Proposed Logic

### 1. Data Retrieval Algorithm (`fetchDefinition`)
1.  **Normalization**: Convert the input `word` to lowercase for consistent cache keys and API compatibility.
2.  **Cache Check**: If the word exists in `DEFINITION_CACHE`, return the cached object immediately.
3.  **API Call**: Use `fetch()` to call `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`.
4.  **Error Handling (API)**: 
    - If the response status is not OK (e.g., 404 word not found), throw an error to trigger the catch block.
5.  **Parsing**:
    - Extract JSON data.
    - Navigate the nested structure: `data[0].meanings[0].definitions[0]`.
    - Capture `definition` (string) and `example` (string or null).
6.  **Persistence**: Store a result object `{ definition, example }` in the `DEFINITION_CACHE`.
7.  **Error Handling (Catch)**:
    - Log the error to the console.
    - Return a fallback object with a "Definition unavailable" message to ensure the UI doesn't break.

## Phase 1: Data Layer

1.  Initialize `DEFINITION_CACHE` Map.
2.  Implement `async function fetchDefinition(word)`.
3.  Test with various words (common, obscure, non-existent) to verify caching and error handling.
