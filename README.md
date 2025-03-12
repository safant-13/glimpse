# Glimpse

> Glimpse into your IDEAS - Visualize code concepts instantly

Glimpse is an interactive web application that allows you to quickly transform your ideas into visual code prototypes. Simply describe what you want to create, and Glimpse will generate and render the code for you in real-time.

## 🌟 Features

- **Multi-framework Support**: Generate code in React, P5.js, or classic HTML/CSS/JavaScript
- **Live Preview**: See your code running in real-time
- **Code Editing**: Modify the generated code directly in the browser
- **AI-powered Suggestions**: Get intelligent recommendations to improve your code
- **Multiple AI Providers**: Support for OpenAI, Grok, and Gemini

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- API keys for at least one of the supported AI providers (OpenAI, Grok, or Gemini)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/glimpse.git
cd glimpse
```

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

glimpse/
├── public/                  # Static assets
├── src/
│   ├── agents/              # AI agent system for code analysis
│   │   ├── AgentSystem.tsx  # Core agent system implementation
│   │   └── CodeAnalysisAgent.tsx # Code analysis agent
│   ├── app/                 # Next.js app directory
│   │   ├── api/             # API routes
│   │   │   └── generate/    # Code generation endpoint
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout component
│   │   └── page.tsx         # Main application page
│   ├── components/          # React components
│   │   ├── ClassicViewer.tsx # HTML/CSS/JS viewer
│   │   ├── CodeDisplay.tsx  # Code editor and display
│   │   ├── CodeViewer.tsx   # Generic code viewer
│   │   ├── LogViewer.tsx    # Log display component
│   │   ├── P5Viewer.tsx     # P5.js sketch viewer
│   │   ├── ProgressBar.tsx  # Loading progress indicator
│   │   └── PromptInput.tsx  # User input form
│   ├── lib/                 # Utility functions
│   │   └── logger.ts        # Logging utility
│   └── services/            # External service integrations
│       └── aiService.ts     # AI provider integrations

## 🧠 AI Integration
Glimpse supports multiple AI providers:

- OpenAI : Uses GPT-4o for high-quality code generation
- Grok : Uses Mixtral-8x7b-32768 for efficient code generation
- Gemini : Uses Gemini-1.5-Pro with fallback to Gemini-Pro
To use any provider, you'll need to obtain an API key from their respective platforms:

- OpenAI API Keys
- Grok API Access
- Google AI Studio (Gemini)
## 🤝 Contributing
We welcome contributions to Glimpse! Here's how you can help:

1. create a branch:
`git checkout -b feature/your-feature-name`
2. make your changes and commit them:
`git commit -m "Add your commit message"`
3. push to the branch:
`git push origin feature/your-feature-name`
Open a Pull Request.

### Contribution Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Include tests for new features
- Update documentation as needed
- Make sure all tests pass before submitting a PR
## 📝 Development Roadmap
- Add support for more frameworks (Vue, Svelte, etc.)
- Implement collaborative editing
- Add user accounts and saved projects
- Enhance agent system with more specialized agents
- Improve error handling and feedback