# CLAUDE.md - kodemeio-slack-app

This file provides guidance for Claude Code when working with this repository.

## Project Overview

This is **kodemeio-slack-app**, a Slack application for **kodeme.io** platform built with the Slack Bolt framework for Node.js/TypeScript. It includes:
- Slack bot functionality (events, commands, interactions)
- Workspace administration via config files (Infrastructure-as-Code)
- Docker containerization for deployment
- GitHub Actions CI/CD pipelines

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Slack Bolt SDK, Slack Web API
- **Config**: YAML (js-yaml)
- **Testing**: Jest
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Registry**: GitHub Container Registry (ghcr.io)

## Common Commands

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Admin: Validate workspace config
npm run admin:validate

# Admin: Sync workspace resources
npm run admin:sync
npm run admin:sync -- --channels
npm run admin:sync -- --usergroups
npm run admin:sync -- --bookmarks
npm run admin:sync -- --dry-run

# Admin: CLI tools
npm run admin:cli list-channels
npm run admin:cli list-usergroups
npm run admin:cli list-bookmarks <channel>
```

## Docker Commands

```bash
# Build production image
docker build -t slack-app .

# Run container
docker run -d --env-file .env -p 3000:3000 slack-app

# Docker Compose
docker compose up -d

# Run workspace sync in container
docker compose run --rm workspace-sync

# Pull pre-built image
docker pull ghcr.io/tgunawandev/slack-app:latest
```

## Project Structure

### Application Code
- `src/index.ts` - Application entry point, initializes Slack Bolt app
- `src/handlers/` - Event handlers, slash commands, and action handlers
- `src/middleware/` - Custom middleware for request processing
- `src/services/` - Business logic and external service integrations
- `src/utils/` - Helper functions and utilities

### Admin Tools
- `src/admin/sync.ts` - Main sync orchestrator, runs all sync commands
- `src/admin/cli.ts` - CLI tool for listing resources and validation
- `src/admin/config.ts` - YAML config file loader
- `src/admin/types.ts` - TypeScript interfaces for config files
- `src/admin/commands/channels.ts` - Channel sync logic
- `src/admin/commands/usergroups.ts` - User group sync logic
- `src/admin/commands/bookmarks.ts` - Bookmark sync logic

### Configuration Files
- `manifest.yaml` - Slack app manifest (scopes, events, commands)
- `workspace/channels.yaml` - Channel definitions
- `workspace/usergroups.yaml` - User group definitions
- `workspace/bookmarks.yaml` - Channel bookmark definitions

### Docker Files
- `Dockerfile` - Production multi-stage build (non-root user)
- `Dockerfile.sync` - For running workspace sync commands
- `docker-compose.yml` - Local development and deployment
- `.dockerignore` - Excludes unnecessary files from build

### CI/CD
- `.github/workflows/ci.yml` - Lint, test, type-check, validate config
- `.github/workflows/deploy.yml` - Build and push Docker image to ghcr.io
- `.github/workflows/workspace-sync.yml` - Auto-sync workspace config on changes

## Environment Variables

Required environment variables (see `.env.example`):
- `SLACK_BOT_TOKEN` - Bot user OAuth token (xoxb-)
- `SLACK_SIGNING_SECRET` - App signing secret
- `SLACK_APP_TOKEN` - App-level token for Socket Mode (xapp-)
- `PORT` - Server port (default: 3000)

## GitHub Actions Secrets

Required secrets for CI/CD:
- `SLACK_BOT_TOKEN` - Required for workspace-sync workflow
- `DOKPLOY_WEBHOOK_URL` - Optional, for auto-deploy to Dokploy

## Development Guidelines

### Event Handlers
- Add new Slack event handlers in `src/handlers/`
- Register events in `manifest.yaml` under `settings.event_subscriptions.bot_events`

### Slash Commands
- Define commands in `manifest.yaml` under `features.slash_commands`
- Implement handlers in `src/handlers/`

### Workspace Administration
- Edit YAML files in `workspace/` to manage channels, user groups, bookmarks
- Run `npm run admin:validate` before committing
- Changes to `workspace/` auto-sync via GitHub Actions on merge to main
- Sync commands are idempotent - safe to run multiple times

### Adding New Admin Features
1. Define types in `src/admin/types.ts`
2. Add config loader in `src/admin/config.ts`
3. Create sync command in `src/admin/commands/`
4. Register in `src/admin/sync.ts`

### Docker Builds
- Production image uses multi-stage build for smaller size
- Runs as non-root user for security
- Health check included
- Supports both amd64 and arm64 architectures

### CI/CD Pipeline
- All pushes/PRs to main trigger CI (lint, test, validate)
- Merges to main trigger Docker build and push to ghcr.io
- Changes to `workspace/` trigger automatic Slack sync
- Manual workflow dispatch available for workspace sync

### Error Handling
- Wrap async handlers with try-catch
- Admin commands collect errors and report at end
- Use `--dry-run` flag to preview changes

### Type Safety
- Use TypeScript types from `@slack/bolt` for event payloads
- Use types from `@slack/web-api` for API responses
- Config types are defined in `src/admin/types.ts`

## Testing

- Unit tests go in `tests/` directory
- Use Jest for testing
- Mock Slack API calls in tests
- CI runs tests automatically on push/PR

## Deployment

### Dokploy
1. Create service with image `ghcr.io/tgunawandev/slack-app:latest`
2. Add environment variables from `.env.example`
3. Optionally configure webhook for auto-deploy

### Manual
```bash
docker pull ghcr.io/tgunawandev/slack-app:latest
docker run -d --env-file .env -p 3000:3000 ghcr.io/tgunawandev/slack-app:latest
```
