import { WebClient } from '@slack/web-api';
import { loadChannelsConfig } from '../config';
import { SyncResult } from '../types';

export async function syncChannels(client: WebClient): Promise<SyncResult> {
  const result: SyncResult = {
    created: [],
    updated: [],
    archived: [],
    errors: [],
  };

  const config = loadChannelsConfig();

  // Get existing channels
  const existingChannels = new Map<string, string>();
  let cursor: string | undefined;

  do {
    const response = await client.conversations.list({
      types: 'public_channel,private_channel',
      exclude_archived: true,
      cursor,
    });

    for (const channel of response.channels || []) {
      if (channel.name && channel.id) {
        existingChannels.set(channel.name, channel.id);
      }
    }

    cursor = response.response_metadata?.next_cursor;
  } while (cursor);

  // Create or update channels
  for (const channelConfig of config.channels) {
    try {
      const existingId = existingChannels.get(channelConfig.name);

      if (existingId) {
        // Update existing channel
        if (channelConfig.topic) {
          await client.conversations.setTopic({
            channel: existingId,
            topic: channelConfig.topic,
          });
        }

        if (channelConfig.purpose) {
          await client.conversations.setPurpose({
            channel: existingId,
            purpose: channelConfig.purpose,
          });
        }

        result.updated.push(channelConfig.name);
        console.log(`Updated channel: #${channelConfig.name}`);
      } else {
        // Create new channel
        const createResponse = await client.conversations.create({
          name: channelConfig.name,
          is_private: channelConfig.is_private || false,
        });

        const newChannelId = createResponse.channel?.id;

        if (newChannelId) {
          if (channelConfig.topic) {
            await client.conversations.setTopic({
              channel: newChannelId,
              topic: channelConfig.topic,
            });
          }

          if (channelConfig.purpose) {
            await client.conversations.setPurpose({
              channel: newChannelId,
              purpose: channelConfig.purpose,
            });
          }
        }

        result.created.push(channelConfig.name);
        console.log(`Created channel: #${channelConfig.name}`);
      }
    } catch (error) {
      const errorMsg = `Failed to sync channel ${channelConfig.name}: ${error}`;
      result.errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  // Archive channels
  if (config.archive) {
    for (const channelName of config.archive) {
      try {
        const channelId = existingChannels.get(channelName);

        if (channelId) {
          await client.conversations.archive({ channel: channelId });
          result.archived.push(channelName);
          console.log(`Archived channel: #${channelName}`);
        }
      } catch (error) {
        const errorMsg = `Failed to archive channel ${channelName}: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }
  }

  return result;
}
