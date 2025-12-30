import { WebClient } from '@slack/web-api';
import { loadUserGroupsConfig } from '../config';
import { SyncResult } from '../types';

export async function syncUserGroups(client: WebClient): Promise<SyncResult> {
  const result: SyncResult = {
    created: [],
    updated: [],
    archived: [],
    errors: [],
  };

  const config = loadUserGroupsConfig();

  // Get existing user groups
  const existingGroups = new Map<string, string>();
  const groupsResponse = await client.usergroups.list({ include_disabled: true });

  for (const group of groupsResponse.usergroups || []) {
    if (group.handle && group.id) {
      existingGroups.set(group.handle, group.id);
    }
  }

  // Resolve email addresses to user IDs
  async function resolveMembers(members: string[]): Promise<string[]> {
    const userIds: string[] = [];

    for (const member of members) {
      if (member.startsWith('U')) {
        // Already a user ID
        userIds.push(member);
      } else if (member.includes('@')) {
        // Email address - look up user
        try {
          const userResponse = await client.users.lookupByEmail({ email: member });
          if (userResponse.user?.id) {
            userIds.push(userResponse.user.id);
          }
        } catch (error) {
          console.warn(`Could not find user with email: ${member}`);
        }
      }
    }

    return userIds;
  }

  // Create or update user groups
  for (const groupConfig of config.usergroups) {
    try {
      const existingId = existingGroups.get(groupConfig.handle);
      const memberIds = groupConfig.members
        ? await resolveMembers(groupConfig.members)
        : [];

      if (existingId) {
        // Update existing user group
        await client.usergroups.update({
          usergroup: existingId,
          name: groupConfig.name,
          description: groupConfig.description,
        });

        // Update members if specified
        if (memberIds.length > 0) {
          await client.usergroups.users.update({
            usergroup: existingId,
            users: memberIds.join(','),
          });
        }

        // Re-enable if it was disabled
        await client.usergroups.enable({ usergroup: existingId });

        result.updated.push(groupConfig.handle);
        console.log(`Updated user group: @${groupConfig.handle}`);
      } else {
        // Create new user group
        const createResponse = await client.usergroups.create({
          name: groupConfig.name,
          handle: groupConfig.handle,
          description: groupConfig.description,
        });

        const newGroupId = createResponse.usergroup?.id;

        // Add members if specified
        if (newGroupId && memberIds.length > 0) {
          await client.usergroups.users.update({
            usergroup: newGroupId,
            users: memberIds.join(','),
          });
        }

        result.created.push(groupConfig.handle);
        console.log(`Created user group: @${groupConfig.handle}`);
      }
    } catch (error) {
      const errorMsg = `Failed to sync user group ${groupConfig.handle}: ${error}`;
      result.errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  // Disable user groups
  if (config.disable) {
    for (const handle of config.disable) {
      try {
        const groupId = existingGroups.get(handle);

        if (groupId) {
          await client.usergroups.disable({ usergroup: groupId });
          result.archived.push(handle);
          console.log(`Disabled user group: @${handle}`);
        }
      } catch (error) {
        const errorMsg = `Failed to disable user group ${handle}: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }
  }

  return result;
}
