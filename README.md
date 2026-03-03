# COSVIR - Comite Strategique Virtuel

Application SaaS decisionnelle multi-agents IA (finance, marketing, risques, juridique, croissance) avec scoring strategique, synthese executive et export PDF.

## Stack
- Frontend: React + TypeScript (Vite)
- Backend: Node.js + TypeScript + Express (Clean-ish architecture)
- API: REST
- DB: PostgreSQL
- Auth: JWT access token + refresh token rotation
- Infra: Docker Compose

## Lancement local
1. Copier `backend/.env.example` en `backend/.env` et `frontend/.env.example` en `frontend/.env`.
2. Démarrer les services:

```bash
docker compose up --build
```

3. Appliquer migration:

```bash
docker compose exec backend npm run db:migrate
```

4. Accéder à l'UI: `http://localhost:8080`

## Endpoints auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

## Endpoints décisions
- `POST /decisions`
- `GET /decisions`
- `GET /decisions/:id`
- `PUT /decisions/:id`
- `POST /decisions/:id/analyze`
- `GET /decisions/:id/debate`
- `GET /decisions/:id/executive-summary`
- `POST /decisions/:id/export/pdf`

## Sécurité V1
- Argon2id pour password hashing
- Refresh token rotation + révocation
- Rate limiting global + auth
- Headers sécurisés (helmet), CORS configurable
- JWT short-lived access token

## Tests

```bash
cd backend
npm test
```

## CI
Pipeline GitHub Actions dans `.github/workflows/ci.yml`:
- backend: install, build, test
- frontend: install, build
