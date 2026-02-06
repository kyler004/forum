-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  bio text,
  updated_at timestamp with time zone,
  constraint username_length check (char_length(username) >= 3)
);

-- POSTS TABLE
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) not null,
  title text not null,
  content text not null,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COMMENTS TABLE
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) not null,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- VOTES TABLE
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  vote_type int not null check (vote_type in (1, -1)), -- 1 for upvote, -1 for downvote
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint vote_target_check check (
    (post_id is not null and comment_id is null) or
    (post_id is null and comment_id is not null)
  ),
  unique(user_id, post_id, comment_id)
);

-- RLS POLICIES (Basic Setup)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.votes enable row level security;

-- Public read access
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Public posts are viewable by everyone" on public.posts for select using (true);
create policy "Public comments are viewable by everyone" on public.comments for select using (true);
create policy "Public votes are viewable by everyone" on public.votes for select using (true);

-- Authenticated create/update/delete (Simplified for initial setup)
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Authenticated users can create posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "Users can update own posts" on public.posts for update using (auth.uid() = author_id);

create policy "Authenticated users can create comments" on public.comments for insert with check (auth.uid() = author_id);
create policy "Users can update own comments" on public.comments for update using (auth.uid() = author_id);

create policy "Authenticated users can vote" on public.votes for insert with check (auth.uid() = user_id);
create policy "Users can update own votes" on public.votes for update using (auth.uid() = user_id);
create policy "Users can delete own votes" on public.votes for delete using (auth.uid() = user_id);

-- TRIGGER FOR NEW USERS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
