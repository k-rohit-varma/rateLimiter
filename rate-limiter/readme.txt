
leaky bucket : 
http://localhost:3022/v2?redisKey="leaky bucket"&bCap=4&noOfReq=3&leak=1

sliding window :
http://localhost:3022/v1?redisKey="sliding window"&gap=1&cap=3

fixed window :
http://localhost:3022/v0?redisKey="fixed window"&limit=1&capacity=3