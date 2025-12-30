# Slack App

A Slack application built with the Slack Bolt framework.

## Prerequisites

- Node.js 18+
- A Slack workspace with admin access
- Slack App credentials (Bot Token, Signing Secret, App Token)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/tgunawan/slack-app.git
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

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and create a new app
2. Enable Socket Mode under "Socket Mode"
3. Add the following Bot Token Scopes under "OAuth & Permissions":
   - `chat:write`
   - `channels:history`
   - `groups:history`
   - `im:history`
   - `mpim:history`
4. Install the app to your workspace
5. Copy the tokens to your `.env` file

## Development

Run in development mode:
```bash
npm run dev
```

## Production

Build and run:
```bash
npm run build
npm start
```

## Testing

```bash
npm test
```

## Project Structure

```
slack-app/
├── src/
│   ├── handlers/      # Event and command handlers
│   ├── middleware/    # Custom middleware
│   ├── services/      # Business logic
│   ├── utils/         # Utility functions
│   └── index.ts       # Entry point
├── config/            # Configuration files
├── tests/             # Test files
└── dist/              # Compiled output
```

## License

MIT
