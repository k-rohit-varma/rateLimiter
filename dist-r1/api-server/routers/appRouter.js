import { fixedWindowCounter } from "../rateLimiter/fixed_window_counter.js";
import { slidingWindowLog } from "../rateLimiter/sliding_window_counter.js";
import { leakyBucket } from "../rateLimiter/leaky_bucket.js";
import express from "express"
import getRandomColor from "../color.js";
import os from 'os'
import { tokenBucket } from "../rateLimiter/token_bucket.js";

const router = express.Router();
var servername = os.hostname()
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
router.get("/fixedWindow", fixedWindowCounter ,( req , res ) => {
    let color = getRandomColor();
    let msg = `<h1 style="color:${color};">Responding Server: ${servername} using fixed window algorithm </h1>`;
    res.send(msg);
})

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
router.get("/slidingWindowLog", slidingWindowLog ,( req , res ) => {
    let color = getRandomColor();
    let msg = `<h1 style="color:${color};">Responding Server: ${servername} using sliding window log algorithm </h1>`;
    res.send(msg);
})

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

router.get("/leakyBucket", leakyBucket ,( req , res ) => {
    let color = getRandomColor();
    let msg = `<h1 style="color:${color};">Responding Server: ${servername} using fixed window algorithm </h1>`;
    res.send(msg);
})


/**
 * @swagger
 * /api/tokenBucket:
 *   get:
 *     summary: Test Token Bucket Algorithm
 *     description: Implements the Token Bucket rate-limiting algorithm. The bucket refills tokens at a fixed rate (per minute) and allows requests to consume tokens. If the bucket is empty, requests are denied until tokens are refilled.
 *     parameters:
 *       - in: query
 *         name: bcap
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The maximum number of tokens the bucket can hold (bucket capacity).
 *       - in: query
 *         name: rr
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Token refill rate (number of tokens added **per minute**).
 *       - in: query
 *         name: redisKey
 *         schema:
 *           type: string
 *           default: Token_Bucket_Algo
 *         description: Unique identifier for the Redis key used to track bucket tokens and last refill time.
 *     responses:
 *       200:
 *         description: Request accepted — there were enough tokens in the bucket.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Request accepted by Token Bucket Algorithm"
 *       429:
 *         description: Request rejected — the token bucket is empty.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "❌ Too many requests — bucket is empty, wait for refill"
 */

router.get("/tokenBucket" , tokenBucket , ( req , res ) =>{
    let color = getRandomColor();
    let msg = `<h1 style="color:${color};">Responding Server: ${servername} using sliding window log algorithm </h1>`;
    res.send(msg);
} )

export default router;