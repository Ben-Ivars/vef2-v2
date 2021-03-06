import express from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';

import {
  listEvents,
  insertEvent,
  deleteRowEvents,
  updateEvent,
  selectEvent,
  selectEventBookings,
} from '../lib/db.js';
import passport, { ensureLoggedIn } from '../lib/login.js';
import { catchErrors } from '../lib/catch-errors.js';

export const adminRouter = express.Router();

async function adminRoute(req, res) {
  const errors = [];

  const formData = {
    name: '',
    description: '',
  };

  const { search } = req.query;

  const { user } = req;

  const events = await listEvents();

  return res.render('admin', {
    errors,
    user,
    title: 'Viðburðaskráning — umsjón',
    admin: true,
    search: xss(search),
    events,
    formData,
  });
}
async function adminEventRoute(req, res, next) {
  let event = {};
  let bookings = [];
  const admin = true;
  const formData = {
    name: '',
    description: '',
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

  res.render('event-admin', {
    title: event.name,
    event,
    bookings,
    errors,
    formData,
    admin,
  });
}

function login(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
  }

  let message = '';

  // Athugum hvort einhver skilaboð séu til í session, ef svo er birtum þau
  // og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.render('login', { message, title: 'Innskráning' });
}
async function deleteRoute(req, res) {
  const { id } = req.params;

  const deleted = deleteRowEvents(id);

  if (deleted) {
    // Tæknilega böggur hér...
    return res.redirect('/admin');
  }

  return res.render('error', { title: 'Gat ekki eytt færslu' });
}

adminRouter.get('/', ensureLoggedIn, catchErrors(adminRoute));
adminRouter.get('/login', login);
adminRouter.post('/delete/:id', ensureLoggedIn, catchErrors(deleteRoute));

adminRouter.post(
  '/login',

  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/admin/login',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    res.redirect('/admin');
  }
);

adminRouter.get('/logout', (req, res) => {
  // logout hendir session cookie og session
  req.logout();
  res.redirect('/');
});

const validationMiddleware = [
  body('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 64 })
    .withMessage('Nafn má að hámarki vera 64 stafir'),
  body('description')
    .isLength({ max: 400 })
    .withMessage('Lýsing má að hámarki vera 400 stafir'),
];

// Viljum keyra sér og með validation, ver gegn „self XSS“
const xssSanitizationMiddleware = [
  body('name').customSanitizer((v) => xss(v)),
  body('description').customSanitizer((v) => xss(v)),
];

const sanitizationMiddleware = [
  body('name').trim().escape(),
  body('description').trim().escape(),
];

async function validationCheckNew(req, res, next) {
  const { name, description } = req.body;
  const { user } = req;
  const formData = {
    name,
    description,
  };
  const validation = validationResult(req);
  const events = await listEvents();

  if (!validation.isEmpty()) {
    return res.render('admin', {
      title: 'Viðburðaumsjón',
      subtitle: 'Viðburðir',
      events,
      user,
      errors: validation.errors,
      formData,
      admin: true,
    });
  }

  return next();
}

async function validationCheckUpdate(req, res, next) {
  const { name, description } = req.body;
  const { user } = req;
  let event = {};
  let bookings = [];
  const formData = {
    name,
    description,
  };
  const validation = validationResult(req);
  event = await selectEvent(req.params.slug);
  bookings = await selectEventBookings(event.id);

  if (!validation.isEmpty()) {
    return res.render('event-admin', {
      title: event.name,
      event,
      user,
      errors: validation.errors,
      formData,
      admin: true,
      bookings,
    });
  }

  return next();
}

async function fixEvent(req, res) {
  const { name, description } = req.body;
  let success = true;
  let event = {};
  try {
    const queryResult = await selectEvent(req.params.slug);
    if (queryResult.length > 0) {
      [event] = queryResult;
      success = await updateEvent(req.params.slug, {
        name,
        description,
      });
    } else {
      success = false;
    }
  } catch (e) {
    console.error(e);
  }

  if (success) {
    return res.redirect(`/admin/${event.slug || ''}`);
  }

  return res.render('error', {
    title: 'Gat ekki uppfært viðburð!',
    text: 'Gékk ekki að uppfæra viðburð',
  });
}

async function registerEvent(req, res) {
  const { name, description } = req.body;
  let success = true;
  try {
    success = await insertEvent({
      name,
      description,
    });
  } catch (e) {
    console.error(e);
  }

  if (success) {
    return res.redirect('/admin');
  }

  return res.render('error', {
    title: 'Gat ekki skráð viðburð!',
    text: 'Gékk ekki að skrá viðburð',
  });
}

adminRouter.get('/:slug', ensureLoggedIn, catchErrors(adminEventRoute));
adminRouter.post(
  '/:slug',
  ensureLoggedIn,
  validationMiddleware,
  xssSanitizationMiddleware,
  sanitizationMiddleware,
  catchErrors(validationCheckUpdate),
  catchErrors(fixEvent)
);
adminRouter.post(
  '/',
  ensureLoggedIn,
  validationMiddleware,
  xssSanitizationMiddleware,
  sanitizationMiddleware,
  catchErrors(validationCheckNew),
  catchErrors(registerEvent)
);
