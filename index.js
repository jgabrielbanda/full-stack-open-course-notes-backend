require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Note = require('./models/node')

const app = express()

const requestLogger = (request, response, next) => {
  console.log('Method', request.method)
  console.log('Path', request.path)
  console.log('Body', request.body)
  console.log('---')
  next()
}

app.use(cors())
app.use(express.json())
app.use(requestLogger)

// let notes = [
//   {
//     id: 1,
//     content: "HTML is easy",
//     date: "2019-05-30T17:30:31.098Z",
//     important: true
//   },
//   {
//     id: 2,
//     content: "Browser can execute only Javascript",
//     date: "2019-05-30T18:39:34.091Z",
//     important: false
//   },
//   {
//     id: 3,
//     content: "GET and POST are the most important methods of HTTP protocol",
//     date: "2019-05-30T19:20:14.298Z",
//     important: true
//   }
// ]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes/:id', (request, response, next) => {
  Note
    .findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
    // .catch(error => {
    //   console.log(error)
    //   response.status(400).send({error: 'malformatted id'})
    // })
})

app.get('/api/notes', (request, response) => {
  Note
    .find({})
    .then (notes => {
      response.json(notes)
    })
})

app.put('/api/notes/:id', (request, response, next) => {
  const {name, important} = request.body

  Note
    .findByIdAndUpdate(request.params.id, { name, important }, {new: true,  runValidators: true, context: 'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})


app.delete('/api/notes/:id', (request, response, next) => {
  Note
    .findByIdAndRemove(request.params.id)
    .then( result => {
      console.log(result)
      response.status(204).end()
    })
    .catch(error => next(error))
})

// const generateId = () => {
//   const maxId = notes.length > 0
//     ? Math.max(...notes.map(noteItem => noteItem.id))
//     : 0

//   return maxId + 1
// }

app.post('/api/notes', (request, response, next) => {
  const body = request.body

  // if (!body.content) {
  //   return response.status(400).json({
  //     error: 'content missing'
  //   })
  // }

  const note = new Note({
    content: body.content,
    // date: new Date(),
    important: body.important || false,
  })

  note
    .save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error))

})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint'})
}


app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({error: 'malformatted id'})
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }

  next(error)
}

app.use(errorHandler)