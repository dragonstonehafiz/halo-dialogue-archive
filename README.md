# Halo Dialogue Archive Frontend

This is the source code for the frontend of the Halo Dialogue Archive, a fan-made site allowing for easy access to datamined audio files from the various Halo games. File metadata is served by a Cloudflare Worker backed by D1, and audio files are stored in Cloudflare R2.

## Frontend

The site is built with React + TypeScript using Vite. There are two main pages:

**Home** — Displays a list of available games as selectable cards. Clicking a card navigates to the browse page for that game.

**Browse** — A file browser for navigating the audio archive for each game.

**Search** — Search for specific voice lines by transcript or filename, with optional filters for game, character, and tags.

## Metadata (Cloudflare Worker + D1)

File metadata is stored in a Cloudflare D1 (SQLite) database and served through a public, read-only Worker API. The frontend never queries D1 directly and never holds any Cloudflare credentials.

| Endpoint | Query parameters | Success response |
| --- | --- | --- |
| `GET /browse` | `folder`: relative folder path such as `halo2/multiplayer` | Direct-child `AudioFile[]` |
| `GET /search` | Required `q`; optional comma-separated `games`, `characters`, `tags` | Matching `AudioFile[]`, capped at 200 |

Both endpoints return a bare JSON array on success, and an object such as `{ "error": "..." }` with a non-success status on failure. `/search` uses trigram full-text matching, so `q` must be at least 3 Unicode characters after trimming; selecting multiple values for the same filter (e.g. several tags) matches rows containing *any* of them, while different filter types (game/character/tag) are combined with AND.

Each `AudioFile` has the shape:

- `id` — numeric primary key
- `game` — the game the file belongs to (e.g. `halo2`)
- `character` — the character speaking the line (nullable)
- `tags` — an array of tags for filtering, or `null`
- `path` — the relative path to the audio file, used as a unique key
- `filename` — the filename without the path, used for search
- `transcript` — the transcribed text of the audio line (nullable)

Transcripts are generated using OpenAI Whisper (turbo model). The Worker/D1 backend, including the uploader that populates the database, lives in a separate repository.

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

Files are served via a public R2 URL. The frontend constructs the full URL by prepending the R2 base URL to the relative path returned by the metadata API.

## Configuration

Set these in `.env` (see `.env example`):

- `VITE_API_BASE_URL` — base URL of the Worker metadata API
- `VITE_R2_BASE_URL` — base URL for R2-served audio files

Restart the Vite dev server after changing environment variables; Vite embeds these values at build time, so a deployed frontend must also be rebuilt after changing them.

## Static catalog files

`public/structure.json` (the folder tree used by Browse) and `public/filters.json` (the game/character/tag options used by Search) are static assets, not Worker endpoints. They are generated separately as part of the catalog pipeline; copy the current versions into these `public/` paths whenever the catalog changes, and include them in the frontend release.

## Audio Extraction

Audio files were extracted from the original game files using the following tools:

- **Reclaimer** — [link](https://github.com/Gravemind2401/Reclaimer) — used to extract audio from `.map` files for Halo 2, Halo 3, Halo 3: ODST, and Halo: Reach.
- **Wwise Unpacker** — [link](https://github.com/Vextil/Wwise-Unpacker) — used to extract audio from `.pck` files for Halo 4, Halo 5, and Halo Infinite.

All extracted files were converted from WAV to OGG using ffmpeg to reduce file size before being uploaded to Cloudflare R2.