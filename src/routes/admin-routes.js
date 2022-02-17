// import express from 'express';
// // import { listComments } from '../lib/db.js';

// export const adminRouter = express.Router();

// export function ensureLoggedIn(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }

//   return res.redirect('/login');
// }

// adminRouter.get('/', ensureLoggedIn, async (req, res) => {
//   // const comments = await listComments();
//   const comments = 'comments'
//   res.render('admin', { title: 'admin svæði', comments });
// });

import express from 'express';
import xss from 'xss';

// import { deleteRow, list, total } from './db.js';
import passport, { ensureLoggedIn } from '../lib/login.js';
import { catchErrors, pagingInfo, PAGE_SIZE } from '../lib/utils.js';

export const adminRouter = express.Router();

async function index(req, res) {
  // let { page = 1 } = req.query;
  // page = Number(page);

  const { search } = req.query;

  // const offset = (page - 1) * PAGE_SIZE;

  // // const registrations = await list(offset, PAGE_SIZE, search);
  // // const totalRegistrations = await total(search);
  // const paging = await pagingInfo(
  //   {
  //     page, offset, totalRegistrations, registrationsLength: registrations.length,
  //   },
  // );

  const { user } = req;

  return res.render('admin', {
    user,
    // registrations,
    // paging,
    title: 'Undirskriftarlisti — umsjón',
    admin: true,
    search: xss(search),
  });
}

function login(req, res) {
  // if (req.isAuthenticated()) {
  //   return res.redirect('/admin');
  // }

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

  // const deleted = deleteRow(id);

  // if (deleted) { // Tæknilega böggur hér...
  //   return res.redirect('/admin');
  // }

  return res.render('error', { title: 'Gat ekki eytt færslu' });
}

adminRouter.get('/', ensureLoggedIn, catchErrors(index));
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
  },
);

adminRouter.get('/logout', (req, res) => {
  // logout hendir session cookie og session
  req.logout();
  res.redirect('/');
});

