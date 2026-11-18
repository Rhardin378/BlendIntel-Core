# BlendIntel — Interview Prep (RAG / Fintech-Style Depth)

This document is tailored to **BlendIntel Core** in this repository: Next.js RAG over Smoothie King menu data (Pinecone + OpenAI embeddings + BGE reranker + GPT-3.5). Use it to sound specific, not generic.

---

## 1. STAR stories (conversational, interview-ready)

### A. Technical challenge — retrieval looked “smart” but violated user intent (category + noisy similarity)

**Situation:** Users could filter to “smoothies only,” but vector search still surfaced **smoothie bowls** or **power eats** when names or descriptions were semantically close to the query.

**Task:** Keep recall high enough for fuzzy natural language, but **respect explicit product-type constraints** without breaking multi-category search.

**Action:** You combined **metadata filters at query time** in Pinecone (`$and` / `$in` / `$nin` / `$ne`) with awareness that **scraped category strings were inconsistent** (e.g. `"Smoothie Bowl"` vs `"smoothie bowl"`). The fix was to **encode both spellings in the filter** so the database constraint matched real data, not an idealized schema. Separately, you widened initial retrieval (`topK * 3` candidates) so filtering + later reranking still had enough candidates.

**Result:** Category tabs behave like users expect: semantic search **inside** the chosen product family, not “nearby” products that only look similar in embedding space.

**One-line takeaway:** *Bi-encoder similarity is cheap and broad; product rules live in metadata and filters, not in vibes.*

---

### B. Design / architecture — why RAG, and how data flows end-to-end

**Situation:** You needed accurate nutrition (macros, allergens, sizes) from a **changing commercial menu**, surfaced through **natural language** (“high protein, strawberries, under X calories”).

**Task:** Recommend items users can order, with **grounded facts** the UI can render (FDA-style label components), without training a proprietary model on proprietary menu distributions.

**Action — why RAG (not “just ChatGPT”):**

- **Grounding:** Retrieved rows carry **canonical menu fields** (flattened `nutrition_*`, ingredients, allergens, sizes). The model explains; the **card + JSON** are the source of truth for numbers.
- **Update path:** New scrape → `embed.js` (embedding text you designed per item type) → `upload-to-pinecone.js` (sanitize + batch upsert). No full model retrain for menu edits.
- **Latency/cost control:** `text-embedding-3-small` at **512 dimensions** balances quality vs index cost; two-stage retrieval avoids paying reranker on the whole catalog.

**Data flow (tight version):**

1. **Offline:** Scrape → JSON → **concatenated “embedding text”** per item (name, description, category, ingredients, nutrition blobs) → embeddings → Pinecone upsert with **sanitized, filter-friendly metadata**.
2. **Online:** User query → **same embedding model/dim** → Pinecone **vector query + optional metadata filter** → **30-ish candidates** (implementation: `topK * 3` when `topK` defaults to 10) → **BGE-Reranker-v2-m3** over a **rich string** built from metadata → top set → **GPT-3.5** explains using structured top results.

**Result:** Architecture matches how fintech teams talk about ML systems: **deterministic data plane** (vectors + metadata + filters) + **probabilistic presentation layer** (LLM copy), with an explicit **precision stage** (reranker) between them.

---

### C. Debugging — “wrong calories” or inconsistent sizes (data plane, not the model)

**Situation:** Some vectors showed **implausible default sizes** or mismatched nutrition after ingestion.

**Task:** Make **display nutrition** correspond to a **single, explicit default size** per item while still listing all `availableSizes`.

**Action:** In `upload-to-pinecone.js`, `sanitizeMetadata` picks a **default size key** (prefers “medium” / 32oz-style keys, then fallbacks), then **flattens** nested `sizeInformation` into scalar metadata (`nutrition_calories`, etc.). You also added **defensive normalization** for common scrape typos (e.g. mapping erroneous size numbers like 320 → 32) so metadata stays in the **valid serving grid** the UI expects.

**Result:** Fewer “right item, wrong numbers” failures — classic lesson: **when RAG looks dumb, inspect retrieval text and metadata first**, not the prompt.

---

## 2. Simple system explanation (use this skeleton in interviews)

### Data ingestion

- Source: **scraped menu JSON** (`data/scrapedData/…`) for smoothies, bowls, power eats, ingredients.
- **Zod schemas** exist for validation (schema-driven approach in `PLAN.md` / `schemas/`).

### Data processing (“chunking” — be precise in interviews)

- This is **not** long-document chunking (no sliding windows over PDFs). Each **menu item is one retrieval unit** (one vector id per item).
- **Indexing text** is a **hand-crafted string** per entity type in `scripts/embed.js` (name, description, category, ingredients/allergens, serialized nutrition / `sizeInformation`).
- **Metadata shaping** in `upload-to-pinecone.js`: flatten nested nutrition, cap ingredient list length, normalize sizes — because Pinecone metadata must be **structured and filter-safe**.

### Retrieval logic

- **Bi-encoder retrieval:** query embedding vs index vectors (cosine in Pinecone).
- **Optional hard constraints:** Pinecone **metadata filter** by product category (with case-aware `$in` / `$nin` patterns).
- **Recall knob:** fetch **`topK * 3`** before reranking.
- **Cross-encoder rerank:** Pinecone inference **`bge-reranker-v2-m3`** on documents whose `text` field concatenates the same nutrition fields the user cares about in queries.

### How the model uses retrieved data

- Reranker output → **top 5** structured objects → passed as **`JSON.stringify(topFiveResults)`** in the user message to **GPT-3.5-turbo** with a **Smoothie King nutrition assistant** system prompt.
- **UI still renders** structured nutrition from API fields; the LLM is for **explanation and comparison language**, not for being the database.

---

## 3. Key tradeoffs (name them explicitly)

| Tradeoff | What you chose | What you give up |
|----------|----------------|------------------|
| **Accuracy vs latency** | Two-stage retrieve → rerank → LLM | Extra round trip (rerank inference) vs pure vector top-K |
| **Simplicity vs scalability** | In-memory IP rate limit in the route handler | Works for demo / single region; **not** horizontally consistent without Redis or edge limits |
| **Retrieval quality vs performance** | Wider candidate pool + cross-encoder rerank | More documents scored; tuned via `topK` and multiplier |
| **Embedding quality vs cost** | `text-embedding-3-small` @ **512d** | Slightly less expressive than full dim / larger models — acceptable for bounded catalog |
| **Flexibility vs safety** | LLM `temperature: 0.7` for friendly copy | Slightly more lexical variance; mitigated by grounding JSON and UI-owned numbers |

---

## 4. Deep follow-up questions (6–8)

1. **How did you determine relevance — vector score vs rerank score vs business rules?**
2. **Why 512-dimensional embeddings instead of the model default? What breaks if dims mismatch?**
3. **When do you filter in Pinecone vs filtering after retrieval in application code?**
4. **How do you prevent the LLM from inventing macros or allergens not in the retrieved JSON?**
5. **How would you evaluate retrieval quality in production (offline metrics + online signals)?**
6. **The rate limiter is in-memory — what happens on serverless cold starts, multiple instances, or IP spoofing behind proxies?**
7. **If the menu doubled or went multi-brand, how would you change the index design (namespaces, separate indexes, routing)?**
8. **What’s your incident story if Pinecone or the reranker returns partial/empty results?**

---

## 5. Strong answers to those follow-ups

### 1) Determining relevance

“I use **three layers**. First, **cosine similarity** in Pinecone for cheap semantic recall. Second, **BGE reranker** scores *query–document pairs*, which is much better for **multi-constraint** language than a single embedding dot product. Third, **hard filters** for product type when the UI promises ‘smoothies only’ — that’s a **business rule**, not something I’d trust embeddings to always respect.”

### 2) 512 dimensions

“I pinned **embedding dim = index dim**. `text-embedding-3-small` supports **Matryoshka-style** truncation to 512d, which cuts storage and query cost for a **few hundred vectors** without much loss for this domain. If dims mismatch, Pinecone **rejects the query** — I validate dimension on index creation in the upload script.”

### 3) Pinecone filter vs post-filter

“Filters that are **exact categorical constraints** belong **in Pinecone** so I don’t burn reranker budget on illegal candidates. **Soft preferences** (‘kind of fruity’, ‘feels light’) stay in vector + reranker space. If metadata is messy, I **normalize at ingest** so filters stay simple.”

### 4) Hallucination / invented nutrition

“**Numbers in the UI come from structured API fields**, not from parsing the model’s prose. In the prompt I pass **explicit JSON** for the top items and ask for a brief rationale. That’s not mathematically guaranteed — for a regulated nutrition claim in production I’d add **tool-use / templated copy**, **numeric diffing**, or **disallow free numbers** in the assistant text.”

### 5) Evaluation

“I’d separate **retrieval eval** from **copy eval**. Offline: labeled query sets with expected item ids, **MRR / nDCG**, and constraint checks (‘must contain strawberry’, ‘protein ≥ X’). Online: **click-through**, reformulations, ‘did you mean’ rate, and downstream **complaint / correction** signals. For nutrition specifically, I’d add **automated assertions** that returned metadata satisfies parsed thresholds when the query encodes them.”

### 6) In-memory rate limiting on serverless

“It’s fine for a **demo cost guard**. For production I’d move limits to **Redis / Upstash**, or the **edge / API gateway**, with **token bucket** keys that include user id or authenticated subject, not only `x-forwarded-for`. I’d also log **429** ratios as a product signal, not only abuse protection.”

### 7) Scale / multi-brand

“I’d likely split by **namespace or index per brand** to keep embeddings and vocabulary separate, with a **router** that classifies brand intent or uses explicit UI context. Shared reranker is OK; **shared metadata schema** must be consistent or you lose filter ergonomics.”

### 8) Partial failures

“I’d degrade gracefully: if rerank fails, **fall back to vector order**; if LLM fails, still return **ranked items + metadata** with a static template line. Observability-wise I’d **correlate latency** per stage (embed, query, rerank, LLM) so one slow dependency doesn’t look like ‘the app is random.’”

---

## 6. Talking points — responsible AI, debugging, data quality

### Responsible use of AI (not blindly)

- **Ground the generative step:** retrieved JSON + deterministic nutrition rendering in the client.
- **Scope the assistant:** system prompt frames it as **Smoothie King nutrition help**, not medical advice.
- **Operational guardrails:** **rate limiting** on the expensive route (`/api/nutritionSearchRerank`).
- **Transparency:** show **ingredients, allergens, sizes** explicitly — users can verify claims.

### How you debug pipeline issues

- **Triage:** wrong item vs **right item, wrong numbers** vs **wrong tone only**.
- **Inspect the document string** fed to the reranker (it mirrors user priorities: macros, ingredients, allergens).
- **Log stage timings** mentally: embedding mismatch, empty matches, rerank returning fewer than K.
- **Reproduce with curl** against `nutritionSearch` vs `nutritionSearchRerank` to isolate vector vs rerank vs LLM.

### Data quality impact

- Scraped **category strings** directly affected **filter correctness** — fixed at the **constraint layer**, not by prompting harder.
- Nested `sizeInformation` required **flattening + default-size policy** so calories weren’t ambiguous.
- **Typo normalization** in metadata prevented absurd default servings from poisoning trust.

---

## 7. Where a junior or vague answer might slip in (fix these)

| Vague phrasing | Why it weakens you | Sharper replacement |
|----------------|--------------------|---------------------|
| “We used RAG for accuracy” | Doesn’t say *what* was retrieved or *why* hallucinations drop | “**One vector per menu item**, reranked with **cross-encoder**, numbers from **metadata** not from the LLM” |
| “The model knows nutrition” | Sounds like memorization / liability | “The **database of flattened macros** knows nutrition; the model **explains** top-K” |
| “We chunked the data” | Interviewers picture LangChain PDF splitters | “**Entity-level indexing**, not sub-document chunks; text is a **constructed embedding string**” |
| “It’s real-time” | README notes multi-second paths | “**Interactive** latency: parallel opportunities exist, but serial **embed → query → rerank → LLM** dominates” |
| “95%+ accuracy” (from `sprint.md`) | Unless you defined tests, it sounds made up | “**On a hand-built query suite** we tracked top-1 / top-3 hit rate; production would need continuous eval” |
| “We used filters” | No technical depth | “Pinecone **metadata filters** with `$and` / `$in` / `$nin` to enforce category” |

---

## 8. 60-second “Tell me about a technical project” (clean script)

“I built **BlendIntel**, a nutrition search product for a large smoothie menu. The core is a **RAG-style pipeline**: each menu item becomes a **vector** with rich **metadata** — calories, protein, ingredients, allergens, sizes — using **OpenAI embeddings** at **512 dimensions** stored in **Pinecone**.

On a query, I embed the user’s natural language, do a **vector search** with optional **metadata filters** when the user picks smoothies, bowls, or power eats — that part was important because **similarity alone leaked categories** when names overlapped.

I then **rerank** the top candidates with **BGE-Reranker** so multi-constraint questions rank correctly, and finally use **GPT-3.5** to write a short, friendly explanation. The UI still renders **structured nutrition facts** from the API, so we’re not trusting the model for exact numbers.

Offline, I scripted **embed and upsert**, with **metadata sanitization** that flattens nested nutrition and normalizes serving sizes from messy scrapes. The interesting engineering lessons were **data quality beats prompt tricks**, and **splitting bi-encoder recall from cross-encoder precision** is the same pattern you see in search stacks at scale — just applied to a commerce menu.”

---

## Quick map to code (for your own study)

| Concern | Where it lives |
|---------|----------------|
| Embedding strings per item type | `scripts/embed.js` |
| Metadata flattening, size defaults, typo guards | `scripts/upload-to-pinecone.js` (`sanitizeMetadata`) |
| Vector query + optional filter + rerank | `src/app/api/nutritionSearchRerank/route.ts` |
| Baseline vector search (no rerank) | `src/app/api/nutritionSearch/route.ts` |
| Pinecone client helpers | `libs/pinecone.ts`, `libs/pinecone.js` |
| Embeddings API | `libs/openai.ts` |

---

*Generated from the BlendIntel Core repo structure and implementation as of the interview-prep authoring date.*
