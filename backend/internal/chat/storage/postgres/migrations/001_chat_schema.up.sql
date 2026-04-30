create table if not exists chat_spaces (
  id text primary key,
  title text not null,
  created_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists chat_channels (
  id text primary key,
  space_id text not null references chat_spaces(id) on delete cascade,
  title text not null,
  kind text not null,
  created_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists chat_channel_members (
  channel_id text not null references chat_channels(id) on delete cascade,
  participant_id text not null,
  display_name text not null,
  role text not null,
  joined_at timestamptz not null,
  primary key (channel_id, participant_id)
);

create table if not exists chat_messages (
  id text primary key,
  channel_id text not null references chat_channels(id) on delete cascade,
  author_id text not null,
  author_name text not null,
  author_role text not null,
  body_markdown text not null,
  body_plain text not null,
  mentions jsonb not null default '[]'::jsonb,
  reply_to_id text,
  created_at timestamptz not null,
  edited_at timestamptz,
  deleted_at timestamptz
);

create index if not exists idx_chat_messages_channel_created_id on chat_messages(channel_id, created_at, id);
create index if not exists idx_chat_messages_channel_id on chat_messages(channel_id, id);
create index if not exists idx_chat_messages_reply_to on chat_messages(reply_to_id);

create table if not exists chat_message_reactions (
  message_id text not null references chat_messages(id) on delete cascade,
  emoji text not null,
  participant_id text not null,
  created_at timestamptz not null,
  primary key (message_id, emoji, participant_id)
);

create table if not exists chat_read_cursors (
  channel_id text not null references chat_channels(id) on delete cascade,
  participant_id text not null,
  last_read_message_id text not null,
  updated_at timestamptz not null,
  primary key (channel_id, participant_id)
);

create table if not exists chat_attachments (
  id text primary key,
  message_id text references chat_messages(id) on delete set null,
  owner_id text not null,
  file_name text not null,
  content_type text not null,
  size_bytes bigint not null,
  kind text not null,
  object_key text not null,
  original_url text not null,
  preview_url text,
  poster_url text,
  width integer,
  height integer,
  duration_ms bigint,
  status text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists idx_chat_attachments_message_id on chat_attachments(message_id);
create index if not exists idx_chat_attachments_status on chat_attachments(status);

create table if not exists chat_link_previews (
  id text primary key,
  message_id text not null references chat_messages(id) on delete cascade,
  url text not null,
  title text,
  description text,
  image_url text,
  site_name text,
  status text not null,
  error text,
  updated_at timestamptz not null
);

create index if not exists idx_chat_link_previews_message_id on chat_link_previews(message_id);
create index if not exists idx_chat_link_previews_status on chat_link_previews(status);

create table if not exists chat_idempotency_keys (
  scope text not null,
  key text not null,
  result_id text not null,
  created_at timestamptz not null,
  primary key (scope, key)
);
