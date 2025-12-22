import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app=express();


app.use(cors(){
    origin:process.env.CROSS_ORIGIN,
    credentials:true
})

app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true,limit:'10kb'})); //to encode urls
app.use(express.static('public'));  //images, assets etc
app.use(cookieParser())

export {app}