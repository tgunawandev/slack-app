# CLAUDE.md

This file provides guidance for Claude Code when working with this repository.

## Project Overview

This is a Slack application built with the Slack Bolt framework for Node.js/TypeScript.

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Slack Bolt SDK
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
```

## Project Structure

- `src/index.ts` - Application entry point, initializes Slack Bolt app
- `src/handlers/` - Event handlers, slash commands, and action handlers
- `src/middleware/` - Custom middleware for request processing
- `src/services/` - Business logic and external service integrations
- `src/utils/` - Helper functions and utilities
- `config/` - Configuration files
- `tests/` - Test files

## Environment Variables

Required environment variables (see `.env.example`):
- `SLACK_BOT_TOKEN` - Bot user OAuth token
- `SLACK_SIGNING_SECRET` - App signing secret
- `SLACK_APP_TOKEN` - App-level token for Socket Mode

## Development Guidelines

1. **Event Handlers**: Add new Slack event handlers in `src/handlers/`
2. **Slash Commands**: Register commands in `src/handlers/` and configure in Slack App settings
3. **Error Handling**: Wrap async handlers with try-catch and log errors appropriately
4. **Type Safety**: Use TypeScript types from `@slack/bolt` for event payloads

## Testing

- Unit tests go in `tests/` directory
- Use Jest for testing
- Mock Slack API calls in tests
