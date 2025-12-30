import { App } from '@slack/bolt';
import dotenv from 'dotenv';

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// Example message listener
app.message('hello', async ({ message, say }) => {
  await say(`Hello there!`);
});

(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`Slack app is running on port ${port}`);
})();
