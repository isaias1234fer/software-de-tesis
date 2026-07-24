$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/thesis_db?schema=public"
npx prisma db push