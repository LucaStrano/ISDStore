# ISDStore

Hardware Store project for the course "Ingegneria dei Sistemi Distribuiti" @ UNICT.

# Install

## Frontend

1) Clone the repository
 
```bash
git clone https://github.com/LucaStrano/ISDStore
```

2) Install frontend dependencies

```bash
cd frontend && npm install
```

3) Rename `.env.example` to `.env` and update the environment variables (if needed)

```bash
mv .env.example .env
```

4) To run the frontend, run:

```bash
npm run dev
```

you can now access the application at `http://localhost:3000`.

## Backend

1) Ensure PostgreSQL and Redis are running. You can use Docker Compose for this:

```bash
docker-compose up -d db redis pgadmin
```

2) Ensure you have Java 17+ and Maven installed. Use another terminal for the following commands.

3) Install backend dependencies

```bash
cd backend && mvn install
```

3) Build and run the backend
   
```bash
mvn spring-boot:run
```

4) The backend will be accessible at `http://localhost:8080`.