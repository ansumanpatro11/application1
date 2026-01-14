import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app=express();


app.use(cors({
    origin:process.env.CROSS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true,limit:'10kb'})); //to encode urls
app.use(express.static('public'));  //images, assets etc
app.use(cookieParser())

//routes

import userRouter from './routes/user.routes.js';
import commentRouter from './routes/comment.routes.js';
import videoRouter from './routes/video.routes.js';

app.use("/api/v1/video", videoRouter);
//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/comments", commentRouter);

export default app