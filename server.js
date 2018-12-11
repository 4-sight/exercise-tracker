const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')
const mongoose = require('mongoose')
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
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// ===========================================================
const userSchema = new mongoose.Schema({
  username: String,
})

const User = mongoose.model('user', userSchema)

// Add new user

app.post('/api/exercise/new-user', (req, res) => {
  const { username } = req.body
  User.findOne({username: username}, (err, doc) => {
    if (err) {
      console.log(err)
    } else 
    if (doc) {
      res.json({error: "username already exists"})
    } else {
      new User({
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

app.get('/api/exercise/users', async (req, res) => {
  try {
    const docs = await User.find({})
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
