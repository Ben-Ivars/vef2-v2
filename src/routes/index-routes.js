import express from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';

import { catchErrors } from '../lib/catch-errors.js';
import {
  listEvents,
  selectEvent,
  selectEventBookings,
  insertBooking,
} from '../lib/db.js';

export const indexRouter = express.Router();

async function indexRoute(req, res) {
  // const errors = [];
  // const formData = {
  //   name: '',
  //   description: '',
  // }
  const events = await listEvents();
  // const events = 'events'
  res.render('index', {
    title: 'Viðburðasíðan',
    events,
    admin: false,
  });
}

indexRouter.get('/', catchErrors(indexRoute));

async function eventRoute(req, res, next) {
  let event = {};
  let bookings = [];
  const formData = {
    name: '',
    comment: '',
  };
  const errors = [];
  try {
    const queryResult = await selectEvent(req.params.slug);
    if (queryResult.length > 0) {
      [event] = queryResult;
      bookings = await selectEventBookings(event.id);
    } else {
      next();
      return;
    }
  } catch (e) {
    console.error(e);
  }

  res.render('event', { title: event.name, event, bookings, errors, formData });
}

const validationMiddleware = [
  body('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 64 })
    .withMessage('Nafn má að hámarki vera 64 stafir'),
  body('comment')
    .isLength({ max: 128 })
    .withMessage('Athugasemd má að hámarki vera 128 stafir'),
];

const xssSanitizationMiddleware = [
  body('name').customSanitizer((v) => xss(v)),
  body('comment').customSanitizer((v) => xss(v)),
];

const sanitizationMiddleware = [
  body('name').trim().escape(),
  body('comment').trim().escape(),
];
async function validationCheck(req, res, next) {
  const { name, comment } = req.body;

  const formData = {
    name,
    comment,
  };

  const validation = validationResult(req);
  let event = {};
  let bookings = [];

  try {
    const queryResult = await selectEvent(req.params.slug);
    if (queryResult.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      [event] = queryResult;
      bookings = await selectEventBookings(event.id);
    } else {
      next();
      return;
    }
  } catch (e) {
    console.error(e);
  }

  if (!validation.isEmpty()) {
    return res.render('event', {
      title: event.name,
      event,
      bookings,
      formData,
      errors: validation.errors,
    });
  }

  return next();
}

async function register(req, res) {
  const { name, comment } = req.body;

  let success = true;
  let event = {};
  try {
    const queryResult = await selectEvent(req.params.slug);
    if (queryResult.length > 0) {
      [event] = queryResult;
      success = await insertBooking({
        name,
        comment,
        id: event.id,
      });
    } else {
      success = false;
    }
  } catch (e) {
    console.error(e);
  }

  if (success) {
    return res.redirect(`/${event.slug || ''}`);
  }

  return res.render('error', {
    title: 'Gat ekki skráð!',
    text: 'Gékk ekki að skrá þig á viðburð',
  });
}

indexRouter.get('/:slug', catchErrors(eventRoute));
indexRouter.post(
  '/:slug',
  validationMiddleware,
  xssSanitizationMiddleware,
  catchErrors(validationCheck),
  sanitizationMiddleware,
  catchErrors(register)
);
