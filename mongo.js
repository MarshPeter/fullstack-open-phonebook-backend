const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log(
    'You at least need a password to connect to the mongodb database and get the phonebook data'
  )
  process.exit(1)
}

if (process.argv.length > 3 && process.argv.length < 5) {
  console.log('You need to ensure the following is included')
  console.log('First argument should be the password')
  console.log('Second argument should be the person\'s name')
  console.log('Third argument should be the person\'s phone number')
  process.exit(1)
}

if (process.argv.length > 5) {
  console.log(
    'You have entered too many arguments\nThe program will exit to avoid erroneous results'
  )
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@cluster0.ygqmmi9.mongodb.net/phonebookApp?retryWrites=true&w=majority`

if (process.argv.length === 3) {
  findAllPhonebookResults(url)
} else {
  const name = process.argv[3]
  const number = process.argv[4]

  addNewPhonebookEntry(url, name, number)
}

function retrieveSchema(url) {
  mongoose.set('strictQuery', false)
  mongoose.connect(url)

  const personSchema = new mongoose.Schema({
    number: String,
    name: String,
  })

  return mongoose.model('Person', personSchema)
}

function findAllPhonebookResults(url) {
  const Person = retrieveSchema(url)

  console.log('Phonebook: ')
  Person.find({}).then((result) => {
    result.forEach((note) => {
      console.log(`${note.name} ${note.number}`)
    })
    mongoose.connection.close()
  })
}

function addNewPhonebookEntry(url, name, number) {
  const Person = retrieveSchema(url)

  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then(() => {
    console.log(
      `added ${name} to the phonebook with the number: ${number}`
    )
    mongoose.connection.close()
  })
}
