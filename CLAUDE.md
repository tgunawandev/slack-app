# CLAUDE.md

This file provides guidance for Claude Code when working with this repository.

## Project Overview

This is a Slack application built with the Slack Bolt framework for Node.js/TypeScript. It includes workspace administration tools that allow managing Slack resources via config files (Infrastructure-as-Code).

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Slack Bolt SDK, Slack Web API
- **Config**: YAML (js-yaml)
- **Testing**: Jest

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

# Admin: CLI tools
npm run admin:cli list-channels
npm run admin:cli list-usergroups
npm run admin:cli list-bookmarks <channel>
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

### Configuration
- `manifest.yaml` - Slack app manifest (scopes, events, commands)
- `workspace/channels.yaml` - Channel definitions
- `workspace/usergroups.yaml` - User group definitions
- `workspace/bookmarks.yaml` - Channel bookmark definitions
- `config/` - Additional configuration files
- `tests/` - Test files

## Environment Variables

Required environment variables (see `.env.example`):
- `SLACK_BOT_TOKEN` - Bot user OAuth token (xoxb-)
- `SLACK_SIGNING_SECRET` - App signing secret
- `SLACK_APP_TOKEN` - App-level token for Socket Mode (xapp-)

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
- Run `npm run admin:sync` to apply changes to Slack
- Sync commands are idempotent - safe to run multiple times

### Adding New Admin Features
1. Define types in `src/admin/types.ts`
2. Add config loader in `src/admin/config.ts`
3. Create sync command in `src/admin/commands/`
4. Register in `src/admin/sync.ts`

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
