import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

// this contains object with property of limit (16kb) se zyada json nhi ayega

app.use(express.json({limit : '16kb'}));
app.use(express.urlencoded({extended : true})); // extended for taking multiple objects
app.use(express.static("public"));
app.use(cookieParser());

// Configuration of Routes
import userRouter from './routes/user.routes.js';


// Routes decleration (Is exactly same as we did in E-commerce)

app.use('/api/v1/users', userRouter)

export { app }