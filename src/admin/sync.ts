import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';
import { syncChannels } from './commands/channels';
import { syncUserGroups } from './commands/usergroups';
import { syncBookmarks } from './commands/bookmarks';

dotenv.config();

async function main() {
  const token = process.env.SLACK_BOT_TOKEN;

  if (!token) {
    console.error('Error: SLACK_BOT_TOKEN environment variable is required');
    process.exit(1);
  }

  const client = new WebClient(token);

  // Parse command line arguments
  const args = process.argv.slice(2);
  const syncAll = args.length === 0 || args.includes('--all');
  const syncChannelsFlag = syncAll || args.includes('--channels');
  const syncUserGroupsFlag = syncAll || args.includes('--usergroups');
  const syncBookmarksFlag = syncAll || args.includes('--bookmarks');
  const dryRun = args.includes('--dry-run');

  if (dryRun) {
    console.log('DRY RUN MODE - No changes will be made\n');
  }

  console.log('Starting workspace sync...\n');

  const results: Record<string, { created: number; updated: number; archived: number; errors: number }> = {};

  if (syncChannelsFlag) {
    console.log('=== Syncing Channels ===');
    if (!dryRun) {
      const channelResult = await syncChannels(client);
      results.channels = {
        created: channelResult.created.length,
        updated: channelResult.updated.length,
        archived: channelResult.archived.length,
        errors: channelResult.errors.length,
      };
    }
    console.log('');
  }

  if (syncUserGroupsFlag) {
    console.log('=== Syncing User Groups ===');
    if (!dryRun) {
      const userGroupResult = await syncUserGroups(client);
      results.usergroups = {
        created: userGroupResult.created.length,
        updated: userGroupResult.updated.length,
        archived: userGroupResult.archived.length,
        errors: userGroupResult.errors.length,
      };
    }
    console.log('');
  }

  if (syncBookmarksFlag) {
    console.log('=== Syncing Bookmarks ===');
    if (!dryRun) {
      const bookmarkResult = await syncBookmarks(client);
      results.bookmarks = {
        created: bookmarkResult.created.length,
        updated: bookmarkResult.updated.length,
        archived: bookmarkResult.archived.length,
        errors: bookmarkResult.errors.length,
      };
    }
    console.log('');
  }

  // Print summary
  console.log('=== Sync Summary ===');
  for (const [resource, counts] of Object.entries(results)) {
    console.log(`${resource}:`);
    console.log(`  Created: ${counts.created}`);
    console.log(`  Updated: ${counts.updated}`);
    console.log(`  Archived: ${counts.archived}`);
    if (counts.errors > 0) {
      console.log(`  Errors: ${counts.errors}`);
    }
  }

  const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors, 0);
  if (totalErrors > 0) {
    console.log(`\nCompleted with ${totalErrors} error(s)`);
    process.exit(1);
  } else {
    console.log('\nSync completed successfully!');
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
