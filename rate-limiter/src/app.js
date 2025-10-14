import express from "express"
import { fixedWindowCounter } from "./rateLimiter/fixed_window_counter.js";
import { slidingWindowLog } from "./rateLimiter/sliding_window_log.js";
import { leakyBucket } from "./rateLimiter/leaky_bucket.js";
import dotenv from "dotenv"

dotenv.config()
const app = express();

app.use( express.json())

const PORT = process.env.PORT || 3022

app.get("/v0", fixedWindowCounter ,( req , res )=>{
    return res.status(200).send({
        "message":"Fixed window counter is able to take this request"
    })
})

app.get("/v1" , slidingWindowLog ,( req , res )=>{
    return res.status(200).send({
        "message":"Sliding window log algorithm is able to take this request"
    })
})

app.get("/v2", leakyBucket ,( req , res )=>{
    return res.status(200).send({
        "message":`Leaky bucket algorithm is able to take all the requests`
    })
})

app.listen( PORT , ()=>{
    console.log( `Server is running on port ${PORT}` )
})
