import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ChannelsFile, UserGroupsFile, BookmarksFile } from './types';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

export function loadChannelsConfig(): ChannelsFile {
  const filePath = path.join(WORKSPACE_DIR, 'channels.yaml');
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content) as ChannelsFile;
}

export function loadUserGroupsConfig(): UserGroupsFile {
  const filePath = path.join(WORKSPACE_DIR, 'usergroups.yaml');
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content) as UserGroupsFile;
}

export function loadBookmarksConfig(): BookmarksFile {
  const filePath = path.join(WORKSPACE_DIR, 'bookmarks.yaml');
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content) as BookmarksFile;
}
