import client from "./redisClient.js";
export const fixedWindowCounter = async (req, res, next) => {
  const date = new Date();
  try {

    const REDIS_KEY = req.query.redisKey || "REDIS_KEY" ;
    const LIMIT = parseInt(req.query.limit) || 1 ;
    const CAPACITY = parseInt(req.query.capacity) || 3;
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

    const allRequests = await client.lrange(REDIS_KEY, 0, -1);

    const length = await client.llen(REDIS_KEY);

    // what we are trying to do is for every 1 minute max requests that will be accepted
    // is 3

    if (length < CAPACITY) {
      await client.lpush(REDIS_KEY, JSON.stringify(data));
      console.log(`Data successfully pushed into redis`, data);
    } else {
      // first we need to remove all the requests that are less than 1 minute
      // second check after removing n req is the size less tha capacity
      // if less than add this request else say that there are too many requests in one time

      let countRemoved = 0;
      for (let request of allRequests) {
        const reqData = JSON.parse(request);

        const reqDate = reqData.curdate;
        const reqHour = reqData.curhour;
        const reqMinute = reqData.curminute;

        if (
          curdate - reqDate != LIMIT - 1 ||
          curhour - reqHour != LIMIT - 1 ||
          curminute - reqMinute != LIMIT - 1
        ) {
          const rm = await client.rpop(REDIS_KEY);
          console.log(`These are remove`, rm);
          countRemoved++;
        }
      }
      const curLen = length - countRemoved;
      if (curLen < CAPACITY) {
        await client.lpush(REDIS_KEY, JSON.stringify(data)).then(() => {
          console.log(
            `checked in the else case and Data successfully pushed into redis`
          );
        });
      } else {
        return res.status(429).send({
          message: `Too many requests send in ${LIMIT} minute`,
        });
      }
    }
    console.log(
      `final data in redis : `,
      await client.lrange(REDIS_KEY, 0, -1)
    );
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).send(`This is an error from redis server ${err}`);
  }
};
