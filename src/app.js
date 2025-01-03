import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

var corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }

  app.use(cors(corsOptions))
  app.use(cookieParser())
  app.use(express.json({limit:"16kb"}))
  app.use(express.urlencoded({extended:true,limit:"16kb",}))
  app.use(express.static("public"))

  // Routes Import

  import userRouter from "./routes/user.routes.js"
  import videoRouter from "./routes/video.routes.js"
  import channelRouter from "./routes/channel.routes.js"

  // Routes Activation

  app.use("/api/v1/users", userRouter)
  app.use("/api/v1/videos", videoRouter)
  app.use("/api/v1/channels", channelRouter)


export { app }

