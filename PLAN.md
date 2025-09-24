# Project Plan: BlendIntel Core Backend (Chatbox RAG with Pinecone & OpenAI)

## Overview

This project implements a backend for a chatbox Retrieval-Augmented Generation (RAG) system. It leverages Pinecone as a vector database and OpenAI for LLM-powered question answering. The system is designed to answer structured nutrition questions using grounded data from ingredients, smoothies, smoothie bowls, and power eats.

## Tech Stack

- **Backend Language:** TypeScript
- **Schema Validation:** Zod (for type safety and Pinecone compatibility)
- **Vector Database:** Pinecone
- **LLM Provider:** OpenAI
- **Data Sources:** JSON files (ingredients, smoothies, smoothie bowls, power eats)

## Core Features

1. **Data Ingestion & Indexing**

   - Parse and validate nutrition data using Zod schemas.
   - Embed data using OpenAI embeddings API.
   - Store embeddings and metadata in Pinecone.

2. **Chatbox RAG API**

   - Accept user queries (e.g., "What is a smoothie that has 500 calories and 45 grams of protein?").
   - Embed the query and search Pinecone for relevant items.
   - Use OpenAI to generate a human-readable answer, grounded in the retrieved data.
   - Return both a human-readable response and a structured nutrition label for frontend display.

3. **Schema-Driven Development**
   - Use Zod to define and enforce schemas for all data types.
   - Ensure all data sent to Pinecone and OpenAI is type-safe and validated.

## Implementation Steps

1. **Schema Design**

   - Define Zod schemas for ingredients, smoothies, smoothie bowls, and power eats.
   - Validate existing JSON data against schemas.

2. **Data Embedding & Indexing**

   - Write scripts to embed and upsert data into Pinecone.
   - Store relevant metadata for retrieval.

3. **API Development**

   - Build endpoints for chat queries.
   - Integrate Pinecone search and OpenAI completion.
   - Format responses for both human and machine consumption.

4. **Testing & Validation**
   - Unit and integration tests for data validation, embedding, and retrieval.
   - Test end-to-end chat queries and nutrition label generation.

## Best Practices

- Use Zod for all schema validation and type inference.
- Keep Pinecone metadata minimal but sufficient for grounding.
- Ensure all LLM outputs are grounded in retrieved data (no hallucinations).
- Provide both readable and structured responses for frontend flexibility.

## Next Steps

- [ ] Finalize Zod schemas for all data types
- [ ] Validate and clean all source data
- [ ] Set up Pinecone project and index
- [ ] Implement embedding and upsert scripts
- [ ] Build chatbox RAG API endpoints
- [ ] Integrate OpenAI for answer generation
- [ ] Test and iterate

---

This plan will evolve as the project progresses. Update as needed!
