# Slack App

A Slack application built with the Slack Bolt framework, featuring workspace administration via config files.

## Prerequisites

- Node.js 20+
- Docker (optional, for containerized deployment)
- A Slack workspace with admin access
- Slack App credentials (Bot Token, Signing Secret, App Token)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/tgunawandev/slack-app.git
   cd slack-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Configure your Slack credentials in `.env`:
   - `SLACK_BOT_TOKEN`: Your bot user OAuth token (starts with `xoxb-`)
   - `SLACK_SIGNING_SECRET`: Your app's signing secret
   - `SLACK_APP_TOKEN`: Your app-level token (starts with `xapp-`)

## Slack App Configuration

### Option 1: Using the App Manifest (Recommended)

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From an app manifest"
3. Select your workspace
4. Paste the contents of `manifest.yaml`
5. Review and create the app
6. Install to your workspace

### Option 2: Manual Configuration

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and create a new app
2. Enable Socket Mode under "Socket Mode"
3. Add the Bot Token Scopes listed in `manifest.yaml` under "OAuth & Permissions"
4. Subscribe to events listed in `manifest.yaml` under "Event Subscriptions"
5. Install the app to your workspace
6. Copy the tokens to your `.env` file

## Development

Run in development mode:
```bash
npm run dev
```

## Production

### Option 1: Node.js

Build and run:
```bash
npm run build
npm start
```

### Option 2: Docker

Build and run with Docker:
```bash
docker build -t slack-app .
docker run -d --env-file .env -p 3000:3000 slack-app
```

Or use Docker Compose:
```bash
docker compose up -d
```

### Option 3: Use Pre-built Image

Pull from GitHub Container Registry:
```bash
docker pull ghcr.io/tgunawandev/slack-app:latest
docker run -d --env-file .env -p 3000:3000 ghcr.io/tgunawandev/slack-app:latest
```

## Workspace Administration

This repository supports Infrastructure-as-Code for Slack workspace management. Define your workspace resources in YAML files and sync them to Slack.

### Configuration Files

- `workspace/channels.yaml` - Channel definitions (create, update, archive)
- `workspace/usergroups.yaml` - User group definitions (@mentions)
- `workspace/bookmarks.yaml` - Channel bookmarks

### Admin Commands

```bash
# Validate configuration files
npm run admin:validate

# Sync all workspace resources
npm run admin:sync

# Sync specific resources
npm run admin:sync -- --channels
npm run admin:sync -- --usergroups
npm run admin:sync -- --bookmarks

# Preview changes without applying
npm run admin:sync -- --dry-run

# List current workspace state
npm run admin:cli list-channels
npm run admin:cli list-usergroups
npm run admin:cli list-bookmarks general
```

### Required Scopes for Admin Features

The following scopes are required for workspace administration (included in `manifest.yaml`):

| Feature | Required Scopes |
|---------|-----------------|
| Channels | `channels:read`, `channels:manage`, `channels:join`, `groups:read`, `groups:write` |
| User Groups | `usergroups:read`, `usergroups:write`, `users:read`, `users:read.email` |
| Bookmarks | `bookmarks:read`, `bookmarks:write` |

### Workflow

1. Edit the YAML files in `workspace/`
2. Run `npm run admin:validate` to check syntax
3. Create a PR for review
4. After merge, GitHub Actions automatically syncs to Slack

## CI/CD & Deployment

### GitHub Actions Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `ci.yml` | Push/PR to main | Lint, test, type-check, validate config |
| `deploy.yml` | Push to main | Build & push Docker image to ghcr.io |
| `workspace-sync.yml` | Changes to `workspace/` | Auto-sync config to Slack |

### Deploying to Dokploy

1. **Add GitHub Secrets** in your repo settings:
   - `SLACK_BOT_TOKEN` - Required for workspace sync

2. **In Dokploy**, create a new service:
   - Source: Docker Image
   - Image: `ghcr.io/tgunawandev/slack-app:latest`
   - Add environment variables from `.env.example`

3. **Configure auto-deploy** (optional):
   - Set up a webhook in Dokploy
   - Uncomment the `deploy-to-dokploy` job in `.github/workflows/deploy.yml`
   - Add `DOKPLOY_WEBHOOK_URL` to GitHub Secrets

### Manual Workspace Sync

You can trigger workspace sync manually from GitHub Actions:
1. Go to Actions → "Workspace Sync"
2. Click "Run workflow"
3. Select target (all/channels/usergroups/bookmarks)
4. Optionally enable dry-run mode

## Testing

```bash
npm test
```

## Project Structure

```
slack-app/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI pipeline
│       ├── deploy.yml          # Docker build & push
│       └── workspace-sync.yml  # Auto-sync workspace config
├── manifest.yaml               # Slack app manifest
├── workspace/
│   ├── channels.yaml           # Channel definitions
│   ├── usergroups.yaml         # User group definitions
│   └── bookmarks.yaml          # Channel bookmarks
├── src/
│   ├── admin/                  # Admin CLI and sync tools
│   │   ├── cli.ts              # CLI commands
│   │   ├── sync.ts             # Sync orchestrator
│   │   ├── config.ts           # Config file loader
│   │   ├── types.ts            # TypeScript types
│   │   └── commands/           # Individual sync commands
│   ├── handlers/               # Event and command handlers
│   ├── middleware/             # Custom middleware
│   ├── services/               # Business logic
│   ├── utils/                  # Utility functions
│   └── index.ts                # Entry point
├── Dockerfile                  # Production Docker image
├── Dockerfile.sync             # Sync tool Docker image
├── docker-compose.yml          # Docker Compose config
├── config/                     # Configuration files
├── tests/                      # Test files
└── dist/                       # Compiled output
```

## License

MIT
