import { WebClient } from '@slack/web-api';
import { loadBookmarksConfig } from '../config';
import { SyncResult } from '../types';

export async function syncBookmarks(client: WebClient): Promise<SyncResult> {
  const result: SyncResult = {
    created: [],
    updated: [],
    archived: [],
    errors: [],
  };

  const config = loadBookmarksConfig();

  // Get channel name to ID mapping
  const channelIds = new Map<string, string>();
  let cursor: string | undefined;

  do {
    const response = await client.conversations.list({
      types: 'public_channel,private_channel',
      exclude_archived: true,
      cursor,
    });

    for (const channel of response.channels || []) {
      if (channel.name && channel.id) {
        channelIds.set(channel.name, channel.id);
      }
    }

    cursor = response.response_metadata?.next_cursor;
  } while (cursor);

  // Sync bookmarks for each channel
  for (const [channelName, bookmarks] of Object.entries(config.bookmarks)) {
    const channelId = channelIds.get(channelName);

    if (!channelId) {
      console.warn(`Channel not found: #${channelName}, skipping bookmarks`);
      continue;
    }

    try {
      // Get existing bookmarks
      const existingResponse = await client.bookmarks.list({ channel_id: channelId });
      const existingBookmarks = new Map<string, string>();

      for (const bookmark of existingResponse.bookmarks || []) {
        if (bookmark.title && bookmark.id) {
          existingBookmarks.set(bookmark.title, bookmark.id);
        }
      }

      // Create or update bookmarks
      for (const bookmarkConfig of bookmarks) {
        try {
          const existingId = existingBookmarks.get(bookmarkConfig.title);

          if (existingId) {
            // Update existing bookmark
            await client.bookmarks.edit({
              bookmark_id: existingId,
              channel_id: channelId,
              link: bookmarkConfig.link,
              emoji: bookmarkConfig.emoji,
            });

            result.updated.push(`${channelName}/${bookmarkConfig.title}`);
            console.log(`Updated bookmark: #${channelName} - ${bookmarkConfig.title}`);
          } else {
            // Create new bookmark
            await client.bookmarks.add({
              channel_id: channelId,
              title: bookmarkConfig.title,
              type: 'link',
              link: bookmarkConfig.link,
              emoji: bookmarkConfig.emoji,
            });

            result.created.push(`${channelName}/${bookmarkConfig.title}`);
            console.log(`Created bookmark: #${channelName} - ${bookmarkConfig.title}`);
          }
        } catch (error) {
          const errorMsg = `Failed to sync bookmark ${bookmarkConfig.title} in #${channelName}: ${error}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = `Failed to sync bookmarks for #${channelName}: ${error}`;
      result.errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  return result;
}
