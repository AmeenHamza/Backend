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
import videoRouter from './routes/video.routes.js';
import likeRouter from './routes/like.routes.js';
import commentRouter from './routes/comment.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';


// Routes decleration (Is exactly same as we did in E-commerce)

app.use('/api/v1/users', userRouter)
app.use('/api/v1/videos', videoRouter)
app.use('/api/v1/likes', likeRouter)
app.use('/api/v1/comments', commentRouter)
app.use('/api/v1/subscription', subscriptionRouter)

export { app }