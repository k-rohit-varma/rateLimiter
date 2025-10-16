import express from "express"
import { slidingWindowLog } from "./rateLimiter/sliding_window_counter.js"
import dotenv from "dotenv"
import router from "./routers/appRouter.js";
import swaggerUi from "swagger-ui-express"
import os from 'os'
import swaggerJSDoc from "swagger-jsdoc";
import getRandomColor from "./color.js";
dotenv.config()

const app = express();
app.use(express.json())
const port = process.env.PORT || 7070;

let color = getRandomColor();
let servername = os.hostname()

app.use("/api",router)
app.get('/', slidingWindowLog ,function(req, res){
    var msg = `<h1 style="color:${color};">Responding Server: ${servername} By default using sliding window algorithm </h1>`;
    res.send(msg);
});

const options = {
  definition: {
    openapi: '3.0.0', // Specify the OpenAPI version
    info: {
      title: 'Your API Title',
      version: '1.0.0',
      description: 'A description of your API',
    },
    servers: [
      {
        url: `http://localhost:${port}`, // Replace with your server URL
        description: 'Development server',
      },
    ],
  },
  apis: ['./routers/*.js'], // Path to your API route files
};

const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, function(){
    console.log("Server running at http://localhost:"+port);
});