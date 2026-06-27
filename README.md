# Wedding Invitation Website

An elegant, minimal, romantic online wedding invitation built with Next.js
(Pages Router), TypeScript and TailwindCSS.

## Getting Started

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the invitation and
[http://localhost:3000/admin](http://localhost:3000/admin) for the admin area.

## Scripts

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `npm run dev`    | Start the development server      |
| `npm run build`  | Production build                  |
| `npm run start`  | Run the production build          |
| `npm run lint`   | Lint with ESLint                  |
| `npm run format` | Format the codebase with Prettier |

## Tech Stack

Next.js · TypeScript · TailwindCSS · Framer Motion · Swiper · Lucide React ·
Zustand · React Hook Form · Zod · Axios · clsx · dayjs · @react-google-maps/api

## Project Structure

```
data/                 JSON storage (wedding config, RSVP, wishes)
public/{images,uploads,audio,icons}
src/
├── pages/            Routes + API routes
├── components/       common · sections · ui (reusable)
├── layouts/          MainLayout · AdminLayout
├── hooks/  lib/  services/  stores/  types/  utils/  constants/
└── styles/
```

## Environment Variables

See `.env.example`. Image uploads are stored locally in `public/uploads`;
content data is stored as JSON in `data/`.
