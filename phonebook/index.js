const express = require('express')
var morgan = require('morgan')
const app = express()

app.use(express.json())

morgan.token('person', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

let persons = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Phonebook</h1>')
})

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p>
              <p>${new Date()}</p>`)
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person  = persons.find(note => note.id === id)
    if(person) {
        res.json(person)
    } else {
        res.status(404)
           .json({ error: `No person found with id ${id}` })
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(p => p.id != id)
    res.status(200)
       .send()
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

    const nameExists = persons.filter(p => p.name === body.name).length > 0
    if(nameExists) {
        return res.status(400)
                  .json({error: `${body.name} is already added`}) 
    }

    const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    const newPerson = {
        name: body.name,
        number: body.number,
        id: id
    } 
    persons = persons.concat(newPerson)

    res.json(newPerson)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)