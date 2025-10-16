import client from "./client.js";

export const fixedWindowCounter = async (req, res, next) => {
  const date = new Date();
  try {

    const REDIS_KEY = req.query.redisKey || "fixed_window_counter_algo_dup" ;
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
      // first we need to remove all the requests that are less than given minute
      // second check after removing n req is the size less tha capacity
      // if less than add this request else say that there are too many requests in one time

      let countRemoved = 0;
      for (let request of allRequests) {
        const reqData = JSON.parse(request);

        const reqDate = reqData.curdate;
        const reqHour = reqData.curhour;
        const reqMinute = reqData.curminute;

        let diffMin = 0;
        if( reqData > curdate ){
            diffMin = ((30 - reqDate) + curdate)*24*60
        }else {
            diffMin = ((curdate - reqDate)*24*60) +((curhour - reqHour)*60 )+ (curminute - reqMinute) ;
        }
        console.log( "Difference in minute : ",diffMin )
        if( diffMin >= LIMIT ){
            countRemoved++;
            await client.rpop(REDIS_KEY);
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
