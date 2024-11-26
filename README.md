## TODO

- [ ] UI input for a YouTube video URL
- [ ] Transcribe using Groq

Based on the code and transcripts provided, here's a plan for building your RAG app for Blender tutorial transcripts:

### Current Status

- You have a collection of markdown transcripts from a Blender 3D modeling tutorial series
- Basic ChromaDB setup started but incomplete
- Some file handling and transcription code exists
- Integration with Claude API started

### Plan & TODO List

1. **Data Preprocessing**

```typescript
// Create a transcript processor to:
- Extract clean text from markdown files
- Split transcripts into smaller chunks (e.g., ~500-1000 tokens)
- Add metadata like video number, title, timestamp
```

2. **ChromaDB Setup & Population**

```typescript
// Enhance ChromaDB integration:
- Create a proper collection with meaningful name
- Define schema for documents (text, metadata)
- Implement batch embedding and insertion
- Add error handling and logging
```

3. **Query Interface**

```typescript
// Build query handling:
- Create function to search similar chunks
- Implement relevance scoring
- Add context window handling
- Format results for Claude
```

4. **Claude Integration**

```typescript
// Enhance Claude integration:
- Create proper system prompt
- Handle context injection
- Implement conversation history
- Add error handling
```

5. **Application Flow**

```typescript
// Main application logic:
- User input handling
- Context retrieval from ChromaDB
- Prompt construction
- Response generation
- Conversation management
```

### Suggested Implementation Order:

1. **First Phase - Data Layer**

```typescript
// actions.ts
async function processTranscripts() {
  // Load and clean transcripts
  // Split into chunks
  // Store in ChromaDB
}

async function queryChroma(question: string) {
  // Search relevant chunks
  // Return formatted results
}
```

2. **Second Phase - AI Layer**

```typescript
// actions.ts
async function generateResponse(question: string, context: string) {
  // Format prompt with context
  // Call Claude API
  // Process response
}
```

3. **Third Phase - Integration**

```typescript
// actions.ts
export async function handleQuestion(question: string) {
  // Get relevant context
  // Generate response
  // Handle errors
  // Return formatted response
}
```

4. **Fourth Phase - Refinement**

- Add error handling
- Improve context selection
- Optimize chunk size
- Add caching if needed
- Improve response quality

Would you like me to provide more detailed implementation suggestions for any of these components?
