import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import userRouter from "./routes/user.js"
import profileRoute from "./routes/profile.js"
import isAvailableRouter from "./routes/isAvailable.js"
import postRouter from "./routes/post.js"
import commentRouter from "./routes/comment.js"
import connectDB from "./config/dbconfig.js"

dotenv.config()

const port = process.env.PORT || 3000 // Use a default port if not specified

const app = express()
connectDB() // Connect to MongoDB

const PORT = 4000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// Routes
app.get("/", (req, res) => {
  res.send("Server is running")
})

app.use("/user", userRouter)
app.use("/profile", profileRoute)
app.use("/isAvailable", isAvailableRouter)
app.use("/post", postRouter)
app.use("/comment", commentRouter)

// MongoDB connection handling
const db = mongoose.connection
mongoose.connection.once("open", () => {
  console.log("DB connected")
  app.listen(3030, () => {
    console.log("server is running")
  })
})
