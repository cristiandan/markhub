# Markhub CLI

Command-line interface for [Markhub](https://markhub.md) - share and discover agent markdown files.

## Installation

```bash
npm install -g markhub
```

## Commands

### Authentication

```bash
# Login with GitHub
markhub login

# Show current user
markhub whoami

# Logout
markhub logout
```

### File Operations

```bash
# Upload a file
markhub push README.md
markhub push agents/memory.md --visibility private
markhub push myfile.md --path agents/memory.md

# Download a file
markhub pull username/file.md
markhub pull username/agents/memory.md --output local.md

# List your files
markhub list
markhub list --all  # Include private/unlisted
```

## Configuration

Config is stored in `~/.config/markhub/config.json`:

```json
{
  "token": "...",
  "user": {
    "id": "...",
    "username": "...",
    "name": "..."
  },
  "apiUrl": "https://markhub.md"
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development
npm run dev

# Type check
npm run typecheck
```

## License

MIT
