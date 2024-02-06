require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

let persons = [
    {
        number: "040-123456",
        id: 1,
        name: "Arto Hellas",
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523",
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345",
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122",
    },
];

const app = express();

morgan.token("custom", function (req, res) {
    return `${JSON.stringify(req.body)}`;
});

// middleware
app.use(express.static("dist"));
app.use(express.json());
app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :custom"
    )
);
app.use(cors());

app.get("/api/persons", (request, response) => {
    Person.find({}).then((people) => {
        response.json(people);
    });
});

app.get("/api/persons/:id", (request, response) => {
    const id = request.params.id;

    Person.find({ _id: id }).then((people) => {
        if (people == []) {
            response.status(404).end();
        }

        response.json(people);
    });
});

app.get("/info", (request, response) => {
    const currentTime = new Date();
    const peopleCount = persons.length;

    response.send(
        `<p>Phonebook has info for ${peopleCount} people</p><p>${currentTime.toString()}</p>`
    );
});

app.delete("/api/persons/:id", (request, response) => {
    const id = request.params.id;

    Person.findByIdAndDelete(id)
        .then((result) => {
            response.status(204).end();
        })
        .catch((error) => next(error));
});

app.post("/api/persons", (request, response) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "ensure that name and number is included in sent data missing",
        });
    }

    const person = new Person({
        number: body.number,
        name: body.name,
    });

    person.save().then((savedPerson) => {
        response.json(savedPerson);
    });
});

function unknownEndpoint(request, response) {
    response.status(404).send({ error: "unknown endpoint" });
}

app.use(unknownEndpoint);

function errorHandler(error, request, response, next) {
    console.log(error.message);

    if ((error.name = "CastError")) {
        return response.status(400).send({ error: "malformatted id" });
    }

    next(error);
}

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
