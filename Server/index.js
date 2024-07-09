import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/user.js'
import profileRoute from './routes/profile.js';
import isAvailableRouter from './routes/isAvailable.js';
import postRouter from './routes/post.js';
import commentRouter from './routes/comment.js';
dotenv.config();

const Port = process.env.PORT

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/user', userRouter)
app.use('/profile', profileRoute)
app.use('/isAvailable', isAvailableRouter)
app.use('/post', postRouter)
app.use('/comment',commentRouter)

mongoose.connect('mongodb://localhost:27017/socialMedia')


app.listen(Port, () => {
    console.log("successfuly listening on Port number " + Port)
})