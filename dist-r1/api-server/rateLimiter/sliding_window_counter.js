const Redis = require("ioredis");

const client = new Redis({
  host: "redis_distributed_server",
  port: 6379,
});
const dotenv = require("dotenv")
dotenv.config()

//Sliding window log algorithm
const slidingWindowLog = async (req, res, next) => {
  const date = new Date();
  try {
    const REDIS_KEY1 = process.env.REDIS_KEY || req.query.redisKey  || "redis_key_1";
    const windowGap = process.env.WINDOW_GAP || req.query.gap || 1;
    const windowCapacity = process.env.WINDOW_CAPACITY  || req.query.cap|| 3;

    const curhour = date.getHours();
    const curminute = date.getMinutes();
    const curseconds = date.getSeconds();
    const curdate = date.getDate();
    const data = {
      curdate,
      curhour,
      curminute,
      curseconds,
    };

    const allRequests = await client.lrange(REDIS_KEY1, 0, -1);

    const length = await client.llen(REDIS_KEY1);
    console.log(data);
    // if the length is less then no problem

    if (length < windowCapacity) {
      await client.lpush(REDIS_KEY1, JSON.stringify(data));
      console.log(`Data Pushed sliding window log`, data);
    } else {
      // if we reached the maximum requests of 3 per minute then we need to do 2 things
      // 1 . Remove all the requests that do not belong to this timeline -> this is the tricky part
      // 2 . After removal are we able to do process this request by checking length
      // if yes then add the request and call the next else send status 429

      let countRemoved = 0;

      for (let request of allRequests) {
        const reqData = JSON.parse(request);
        const reqDate = reqData.curdate;
        const reqHour = reqData.curhour;
        const reqMinute = reqData.curminute;
        const reqSeconds = reqData.curseconds;

        // This will give me data in seconds
        let inSeconds =
          (Math.abs(curdate - reqDate) +
            Math.abs(curhour - reqHour) +
            Math.abs(curminute - reqMinute)) *
            60 +
          (curseconds - reqSeconds);

        if (reqHour > curhour) {
          inSeconds = (24 - reqHour + curhour) * 60 * 60;
        }

        const maxSecondRange = windowGap * 60;
        console.log("inSeconds : ", inSeconds, " maxsecond: ", maxSecondRange);
        if (inSeconds > maxSecondRange) {
          const rm = await client.rpop(REDIS_KEY1);
          console.log(`Removed : `, rm);
          countRemoved++;
        }
      }

      const curLen = length - countRemoved;
      if (curLen < windowCapacity) {
        await client.lpush(REDIS_KEY1, JSON.stringify(data)).then(() => {
          console.log(
            `checked in the else case and Data successfully pushed into redis`
          );
        });
      } else {
        console.log(
          `final data return statement : `,
          await client.lrange(REDIS_KEY1, 0, -1)
        );
        return res.status(429).send({
          message: `Too many requests send in ${windowGap} minute`,
        });
      }
    }
    console.log(
      `final data in redis : `,
      await client.lrange(REDIS_KEY1, 0, -1)
    );
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).send(`This is an error from redis server ${err}`);
  }
};

module.exports = { slidingWindowLog };
