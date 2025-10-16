# 🚀 Rate Limiter System (Single & Distributed)

This project demonstrates **two types of rate limiter implementations** using Node.js and Redis — one running on a **single server**, and another using a **distributed Token Bucket algorithm**.  
Both services can be run simultaneously using **Docker Compose**.

---

## 🧩 How to Run

### Prerequisites
Make sure you have the following installed:
- **Docker**
- **Docker Compose**

You can verify your setup by running:
```bash
docker --version
docker-compose --version
🐳 Start the Containers
Run the following command in the root of the project:
docker-compose up --build
This will start two containers automatically:
Server Type	Description	Port	Swagger URL
🧱 Single Server Rate Limiter	Demonstrates a basic in-memory rate limiter.	3022	http://localhost:3022/api-docs
🌐 Distributed Token Bucket Rate Limiter	Uses Redis to synchronize tokens across multiple instances.	7070	

⚙️ Server Details
🧱 Single Server Rate Limiter (Port 3022)
Implements a basic rate limiting mechanism.
Limits are stored in memory (non-persistent).
Restarting the server resets the rate limits.
Access its documentation here:
👉 http://localhost:3022/api-docs
🌐 Distributed Token Bucket Rate Limiter (Port 7070)
Implements the Token Bucket Algorithm using Redis as a shared backend.
Enables distributed rate limiting across multiple services or containers.
Configurable via query parameters:
bcap → bucket capacity (default: 10)
rr → refill rate per minute (default: 5)
Swagger Documentation:
👉 http://localhost:7070/api-docs/
🧾 Verify the Setup
Once the containers are up:
Open Single Server Swagger Docs:
http://localhost:3022/api-docs
Open Distributed Token Bucket Swagger Docs:
http://localhost:7070/api-docs/
Both interfaces will let you test the endpoints interactively.
🛑 Stopping the Containers
To stop and remove all running containers:
docker-compose down