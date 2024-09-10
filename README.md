# eth-deposit-tracker

**Ethereum Real-Time Tracking**. This project is a hiring task for Luganodes.

## Setup

### Cloning the Repository

```bash
git clone https://github.com/bearts/eth-deposit-tracker.git
```

You can run this project either using Docker or on bare metal.

### Running on Bare Metal

#### Express Server

1. Navigate to the project directory and install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables by filling in the `.env` file. Use the `.env.example` file as a reference. If you need a local MongoDB instance, you can use `docker-compose.mongo.yml`. To install Docker Compose, follow the instructions [here](https://docs.docker.com/compose/install/).

3. Build the project:

   ```bash
   npm run build
   ```

4. Start the server:

   ```bash
   npm start
   ```

   The server will run on `http://localhost:3000` or the port specified in the `.env` file.

#### Next.js Server

1. Navigate to the `client` folder and install dependencies:

   ```bash
   cd client
   npm install
   ```

2. Configure environment variables in the `.env` file, using `.env.example` as a reference.

3. Build and start the project:

   ```bash
   npm run build
   npm run start
   ```

### Running with Docker

1. In the project directory, build and start the containers:

   ```bash
   docker-compose up -d --build
   ```

2. The app will be accessible at `http://localhost/`, uses a reverse proxy to route requests to the backend and frontend.

   - Prometheus: `http://localhost:9090`
   - Grafana: `http://localhost:3000`

### Environment Variables

#### Backend

- `PORT`: Port on which the server will run (default is 3000).
- `MONGO_URI`: URI for the MongoDB database (default is `mongodb://user:password@localhost:27017/deposits`).
- `TELEGRAM_BOT_TOKEN`: Token for the Telegram bot, created using BotFather.
- `TELEGRAM_CHAT_ID`: Chat ID for the Telegram bot, obtainable by sending a message to the bot and calling the `getUpdates` method.
- `FROM_ADDRESS`: Addresses to track deposits from, separated by commas (e.g., `0x00000000219ab540356cBB839Cbe05303d7705Fa,0x00000000219ab540356cBB839Cbe05303d7705Da`).

#### Frontend

- `NEXT_PUBLIC_BACKEND_API_URL`: Backend URL for the app (defaults to `/api`).

## API Endpoints

1. **`GET /deposits`**: Retrieve all deposits (paginated).

   - **Parameters**:
     - `page`: Page number.
     - `limit`: Number of deposits per page.

2. **`GET /metrics`**: Retrieve metrics for deposits (used for Prometheus).

## Architecture

The project is divided into two main parts: the backend and the frontend.

### Backend

The backend is built with Express.js and is responsible for:

- Fetching real-time deposits using the ethers.js library.
- Storing deposits in MongoDB.
- Serving deposits and metrics to the frontend and Prometheus.

The logs are saved in the `logs` folder.

**Folder Structure**:

- `src` - Contains the source code for the backend.
  - `models` - Database models.
  - `apps` - Contains services for the backend (e.g., Ethereum tracker and API service).
  - `interfaces` - TypeScript interfaces.
  - `providers` - Service providers using dependency injection (e.g., logger, database, Telegram, ethers).
  - `repositories` - Database repositories (CRUD operations).
  - `schemas` - Data model schemas used for validation with Zod.

### Frontend

The frontend is built with Next.js and is responsible for:

- Displaying real-time deposits.
- Showing metrics using Grafana.
- Presenting deposits in a paginated and table format, using v0.dev.

## Future Improvements

1. Add test cases for the backend.
2. Convert to microservices architecture, having separate services for the Ethereum tracker and API, with a message broker in between.
