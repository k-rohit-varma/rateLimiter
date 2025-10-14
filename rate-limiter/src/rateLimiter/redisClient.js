import Redis from "ioredis";

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || 6379;

const client = new Redis({
  host: redisHost,
  port: redisPort,
});

client.on("connect", () => {
  console.log(`Connected to Redis at ${redisHost}:${redisPort}`);
});

client.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default client;
