import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import connectDB  from './config.js'
import signupRoutes from './routes/signRoutes.js'

connectDB()

const app = express()
app.use(express.json())

app.use(cors({
    origin:true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ["GET", "POST", "PUT", "DELETE"],
}))

app.use('/api',signupRoutes)


const PORT = 5000
app.listen(PORT, ()=>console.log('server is running')
)
