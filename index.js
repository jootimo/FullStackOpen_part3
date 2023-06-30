require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const PersonModel = require('./models/person')  

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('build'))

morgan.token('person', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

app.get('/info', (req, res) => {
    PersonModel.find({}).then(persons => {
        res.send(`<p>Phonebook has info for ${persons.length} people</p>
                  <p>${new Date()}</p>`)
    })
})

app.get('/api/persons', (req, res) => {
    PersonModel.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    PersonModel.findById(req.params.id)
        .then(person => {
            if(person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    PersonModel.findByIdAndRemove(req.params.id)
        .then(deleteResult => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (req, res) => {
    console.log(req.body)
    const body = req.body
    if(!body) {
        return res.status(400)
                  .json({error: 'Content missing'})
    }

    if(!body.name) {
        return res.status(400)
                  .json({error: 'Name missing from input'}) 
    }
    if(!body.number) {
        return res.status(400)
                  .json({error: 'Number missing from input'}) 
    }

    //PersonModel.find({name: body.name})
    //    .then(person => {
    //        return res.status(400)
    //                .json({error: `${body.name} is already added`}) 
    //    })
    //    .catch(error => next(error))

    const newPerson = new PersonModel({
        name: body.name,
        number: body.number
    })

    newPerson.save()
        .then(saveResult => {
            res.json(newPerson)
        })
})

app.put('/api/persons/:id', (req, res, next) => {
    console.log('body:', req.body)
    const body = req.body
    if(!body) {
        return res.status(400)
                  .json({error: 'Content missing'})
    }

    if(!body.name) {
        return res.status(400)
                  .json({error: 'Name missing from input'}) 
    }
    if(!body.number) {
        return res.status(400)
                  .json({error: 'Number missing from input'}) 
    }

    const person = {
        name: body.name,
        number: body.number
    }

    PersonModel.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if(error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id '})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)