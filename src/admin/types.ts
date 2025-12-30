export interface ChannelConfig {
  name: string;
  topic?: string;
  purpose?: string;
  is_private?: boolean;
}

export interface ChannelsFile {
  channels: ChannelConfig[];
  archive?: string[];
}

export interface UserGroupConfig {
  handle: string;
  name: string;
  description?: string;
  members?: string[];
}

export interface UserGroupsFile {
  usergroups: UserGroupConfig[];
  disable?: string[];
}

export interface BookmarkConfig {
  title: string;
  link: string;
  emoji?: string;
}

export interface BookmarksFile {
  bookmarks: Record<string, BookmarkConfig[]>;
}

export interface SyncResult {
  created: string[];
  updated: string[];
  archived: string[];
  errors: string[];
}
