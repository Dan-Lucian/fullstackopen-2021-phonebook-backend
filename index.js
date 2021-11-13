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

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);
app.use(express.static('build'));
app.use(express.json());

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

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const foundPerson = persons.find((person) => person.id === id);

  if (foundPerson) {
    res.json(foundPerson);
  } else {
    res.status(404).end();
  }
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

const getRandomInt = (min = 0, max = 1000000) => {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
};

app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    res.status(400).json({ error: 'incomplete person info' });
    return;
  }

  const foundName = persons.find((person) => person.name === body.name);
  if (foundName) {
    res.status(400).json({ error: 'name must be unique' });
    return;
  }

  const newPerson = {
    id: getRandomInt(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(newPerson);

  res.json(newPerson);
});

let PORT = process.env.PORT;
if (PORT == null || PORT == '') {
  PORT = 8000;
}
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
