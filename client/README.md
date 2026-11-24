# Splitto client

Mobile-first PWA (React 19, Vite, Tailwind v4, Zustand). The design is described in [`../design.md`](../design.md).

## Run

```bash
npm install
npm run dev        # also copies OCR assets into public/ocr
npm test           # split maths + receipt parser (real OCR fixtures)
npm run build
```

## Environment

AI scanning is optional and configured only with server-side variables (Vercel → Settings → Environment Variables, or `.env.local` for `npm run dev`). See `.env.example`.

| Variable | Default | Meaning |
| --- | --- | --- |
| `LLM_API_KEY` | unset | Turns AI scanning on. Never prefix with `VITE_` (that would ship it to browsers). |
| `LLM_BASE_URL` | `https://inference-api.nousresearch.com/v1` | Any OpenAI-compatible endpoint |
| `LLM_MODEL` | `deepseek/deepseek-v4.1-flash-1073` | Must accept images |
| `SCAN_MODE` | `auto` | `ocr` never use AI · `auto` OCR first, AI when items don't add up · `llm` AI first |
| `SCAN_RATE_LIMIT` | `20` | AI scans per IP per hour |

## Layout

- `api/scan.ts`: Vercel function for AI scanning (key stays server-side)
- `src/features/scan`: on-device OCR (`ocr/`), receipt parser, AI fallback client
- `src/features/bill`: types and split maths
- `src/features/summary`: summary card, share, image and PDF export
- `src/store`: draft bill (survives reloads) and local history/friends
- `src/components`: UI kit and layout
- `src/pages`: screens
