import express from 'express'
import bodyParser from 'body-parser'
import env from 'dotenv'
import cors from 'cors'
import analyze from './routes/analyzerRoute.js'
// configurations
env.config()
const app = express()
const port = process.env.PORT

//middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors({
  origin: '*',
  methods: ['GET','POST'],
}))

// routes
app.use('/',analyze)

// Initillisation
app.listen(port,()=>{
  console.log(`App running on port-> ${port}`)
})
