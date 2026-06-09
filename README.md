# Halo Dialogue Archive Frontend

This is the source code for the frontend of the Halo Dialogue Archive, a fan-made site allowing for easy access to datamined audio files from the various Halo games. The site has no dedicated backend — it uses Supabase for file metadata and Cloudflare R2 for audio file storage.

## Frontend

The site is built with React + TypeScript using Vite. There are two main pages:

**Home** — Displays a list of available games as selectable cards. Clicking a card navigates to the browse page for that game.

**Browse** — A file browser for navigating the audio archive for each game.

## Metadata (Supabase)

File metadata is stored in a Supabase Postgres database. The `audio_files` table has the following columns:

- `id` — auto-incrementing primary key
- `game` — the game the file belongs to (e.g. `halo2`)
- `character` — the character speaking the line (nullable)
- `tags` — an array of tags for filtering (e.g. `{marine, sangheili}`)
- `path` — the relative path to the audio file, used as a unique key
- `transcript` — the transcribed text of the audio line (nullable)

Transcripts are generated using OpenAI Whisper (turbo model).

## Audio Storage (Cloudflare R2)

Audio files are stored in a Cloudflare R2 bucket (`halo-dialogue`). Files are organized by game and then by the original folder structure produced by the extraction tools, with one exception — Halo 3 has all its mission-specific dialogue consolidated into `halo3/levels/` rather than being spread across multiple directories.

```
halo2/
  combat/
    character_name/
      category/
        filename.ogg
  levels/
    level_name/
      cinematic|mission/
        filename.ogg
  multiplayer/
    filename.ogg
```

Files are served via a public R2 URL. The frontend constructs the full URL by prepending the R2 base URL to the relative path stored in Supabase.

## Audio Extraction

Audio files were extracted from the original game files using the following tools:

- **Reclaimer** — [download link](https://github.com/Gravemind2401/Reclaimer) — used to extract audio from `.map` files for Halo 2, Halo 3, Halo 3: ODST, and Halo: Reach.
- **Wwise Unpacker** — [download link](https://github.com/Vextil/Wwise-Unpacker) — used to extract audio from `.pck` files for Halo 4, Halo 5, and Halo Infinite.

All extracted files were converted from WAV to OGG using ffmpeg to reduce file size before being uploaded to Cloudflare R2.