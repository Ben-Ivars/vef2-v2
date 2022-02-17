import express from 'express';

import { catchErrors } from '../lib/catch-errors.js';
import { listEvents } from '../lib/db.js'

export const indexRouter = express.Router();

async function indexRoute(req, res) {
  const errors = [];
  const formData = {
    name: '',
    description: '',
  }
  const events = await listEvents();
  // const events = 'events'
  res.render('index', {
    errors,
    formData,
    title: 'Viðburðasíðan',
    events,
    admin: false,
  });
}

indexRouter.get('/', catchErrors(indexRoute));

// TODO útfæra öll routes
