# Micro Analysis Tool

A tool for analyzing and comparing responses in a structured format.

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Usage

1. Place your CSV file in the `public` directory and name it `sample-data.csv`
2. The CSV file should have the following columns:

   - `task_id`: Unique identifier for each task
   - `prompt`: The original prompt or conversation
   - `last_human_message`: The last message from the human
   - `response_A`: First response to compare
   - `response_B`: Second response to compare
   - `Which do you prefer (Response A or Response B)`: Preference between responses
   - `Why do you prefer the one that you do?`: Reasoning for the preference
   - `On a scale from 0-3 (inclusive) how strongly do you prefer the response that you chose?`: Strength of preference

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- View all tasks in a list
- Compare responses side by side
- Collapsible sections for better organization
- Markdown support for formatted text
- Conversation parsing for structured dialogue

## Development

Built with:

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Markdown
- Papa Parse (CSV parsing)

## Getting Started

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
