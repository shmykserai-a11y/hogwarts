---
name: supabase-js
description: Best practices for using the Supabase JavaScript client in Next.js (App Router). Use when querying data, inserting rows, managing auth state, handling RLS, or responding to realtime database events.
---

# Supabase JS and Next.js Best Practices

Supabase provides a Postgres database with realtime subscriptions, auth, and storage. The JS Client is the primary interface for fetching/saving data.

### 1. Initialization in Next.js

When using Next.js App Router, ensure you create the supabase instance properly relying on environment variables. For basic client-side operations, use `createClient`.

*(Note for advanced SSR: Use `@supabase/ssr` instead if handling authentication cookies server-side, but standard `createClient` is sufficient for simple DB queries off public data).*

### 2. Querying Data (Select)

Always use strongly typed interfaces if TypeScript definitions are generated.

**Basic Fetching:**
```ts
const { data, error } = await supabase
  .from('users')
  .select('id, name')
  .eq('status', 'active')
```

**Single Row:**
Chain `.single()` when you expect exactly one result (returns an object instead of an array).

### 3. Inserting Data

When adding Easter eggs discovered:
```ts
const { data, error } = await supabase
  .from('found_secrets')
  .insert([
    { secret_id: 'lumos', user_id: '123' }
  ])
  .select()
```

### 4. Realtime Subscriptions

Supabase excels at realtime multiplayer features (useful for seeing others traveling Hogwards). Use Channels:

```ts
const channel = supabase
  .channel('public:users')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'users' },
    (payload) => console.log(payload)
  )
  .subscribe()

// Cleanup
channel.unsubscribe()
```

### 5. Error Handling

Supabase queries never throw. You MUST check the `error` object manually.
```ts
if (error) {
  console.error("Failed to fetch data", error.message);
  return;
}
```
