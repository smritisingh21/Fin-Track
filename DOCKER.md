# 🐳 FinTrack Docker Guide & Architecture Reference

This document provides a comprehensive guide for running **FinTrack** using Docker and Docker Compose on macOS, along with an in-depth, line-by-line breakdown of the multi-container configuration, Dockerfiles, and operational commands.

---

## 📑 Table of Contents
1. [Prerequisites & Installing Docker on macOS](#1-prerequisites--installing-docker-on-macos)
2. [Multi-Container Architecture](#2-multi-container-architecture)
3. [Quick Start: Running FinTrack with Docker](#3-quick-start-running-fintrack-with-docker)
4. [Line-by-Line Breakdown of `docker-compose.yml`](#4-line-by-line-breakdown-of-docker-composeyml)
5. [Dockerfiles Explained](#5-dockerfiles-explained)
   - [Backend Dockerfile (`backend/Dockerfile`)](#backend-dockerfile-backenddockerfile)
   - [Frontend Multi-Stage Dockerfile (`frontend/.../Dockerfile`)](#frontend-multi-stage-dockerfile)
   - [Nginx Reverse Proxy Configuration (`nginx.conf`)](#nginx-reverse-proxy-configuration-nginxconf)
   - [Dockerignore Files (`.dockerignore`)](#dockerignore-files-dockerignore)
6. [Docker Command Reference & Explanations](#6-docker-command-reference--explanations)
7. [Switching Between Local MongoDB and MongoDB Atlas](#7-switching-between-local-mongodb-and-mongodb-atlas)
8. [Troubleshooting & FAQs](#8-troubleshooting--faqs)

---

## 1. Prerequisites & Installing Docker on macOS

On macOS, Docker runs containers inside a lightweight Linux hypervisor. You can install Docker using one of the following methods:

### Option A: Using Homebrew (Recommended)
If you have Homebrew installed, run:
```bash
brew install --cask docker
```
Once installed:
1. Open Spotlight (`Cmd + Space`), type **Docker**, and press `Enter` to launch Docker Desktop.
2. Accept the service agreement and privileged helper prompt.
3. Wait until the Docker status icon in your macOS menu bar displays **Docker Desktop is running**.

### Option B: Direct Download from Docker Desktop
1. Visit the official Docker download page: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Download the installer matching your Mac hardware:
   - **Apple Silicon (M1/M2/M3/M4 chip)**: `Mac with Apple chip`
   - **Intel-based Mac**: `Mac with Intel chip`
3. Open the `.dmg` file, drag `Docker.app` into your `Applications` folder, and launch it.

### Option C: Lightweight CLI Alternative (Colima)
If you prefer an open-source, background CLI runner without the full Docker Desktop GUI:
```bash
brew install colima docker docker-compose
colima start --cpu 2 --memory 4
```

### Verify Your Installation
In your terminal, confirm that both the Docker engine and Docker Compose plugin are operational:
```bash
docker --version
docker compose version
```
Expected output:
```text
Docker version 27.x.x, build ...
Docker Compose version v2.x.x
```

---

## 2. Multi-Container Architecture

FinTrack is composed of three interconnected services:

```mermaid
flowchart TD
    Client["User Browser\n(http://localhost:5173 or :80)"]
    
    subgraph DockerBridge ["Docker Virtual Network (fintrack-net)"]
        Frontend["fintrack-frontend (Nginx Alpine)\n- Serves React SPA (dist/)\n- Proxies /api/ -> backend:8000\n- Port 80 & 5173 exposed"]
        Backend["fintrack-backend (Node.js 20 Alpine)\n- Express REST API\n- Auth, Transactions, Insights\n- Port 8000 exposed"]
        MongoDB["fintrack-mongodb (Mongo 7.0)\n- Primary NoSQL Database\n- Port 27017 exposed"]
    end

    NamedVolUploads[("Volume: backend-uploads\n(/app/uploads)")]
    NamedVolMongo[("Volume: mongo-data\n(/data/db)")]
    
    Client -->|HTTP: 80 / 5173| Frontend
    Client -.->|Direct API (optional): 8000| Backend
    Frontend -->|Reverse Proxy: /api/*| Backend
    Backend -->|Mongoose DB Driver: 27017| MongoDB
    Backend --- NamedVolUploads
    MongoDB --- NamedVolMongo
```

- **Frontend Container (`fintrack-frontend`)**: A hardened Nginx container that delivers the production-built React Single Page Application (SPA) with gzip compression and client-side routing fallback (`index.html`), while automatically proxying API calls to the backend.
- **Backend Container (`fintrack-backend`)**: Node.js 20 LTS Alpine running Express. Handles authentication, period filtering, financial calculations, and attachments.
- **Database Container (`fintrack-mongodb`)**: Official MongoDB 7.0 Community Edition with automated health check ping and persistent disk volume.

---

## 3. Quick Start: Running FinTrack with Docker

### Step 1: Prepare Environment Variables
Create your local Docker `.env` file from the provided template:
```bash
cp .env.docker.example .env
```
*(Optional: edit `.env` if you wish to set your own `JWT_SECRET`, or attach a `GEMINI_API_KEY` for AI features).*

### Step 2: Build and Start Containers
```bash
docker compose up --build -d
```

### Step 3: Access the Application
- **Frontend Web App**: [http://localhost](http://localhost) or [http://localhost:5173](http://localhost:5173)
- **Backend API Health/Status**: [http://localhost:8000](http://localhost:8000)
- **Local MongoDB**: `mongodb://localhost:27017/expense-tracker`

---

## 4. Line-by-Line Breakdown of `docker-compose.yml`

Below is an exhaustive explanation of every directive in the [`docker-compose.yml`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/docker-compose.yml) file:

```yaml
services:
```
> Defines the collection of containers that Docker Compose will manage as a cohesive application stack.

---

### MongoDB Service
```yaml
  mongodb:
    image: mongo:7.0
```
- `mongodb:`: The internal service name. Other containers on the same Docker network can resolve this hostname directly (e.g. `mongodb:27017`).
- `image: mongo:7.0`: Specifies the official MongoDB 7.0 image from Docker Hub. Avoids building from scratch and guarantees a standard, reproducible database engine.

```yaml
    container_name: fintrack-mongodb
    restart: unless-stopped
```
- `container_name: fintrack-mongodb`: Assigns a readable, predictable name to the running container in `docker ps`.
- `restart: unless-stopped`: Ensures the container restarts automatically if it crashes or if the host machine restarts, unless explicitly stopped by `docker compose down`.

```yaml
    ports:
      - "27017:27017"
```
- Maps port `27017` on your host Mac to port `27017` inside the container. This allows external GUI tools (such as MongoDB Compass) to connect to the database locally.

```yaml
    environment:
      - MONGO_INITDB_DATABASE=expense-tracker
```
- Sets the default database name created upon initial container startup.

```yaml
    volumes:
      - mongo-data:/data/db
```
- Mounts the named volume `mongo-data` into MongoDB's default storage path `/data/db`. Ensures your database records persist even if the container is destroyed or rebuilt.

```yaml
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 5s
```
- Defines a container health probe:
  - `test`: Executes `mongosh` ping inside the container to ensure the database is actively accepting connections.
  - `interval: 10s`: Probes every 10 seconds.
  - `timeout: 5s`: Waits up to 5 seconds for a response.
  - `retries: 5`: Marks unhealthy only after 5 consecutive failed pings.
  - `start_period: 5s`: Gives the database 5 seconds to initialize before failing checks.

```yaml
    networks:
      - fintrack-net
```
- Attaches the database container to the custom bridge network `fintrack-net`.

---

### Backend Service
```yaml
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
```
- Tells Docker Compose to build an image using the source code located in `./backend` and instructions in `./backend/Dockerfile`.

```yaml
    container_name: fintrack-backend
    restart: unless-stopped
    ports:
      - "8000:8000"
```
- Exposes port `8000` to the host so backend routes are reachable directly at `http://localhost:8000`.

```yaml
    environment:
      - PORT=8000
      - MONGO_URI=${MONGO_URI:-mongodb://mongodb:27017/expense-tracker}
      - JWT_SECRET=${JWT_SECRET:-default_jwt_secret_fintrack_2026}
      - CLIENT_ID=${CLIENT_ID:-}
      - GEMINI_API_KEY=${GEMINI_API_KEY:-}
      - NODE_ENV=production
```
- Injects environment variables into the backend container:
  - `${VAR:-default}` syntax reads the variable from your `.env` file; if unset, it falls back to the default value.
  - Points `MONGO_URI` to the container hostname `mongodb` on port `27017`.
  - Sets `NODE_ENV=production` for optimized Express routing and logging.

```yaml
    volumes:
      - backend-uploads:/app/uploads
```
- Preserves uploaded receipts, avatars, or attachments in the named volume `backend-uploads`, preventing data loss across container rebuilds.

```yaml
    depends_on:
      mongodb:
        condition: service_healthy
```
- **Crucial synchronization**: Instructs Docker Compose to delay starting the backend until `mongodb` has passed its healthcheck and is fully ready to handle connections.

```yaml
    networks:
      - fintrack-net
```
- Joins the common network so it can communicate with `mongodb` and `frontend`.

---

### Frontend Service
```yaml
  frontend:
    build:
      context: ./frontend/expense-tracker-frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_BASE_URL=${VITE_API_BASE_URL:-}
```
- Builds the frontend container from `./frontend/expense-tracker-frontend/Dockerfile`.
- Passes `VITE_API_BASE_URL` as a build argument so Vite can embed the desired API path into the static bundle during compilation.

```yaml
    container_name: fintrack-frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "5173:80"
```
- Maps both standard HTTP port `80` and Vite development port `5173` to port `80` of the Nginx container. You can open `http://localhost` or `http://localhost:5173`.

```yaml
    depends_on:
      - backend
```
- Ensures the backend container starts before Nginx launches.

```yaml
    networks:
      - fintrack-net
```
- Enables Nginx to resolve `http://backend:8000` for reverse proxying.

---

### Volumes and Networks
```yaml
volumes:
  mongo-data:
    driver: local
  backend-uploads:
    driver: local
```
- Declares persistent volumes managed by Docker on the host filesystem.

```yaml
networks:
  fintrack-net:
    driver: bridge
```
- Creates an isolated bridge network with built-in DNS service discovery. Containers locate each other using their service names (`backend`, `mongodb`, `frontend`).

---

## 5. Dockerfiles Explained

### Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
FROM node:20-alpine
```
> Uses official Node.js 20 LTS built on Alpine Linux (~50MB base size), minimizing attack surface and download time.

```dockerfile
WORKDIR /app
```
> Sets `/app` as the working directory inside the container for all following commands.

```dockerfile
COPY package*.json ./
RUN npm install --omit=dev
```
> **Layer Caching Optimization**: Copies only `package.json` and `package-lock.json` before the rest of the application code. Docker caches the `npm install` layer and will not re-run dependency installation unless dependencies change. `--omit=dev` excludes unnecessary testing and development tools.

```dockerfile
COPY . .
RUN mkdir -p uploads
```
> Copies the backend source code and ensures the `uploads/` directory exists for file attachments.

```dockerfile
EXPOSE 8000
ENV NODE_ENV=production
ENV PORT=8000
CMD ["node", "server.js"]
```
> Documents port `8000`, sets production defaults, and executes `node server.js` as PID 1 to boot the Express application.

---

### Frontend Multi-Stage Dockerfile

Multi-stage builds allow compiling the application with full Node.js tools in Stage 1, while discarding Node.js completely in Stage 2 to ship only compiled static HTML/CSS/JS in a tiny Nginx image (~25MB).

#### Stage 1: Build Environment
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build
```
1. `AS builder`: Names this intermediate stage.
2. `npm install`: Installs all Vite and React build dependencies.
3. `ARG / ENV VITE_API_BASE_URL`: Injects API endpoint variable into Vite's environment.
4. `npm run build`: Bundles the React application into optimized static assets in `/app/dist`.

#### Stage 2: Production Nginx Runtime
```dockerfile
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
1. Starts fresh from minimal `nginx:1.27-alpine`.
2. Copies custom SPA routing configuration to `/etc/nginx/conf.d/default.conf`.
3. `--from=builder /app/dist`: Extracts only the compiled `dist/` folder from Stage 1 into Nginx's web root `/usr/share/nginx/html`. Node.js, `node_modules`, and source files are completely omitted from the final image.
4. `CMD ["nginx", "-g", "daemon off;"]`: Runs Nginx in the foreground so the container remains active.

---

### Nginx Reverse Proxy Configuration (`nginx.conf`)

Key features implemented in [`nginx.conf`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/frontend/expense-tracker-frontend/nginx.conf):
1. **SPA Client Routing**:
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
   Directs browser requests for paths like `/expense`, `/income`, or `/dashboard` to `index.html`, allowing React Router to handle page rendering without 404 errors.
2. **Reverse Proxy to Backend**:
   ```nginx
   location /api/ {
       proxy_pass http://backend:8000/api/;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```
   Eliminates CORS (Cross-Origin Resource Sharing) issues by allowing the browser to make calls directly to `/api/...` on the same domain and port, which Nginx invisibly forwards to the backend container.
3. **Asset Caching & Gzip Compression**:
   Enables gzip for text, CSS, JS, and JSON, and sets 1-year immutable caching on hashed static assets.

---

### Dockerignore Files (`.dockerignore`)

Located at [`backend/.dockerignore`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/backend/.dockerignore) and [`frontend/.../.dockerignore`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/frontend/expense-tracker-frontend/.dockerignore).

They prevent the following from being sent to the Docker build daemon:
- `node_modules`: Prevents copying host architecture-specific native binaries (e.g., macOS ARM64 binaries) into the Linux container.
- `.env`: Prevents baking private secrets and credentials into Docker image layers.
- `.git`: Keeps Docker images small by excluding Git history.
- `uploads/*`: Avoids copying local attachments into the immutable image layer.

---

## 6. Docker Command Reference & Explanations

Here is a guide to every standard Docker Compose command used in this project:

| Command | What It Does & When to Use It |
|---|---|
| `docker compose up --build -d` | **Build & Run in Background**: Compiles the Dockerfiles, downloads required base images, builds layers, creates networks/volumes, and runs all 3 containers in detached mode (`-d`). |
| `docker compose up` | **Run in Foreground**: Starts all containers and streams real-time stdout/stderr logs from all containers directly to your terminal. Useful for live debugging. Press `Ctrl + C` to stop. |
| `docker compose down` | **Graceful Shutdown**: Stops and removes all running containers and networks created by `docker-compose.yml`, while preserving persistent volume data (`mongo-data` and `backend-uploads`). |
| `docker compose down -v` | **Full Teardown & Reset**: Stops containers and **destroys named volumes**. Use this only if you want to completely wipe the local database and start fresh. |
| `docker compose ps` | **Status Check**: Lists all running containers for this project, showing their state (`running`, `healthy`, `restarting`), uptimes, and port mappings. |
| `docker compose logs -f` | **Follow All Logs**: Streams unified logs from all services in real time. Press `Ctrl + C` to exit log streaming (containers keep running). |
| `docker compose logs -f backend` | **Service Logs**: Follows logs exclusively from the backend Express server. |
| `docker compose logs -f frontend` | **Nginx Logs**: Follows access logs and errors from the Nginx web server. |
| `docker compose logs -f mongodb` | **Database Logs**: Follows MongoDB startup and query logs. |
| `docker compose restart <service>` | **Restart Service**: Restarts a single service (e.g. `docker compose restart backend`) without restarting the rest of the stack. |
| `docker compose exec backend sh` | **Container Shell Access**: Opens an interactive POSIX shell inside the running backend container for inspection or troubleshooting. |
| `docker compose exec mongodb mongosh` | **MongoDB Shell**: Launches an interactive MongoDB client inside the database container to inspect collections and documents directly. |
| `docker system prune -f` | **Cleanup**: Removes stopped containers, dangling images, and unused build caches to free up disk space on your Mac. |

---

## 7. Switching Between Local MongoDB and MongoDB Atlas

By default, FinTrack connects to the local `mongodb` container defined in `docker-compose.yml`.

If you prefer to connect to **MongoDB Atlas Cloud**:
1. Open your `.env` file at the root of the project.
2. Update `MONGO_URI` to your Atlas connection string:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/expense-tracker?retryWrites=true&w=majority
   ```
3. Restart the backend service:
   ```bash
   docker compose up -d backend
   ```
4. *(Optional)* If you don't need the local MongoDB container running, you can stop it:
   ```bash
   docker compose stop mongodb
   ```

---

## 8. Troubleshooting & FAQs

### Q1: `command not found: docker`
**Solution**: Docker Desktop is either not installed or not added to your system `PATH`. Install it using Homebrew (`brew install --cask docker`) and launch **Docker.app** from your `Applications` folder.

### Q2: Port 80, 5173, or 8000 is already in use
**Solution**: Another process (e.g. a previous `npm run dev` or local server) is holding the port. Find and stop it:
```bash
lsof -i :8000
lsof -i :5173
kill -9 <PID>
```
Or edit the port mapping in `docker-compose.yml` (for example, change `"8000:8000"` to `"8001:8000"`).

### Q3: How do I inspect database records inside Docker?
Connect via `mongosh` inside the container:
```bash
docker compose exec mongodb mongosh expense-tracker
```
Then run queries:
```javascript
show collections
db.users.find().pretty()
db.incomes.find().limit(5)
db.expenses.find().limit(5)
```

### Q4: How do I apply code changes?
Because containers package compiled code:
- After modifying frontend or backend source files, rebuild the container images:
  ```bash
  docker compose up --build -d
  ```
