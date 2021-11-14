import dotenv from 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import { Person } from './models/person.js';

morgan.token('body', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  }
});

const app = express();

app.use(express.static('build'));
app.use(express.json());
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

app.get('/info', (req, res) => {
  console.log(req);
  res.send(
    `
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
    `
  );
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then((result) => {
    res.json(result);
  });
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((foundPerson) => {
      if (foundPerson) {
        res.json(foundPerson);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => next(err));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => next(err));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  const newPerson = new Person({
    name: body.name,
    phoneNumber: body.phoneNumber,
  });

  newPerson
    .save()
    .then((savedPerson) => {
      res.json(savedPerson);
    })
    .catch((err) => next(err));
});

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body;
  const person = {
    name: body.name,
    phoneNumber: body.phoneNumber,
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((err) => next(err));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

// handler of reqs with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  switch (err.name) {
    case 'CastError':
      return res.status(400).send({ error: 'malformatted id' });

    case 'ValidationError':
      return res.status(400).send({ error: err.message });
  }

  next(error);
};
app.use(errorHandler);

let PORT = process.env.PORT;
if (PORT == null || PORT == '') {
  PORT = 8000;
}
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
