# BlendIntel Core

BlendIntel Core is a full-stack TypeScript project for intelligent nutrition chat experiences. It leverages Pinecone for vector search and OpenAI for natural language understanding, enabling users to ask detailed, structured questions about smoothies, smoothie bowls, ingredients, and power eats. All responses are grounded in validated nutrition data, delivering both human-readable answers and structured nutrition labels. The TypeScript frontend features an interactive chatbox for a seamless and informative user experience.

## Technologies Used

- **TypeScript** (frontend & backend)
- **Next.js** (frontend framework)
- **Zod** (schema validation)
- **Pinecone** (vector database for semantic search)
- **OpenAI** (LLM for question answering)
- **React** (UI components)
- **Node.js** (backend runtime)

## Features

- Nutrition data ingestion and validation
- Semantic search and retrieval-augmented generation (RAG)
- Structured and human-readable nutrition responses
- Interactive chatbox frontend

---

_This README is a work in progress and will be updated as the project evolves._

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
