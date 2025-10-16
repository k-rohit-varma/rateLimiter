import Redis from "ioredis";

const client = new Redis({
  host: "redis_distributed_server",
  port: 6379,
});

export default client;