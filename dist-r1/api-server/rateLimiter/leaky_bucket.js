import client from "./client.js";
export const leakyBucket = async (req, res, next) => {
  try {

    const {redisKey , bCap , leakRateInSeconds , noOfReq} = req.query;

    const REDIS_KEY1 = redisKey || "Leaky_Bucket_algo";
    const bucketCapacity = parseInt(bCap) || 5;
    const leakingRate = parseInt(leakRateInSeconds) || 1 ;
    const noOfRequests = parseInt(noOfReq) || 3;
    const date = new Date();

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

    if (length + noOfRequests <= bucketCapacity) {
      for (let i = 0; i < noOfRequests; i++) {
        await client.lpush(REDIS_KEY1, JSON.stringify(data));
        console.log(`Data Pushed leaky bucket`, data);
      }

      const needToRemove = Math.min(length + noOfRequests, leakingRate);
      for (let i = 0; i < needToRemove; i++) {
        const rm = await client.rpop(REDIS_KEY1);
        console.log(`These requests are leaked ${rm}`);
      }

      console.log(
        `final data in redis : `,
        await client.lrange(REDIS_KEY1, 0, -1)
      );
      next();
    } else {
      // handle overflow - remove older requests based on leak time
      for (let reqData of allRequests) {
        const redisData = JSON.parse(reqData);
        const reqDate = redisData.curdate;
        const reqHour = redisData.curhour;
        const reqMinute = redisData.curminute;
        const reqSecond = redisData.curseconds;

        let diffenceSeconds = 0;

     
        const curTotal = curhour * 3600 + curminute * 60 + curseconds;
        const reqTotal = reqHour * 3600 + reqMinute * 60 + reqSecond;
        diffenceSeconds = curTotal - reqTotal;

        if (diffenceSeconds < 0) {
          //  FIX — handle day rollover (midnight)
          diffenceSeconds += 24 * 3600;
        }

        console.log(`Diffence in Seconds`, diffenceSeconds);

        let pendingRequest = diffenceSeconds * leakingRate;

        if (pendingRequest >= length) {
          //  FIX — proper clear
          await client.ltrim(REDIS_KEY1, 1, 0);
          console.log(`All data in redis deleted due to over time`);
          break;
        } else if (pendingRequest > 0) {
          for (let i = 0; i < pendingRequest && i < length; i++) {
            const rmp = await client.rpop(REDIS_KEY1);
            console.log(`for loop deletion happened : `, rmp);
          }
        }
        break;
      }

      //  FIX — newLength must be a number, not array
      const newLength = await client.llen(REDIS_KEY1);

      //  FIX — correct formula for how many we can still add
      const canAdd = Math.max(0, bucketCapacity - newLength);
      const willProcess = Math.min(canAdd, noOfRequests);

      for (let i = 0; i < willProcess; i++) {
        await client.lpush(REDIS_KEY1, JSON.stringify(data));
        console.log(`Else condition Data Pushed into leaky bucket`, data);
      }

      //  FIX — remove processed after adding
      const needToRemove = Math.min(newLength + willProcess, leakingRate);
      for (let i = 0; i < needToRemove; i++) {
        const rm = await client.rpop(REDIS_KEY1);
        console.log(`These requests are leaked ${rm}`);
      }

      console.log(
        `This is the data in redis :`,
        await client.lrange(REDIS_KEY1, 0, -1)
      );

      return res.send({
        message: `Only able to process ${willProcess} requests and remaining ${
          noOfRequests - willProcess
        } overflowed`,
      });
    }
  } catch (err) {
    return res.status(500).send(`Leaky bucket internal server error ${err}`);
  }
};
