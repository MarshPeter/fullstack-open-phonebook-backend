require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

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

app.get("/api/persons", (request, response, next) => {
    Person.find({})
        .then((people) => {
            response.json(people);
        })
        .catch((error) => {
            next(error);
        });
});

app.get("/api/persons/:id", (request, response, next) => {
    const id = request.params.id;

    Person.findById(id)
        .then((person) => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => {
            next(error);
        });
});

app.get("/info", (request, response, next) => {
    const currentTime = new Date();

    Person.find({})
        .then((people) => {
            const peopleCount = people.length;

            response.send(
                `<p>Phonebook has info for ${peopleCount} people</p><p>${currentTime.toString()}</p>`
            );
        })
        .catch((error) => {
            next(error);
        });
});

app.put("/api/persons/:id", (request, response, next) => {
    const id = request.params.id;
    const body = request.body;

    const person = {
        name: body.name,
        number: body.number,
    };

    Person.findByIdAndUpdate(id, person, { new: true })
        .then((updatedPerson) => {
            response.json(updatedPerson);
        })
        .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
    const id = request.params.id;

    Person.findByIdAndDelete(id)
        .then((result) => {
            response.status(204).end();
        })
        .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
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
