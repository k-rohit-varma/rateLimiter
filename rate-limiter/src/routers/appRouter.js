import express from "express";
import { slidingWindowLog } from "../rateLimiter/sliding_window_log.js";
import { leakyBucket } from "../rateLimiter/leaky_bucket.js";
import { fixedwindowDup } from "../rateLimiter/fixed_window.js";

const router = express.Router();

/**
 * @swagger
 * /api/fixedWindow:
 *   get:
 *     summary: Test Fixed Window Counter Rate Limiter
 *     description: Sends a test request through the Fixed Window Counter algorithm. The window resets abruptly after the specified time limit.
 *     parameters:
 *       - in: query
 *         name: redisKey
 *         schema:
 *           type: string
 *           default: Fixed_Window_Counter_Algo
 *         description: Unique identifier (e.g., User ID, IP address) for the rate limiter.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The time window **in Minutes**. The counter is reset after this duration.
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Maximum number of requests allowed within the time window.
 *     responses:
 *       200:
 *         description: Request accepted and processed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Fixed window counter allowed this request"
 */
router.get("/fixedWindow", fixedwindowDup, (req, res) => {
  return res.status(200).send({
    message: "Fixed window counter allowed this request",
  });
});

/**
 * @swagger
 * /api/slidingWindowLog:
 *   get:
 *     summary: Test Sliding Window Log Rate Limiter
 *     description: Sends a test request. This algorithm maintains a timestamp log of requests and checks if the count of requests within the window size exceeds the capacity.
 *     parameters:
 *       - in: query
 *         name: redisKey
 *         schema:
 *           type: string
 *           default: Sliding_Window_Log_Algo
 *         description: Unique identifier (e.g., User ID, IP address) for the rate limiter.
 *       - in: query
 *         name: windowSizeInMinutes
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The size of the sliding time window **in Minutes**.
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Maximum allowed requests per window.
 *     responses:
 *       200:
 *         description: Request accepted and processed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Sliding window log accepted this request"
 *      
 */
router.get("/slidingWindowLog", slidingWindowLog, (req, res) => {
  return res.status(200).send({
    message: "Sliding window log accepted this request",
  });
});

/**
 * @swagger
 * /api/leakyBucket:
 *   get:
 *     summary: Test Leaky Bucket Algorithm
 *     description: Simulates sending a number of requests through the Leaky Bucket rate limiter. Requests are added to the bucket and processed at a constant leak rate.
 *     parameters:
 *       - in: query
 *         name: redisKey
 *         schema:
 *           type: string
 *           default: Leaky_Bucket_Algo
 *         description: Unique identifier for the bucket.
 *       - in: query
 *         name: bCap
 *         schema:
 *           type: integer
 *           default: 5
 *         description: The maximum number of requests the bucket can hold.
 *       - in: query
 *         name: leakRateInSeconds
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Time **in seconds** it takes for one request to 'leak' out of the bucket. Defines the maximum output rate.
 *       - in: query
 *         name: noOfReq
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Number of requests to simulate being sent to the bucket.
 *     responses:
 *       200:
 *         description: All simulated requests were successfully added to the bucket (and subsequently processed).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Leaky bucket algorithm accepted all requests"
 */
router.get("/leakyBucket", leakyBucket, (req, res) => {
  return res.status(200).send({
    message: "Leaky bucket algorithm accepted all requests",
  });
});

export default router;
