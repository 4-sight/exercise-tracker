const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const dateModule = require('./src/dateHandler')
const dateHandler = dateModule.dateHandler

mongoose.Promise = global.Promise
mongoose.connect(
  process.env.URI,
  {useMongoClient: true}
  )
  .then(
    () => {console.log("mongoose is connect to db")},
    (err) => {console.log("mongoose connection error", err)}
  )

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static('public'))
app.use('/api/exercise/add', (req, res, next) => {
  req.body.date = dateHandler(req.body.date)
  next()
})
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// ===========================================================

const userSchema = new mongoose.Schema({
  username: String,
  exerciseLog: [
    {
      description: String,
      duration: String,
      date: Date
    }
  ]
})

const UserModel = mongoose.model('user', userSchema)

// Add new user

app.post('/api/exercise/new-user', (req, res) => {
  const { username } = req.body
  UserModel.findOne({username: username}, (err, doc) => {
    if (err) {
      console.log(err)
    } else 
    if (doc) {
      res.json({error: "username already exists"})
    } else {
      new UserModel({
        username: username
      })
      .save((err, doc) => {
        err
        ? console.log("failed to add user", err)
        : res.json({
          username: doc.username,
          id: doc._id
        })
      })
    }
  })
})

// Get All Users

app.get('/api/exercise/users', async(req, res) => {
  try {
    const docs = await UserModel.find({})
    const users = docs.map((user) => {
      return {
        username: user.username,
        _id: user._id
      }
    })
    res.json(users)
  } 
  catch (err) {
    throw err
  }
})


// Add exercise

app.post('/api/exercise/add', async(req, res) => {

  const{ date, description, duration, userId} = req.body

  const update = {
    description: description,
    duration: duration,
    date: date 
  }

  try {
    const doc = await UserModel.findOneAndUpdate(
      {_id: userId},
      {$push: {exerciseLog: update}}
      )
    if (!doc) {
      res.json({error: "unknown _id"})
    } else {
      const user = {
        username: doc.username,
        _id: doc._id,
        description: update.description,
        duration: update.duration,
        date: update.date
      }
      res.json(user)
    }
  }
  catch (err) {
    res.json({error: "invalid entry"})
  }
})


//========================================

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

//================================================


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
