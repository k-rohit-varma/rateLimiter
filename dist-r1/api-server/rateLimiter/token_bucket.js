import getRandomColor from "../color.js";
import client from "./client.js";
import os from 'os'

export const tokenBucket = async (req, res) => {
  try {

    const { bcap , rr } = req.query;

    const BUCKET_CAPACITY = parseInt(bcap) || 10;
    const REFILL_RATE = parseInt(rr) || 5;     
    const TOKEN_KEY = `Token_Bucket_Tokens:${req.ip || 'global'}`;
    const TIMESTAMP_KEY = `Token_Bucket_Timestamp:${req.ip || 'global'}`;

    const now = Date.now();

    // fetch from redis
    let tokensRaw = await client.get(TOKEN_KEY);
    let lastRefillRaw = await client.get(TIMESTAMP_KEY);

    // parse values, set defaults
    let tokens = tokensRaw !== null ? parseFloat(tokensRaw) : BUCKET_CAPACITY;
    if (Number.isNaN(tokens)) tokens = BUCKET_CAPACITY;

    let lastRefill = lastRefillRaw !== null ? parseInt(lastRefillRaw, 10) : now;
    if (Number.isNaN(lastRefill)) lastRefill = now;

    // compute whole minutes elapsed
    const millisPerMinute = 60 * 1000;
    const minutesElapsed = Math.floor((now - lastRefill) / millisPerMinute);

    if (minutesElapsed > 0) {
      const refillTokens = minutesElapsed * REFILL_RATE;
      tokens = Math.min(BUCKET_CAPACITY, tokens + refillTokens);

      // advance lastRefill by exactly the whole minutes we've consumed
      lastRefill = lastRefill + (minutesElapsed * millisPerMinute);
    }

    // attempt to consume 1 token
    if (tokens >= 1) {
      tokens -= 1;

      // persist
      await client.set(TOKEN_KEY, tokens.toString());
      await client.set(TIMESTAMP_KEY, lastRefill.toString());

        let color = getRandomColor();
        let servername = os.hostname()
        let msg = `<h1 style="color:${color};">Responding Server: ${servername} using sliding window log algorithm </h1>`;
        

      return res.status(200).send({
        "success": true,
        "message": msg,
        "remainingTokens": tokens.toFixed(2),
      });
    } else {
      // persist (so lastRefill carries forward)
      await client.set(TOKEN_KEY, tokens.toString());
      await client.set(TIMESTAMP_KEY, lastRefill.toString());

      return res.status(429).json({
        success: false,
        message: "🚫 Rate limit exceeded — wait for next minute(s)",
        remainingTokens: tokens.toFixed(2),
      });
    }
  } catch (err) {
    console.error("tokenBucket error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
