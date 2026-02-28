# Markhub

**Share and discover agent markdown files.**

Markhub is a GitHub-like platform for sharing markdown files—specifically designed for AI agents, system prompts, and configuration files. Think of it as "GitHub Gist meets ClawdHub" with first-class support for agent-related content.

🌐 **Website:** [markhub.md](https://markhub.md)

## Features

- 📝 **Upload & Share** — Publish your agent configs, AGENTS.md files, and prompts
- 🔍 **Discover** — Browse and search community-shared markdown files
- ⭐ **Star & Comment** — Engage with files you find useful
- 🔒 **Visibility Controls** — Public, unlisted, or private files
- 💻 **CLI Support** — Push and pull files from the command line

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL |
| ORM | Prisma |
| Styling | Tailwind CSS |
| Auth | NextAuth.js + GitHub OAuth |
| Hosting | Render |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-required routes
│   │   └── dashboard/     # User's file management
│   ├── (public)/          # Public routes
│   │   └── [username]/    # Profile and file views
│   └── api/               # API routes
│       └── health/        # Health check endpoint
├── components/            # React components
├── lib/                   # Shared utilities
│   ├── auth.ts           # Authentication helpers
│   ├── db.ts             # Database client
│   └── utils.ts          # General utilities (cn, etc.)
└── prisma/
    └── schema.prisma     # Database schema
```

## URL Structure

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/explore` | Search and browse files |
| `/dashboard` | Your files (requires auth) |
| `/settings` | Profile settings (requires auth) |
| `/[username]` | Public profile |
| `/[username]/[...path]` | View file (e.g., `/john/agents/memory.md`) |
| `/[username]/[...path]/raw` | Raw markdown view |

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  githubId  Int      @unique
  username  String   @unique
  name      String?
  avatar    String?
  bio       String?
  files     File[]
  stars     Star[]
  comments  Comment[]
  createdAt DateTime @default(now())
}

model File {
  id         String     @id @default(cuid())
  userId     String
  path       String     // e.g., "agents.md" or "project/memory.md"
  content    String
  visibility Visibility @default(PUBLIC)
  stars      Star[]
  comments   Comment[]
  starCount  Int        @default(0)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  
  @@unique([userId, path])
}

model Star {
  userId    String
  fileId    String
  createdAt DateTime @default(now())
  
  @@id([userId, fileId])
}

model Comment {
  id        String   @id @default(cuid())
  userId    String
  fileId    String
  content   String
  createdAt DateTime @default(now())
}

enum Visibility {
  PUBLIC
  UNLISTED
  PRIVATE
}
```

## CLI (Coming Soon)

```bash
markhub login              # GitHub device flow
markhub logout             # Clear local token
markhub whoami             # Show logged in user
markhub list               # List your files
markhub push <file>        # Upload file
markhub pull <user/path>   # Download file
```

## Development

### Prerequisites

- Node.js 18+
- PostgreSQL (local or remote)
- GitHub OAuth app credentials

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/cristiandan/markhub.git
   cd markhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   ```
   http://localhost:3000
   ```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

---

Built with ❤️ for the agent community.
