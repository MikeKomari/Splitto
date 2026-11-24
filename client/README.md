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

| Variable | Default | Meaning |
| --- | --- | --- |
| `VITE_AI_SCAN` | unset | `true` offers the paid LLM scan as a fallback when free OCR can't reconcile a receipt |
| `VITE_BE_LINK` | unset | Server API base (e.g. `http://localhost:8000/api`), only needed for the AI fallback |

## Layout

- `src/features/scan`: on-device OCR (`ocr/`), receipt parser, AI fallback
- `src/features/bill`: types and split maths
- `src/features/summary`: summary card, share, image and PDF export
- `src/store`: draft bill (survives reloads) and local history/friends
- `src/components`: UI kit and layout
- `src/pages`: screens
