const express = require("express");
const morgan = require("morgan");

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

// middleware

app.use(express.json());

morgan.token("custom", function (req, res) {
    return `${JSON.stringify(req.body)}`;
});

app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :custom"
    )
);

app.get("/api/persons", (request, response) => {
    response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);

    const matchedPerson = persons.find((person) => person.id === id);

    if (matchedPerson) {
        response.json(matchedPerson);
    }

    response.status(404).end();
});

app.get("/info", (request, response) => {
    const currentTime = new Date();
    const peopleCount = persons.length;

    response.send(
        `<p>Phonebook has info for ${peopleCount} people</p><p>${currentTime.toString()}</p>`
    );
});

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);

    persons = persons.filter((person) => person.id !== id);

    response.status(204).end();
});

app.post("/api/persons", (request, response) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "ensure that name and number is included in sent data missing",
        });
    }

    if (persons.find((person) => person.name === body.name)) {
        return response.status(400).json({
            error: "name must be unique",
        });
    }

    const newId = Math.floor(Math.random() * 1000000);

    const person = {
        name: body.name,
        number: body.number,
        id: newId,
    };

    persons = persons.concat(person);

    response.json(person);
});

function unknownEndpoint(request, response) {
    response.status(404).send({ error: "unknown endpoint" });
}

app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
