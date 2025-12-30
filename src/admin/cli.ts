#!/usr/bin/env node
import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';

dotenv.config();

const COMMANDS = {
  'list-channels': listChannels,
  'list-usergroups': listUserGroups,
  'list-bookmarks': listBookmarks,
  'validate': validateConfig,
  'help': showHelp,
};

async function getClient(): Promise<WebClient> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error('Error: SLACK_BOT_TOKEN environment variable is required');
    process.exit(1);
  }
  return new WebClient(token);
}

async function listChannels() {
  const client = await getClient();
  console.log('Fetching channels...\n');

  let cursor: string | undefined;
  const channels: { name: string; id: string; is_private: boolean; num_members: number }[] = [];

  do {
    const response = await client.conversations.list({
      types: 'public_channel,private_channel',
      exclude_archived: true,
      cursor,
    });

    for (const channel of response.channels || []) {
      channels.push({
        name: channel.name || '',
        id: channel.id || '',
        is_private: channel.is_private || false,
        num_members: channel.num_members || 0,
      });
    }

    cursor = response.response_metadata?.next_cursor;
  } while (cursor);

  channels.sort((a, b) => a.name.localeCompare(b.name));

  console.log('Channels:');
  for (const channel of channels) {
    const visibility = channel.is_private ? '(private)' : '(public)';
    console.log(`  #${channel.name} ${visibility} - ${channel.num_members} members`);
  }
  console.log(`\nTotal: ${channels.length} channels`);
}

async function listUserGroups() {
  const client = await getClient();
  console.log('Fetching user groups...\n');

  const response = await client.usergroups.list({ include_users: true });

  console.log('User Groups:');
  for (const group of response.usergroups || []) {
    const memberCount = group.users?.length || 0;
    const status = group.date_delete ? '(disabled)' : '(active)';
    console.log(`  @${group.handle} - ${group.name} ${status} - ${memberCount} members`);
  }
  console.log(`\nTotal: ${response.usergroups?.length || 0} user groups`);
}

async function listBookmarks() {
  const client = await getClient();
  const channelName = process.argv[4];

  if (!channelName) {
    console.error('Usage: npm run admin:cli list-bookmarks <channel-name>');
    process.exit(1);
  }

  // Find channel ID
  let channelId: string | undefined;
  let cursor: string | undefined;

  do {
    const response = await client.conversations.list({
      types: 'public_channel,private_channel',
      exclude_archived: true,
      cursor,
    });

    for (const channel of response.channels || []) {
      if (channel.name === channelName) {
        channelId = channel.id;
        break;
      }
    }

    cursor = response.response_metadata?.next_cursor;
  } while (cursor && !channelId);

  if (!channelId) {
    console.error(`Channel not found: #${channelName}`);
    process.exit(1);
  }

  const response = await client.bookmarks.list({ channel_id: channelId });

  console.log(`Bookmarks in #${channelName}:`);
  for (const bookmark of response.bookmarks || []) {
    console.log(`  ${bookmark.emoji || ''} ${bookmark.title}: ${bookmark.link}`);
  }
  console.log(`\nTotal: ${response.bookmarks?.length || 0} bookmarks`);
}

async function validateConfig() {
  console.log('Validating workspace configuration...\n');

  try {
    const { loadChannelsConfig, loadUserGroupsConfig, loadBookmarksConfig } = await import('./config');

    console.log('Checking channels.yaml...');
    const channels = loadChannelsConfig();
    console.log(`  Found ${channels.channels.length} channel definitions`);
    if (channels.archive?.length) {
      console.log(`  Found ${channels.archive.length} channels to archive`);
    }

    console.log('\nChecking usergroups.yaml...');
    const usergroups = loadUserGroupsConfig();
    console.log(`  Found ${usergroups.usergroups.length} user group definitions`);
    if (usergroups.disable?.length) {
      console.log(`  Found ${usergroups.disable.length} groups to disable`);
    }

    console.log('\nChecking bookmarks.yaml...');
    const bookmarks = loadBookmarksConfig();
    const channelCount = Object.keys(bookmarks.bookmarks).length;
    const bookmarkCount = Object.values(bookmarks.bookmarks).reduce((sum, b) => sum + b.length, 0);
    console.log(`  Found ${bookmarkCount} bookmarks across ${channelCount} channels`);

    console.log('\nConfiguration is valid!');
  } catch (error) {
    console.error('Configuration error:', error);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
Slack Workspace Admin CLI

Usage: npm run admin:cli <command> [options]

Commands:
  list-channels              List all channels in the workspace
  list-usergroups            List all user groups in the workspace
  list-bookmarks <channel>   List bookmarks in a specific channel
  validate                   Validate workspace configuration files
  help                       Show this help message

Sync Commands:
  npm run admin:sync                 Sync all workspace resources
  npm run admin:sync -- --channels   Sync only channels
  npm run admin:sync -- --usergroups Sync only user groups
  npm run admin:sync -- --bookmarks  Sync only bookmarks
  npm run admin:sync -- --dry-run    Preview changes without applying
`);
}

async function main() {
  const command = process.argv[3] || 'help';
  const handler = COMMANDS[command as keyof typeof COMMANDS];

  if (!handler) {
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }

  await handler();
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
