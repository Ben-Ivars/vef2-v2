import { readFile } from 'fs/promises';
import pg from 'pg';
import { strToSlug } from './utils.js';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';
const INSERT_FILE = './sql/insert.sql';

const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development' } =
  process.env;

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development
// mode, á heroku, ekki á local vél
const ssl = nodeEnv === 'production' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(q, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    if (nodeEnv !== 'test') {
      console.error('unable to query', e);
    }
    return null;
  } finally {
    client.release();
  }
}

export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return query(data.toString('utf-8'));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);

  return query(data.toString('utf-8'));
}

export async function insertFakes(insertFile = INSERT_FILE) {
  const data = await readFile(insertFile);

  return query(data.toString('utf-8'));
}

export async function end() {
  await pool.end();
}

/**
 * List all registrations from the signups table.
 *
 * @returns {Promise<Array<list>>} Promise, resolved to array of all registrations.
 */
export async function listEvents(offset = 0, limit = 10) {
  const values = [offset, limit];

  let result = [];

  try {
    const q = `
      SELECT * FROM events
      ORDER BY id ASC
      OFFSET $1 LIMIT $2
    `;

    const queryResult = await query(q, values);

    if (queryResult && queryResult.rows) {
      result = queryResult.rows;
    }
  } catch (e) {
    console.error('Error selecting signatures', e);
  }

  return result;
}
export async function deleteRowEvents(id) {
  let result = [];
  try {
    const fixSignup = await query('DELETE FROM signup WHERE id = $1', [id]);
    const queryResult = await query('DELETE FROM events WHERE id = $1', [id]);

    if (queryResult && queryResult.rows && fixSignup) {
      result = queryResult.rows;
    }
  } catch (e) {
    console.error('Error selecting signup', e);
  }

  return result;
}

/**
 * Insert a single event into the event table.
 *
 * @param {string} entry.name – Name of Event
 * @param {string} entry.slug – Slug of Event name
 * @param {string} entry.description – Description of Event

 * @returns {Promise<boolean>} Promise, resolved as true if inserted, otherwise false
 */
export async function insertEvent({ name, description } = {}) {
  let success = true;
  const slug = strToSlug(name);
  const q = `
    INSERT INTO events
      (name, slug, description)
    VALUES
      ($1, $2, $3);
  `;
  const values = [name, slug, description];

  try {
    await query(q, values);
  } catch (e) {
    console.error('Error inserting event', e);
    success = false;
  }

  return success;
}
/**
 * Selects an event from events table with given slug
 * @param {*} slug slug to event
 * @returns event
 */
export async function selectEvent(slug) {
  const q = `
  SELECT * FROM events
  WHERE
   slug = $1::text
  `;
  let result = [];
  try {
    const queryResult = await query(q, [slug]);
    if (queryResult && queryResult.rows) {
      result = queryResult.rows;
    }
  } catch (e) {
    console.error('Error selecting events', e);
  }

  return result;
}

export async function selectEventBookings(id) {
  const q = `
  SELECT * FROM signup
  WHERE
   event = $1::integer
  `;
  let result = [];
  try {
    const queryResult = await query(q, [id]);
    if (queryResult && queryResult.rows) {
      result = queryResult.rows;
    }
  } catch (e) {
    console.error('Error selecting bookings for event', e);
  }
  return result;
}
export async function insertBooking({ name, comment, id } = {}) {
  let success = true;

  const q = `
    INSERT INTO signup
      (name, comment, event)
    VALUES
      ($1, $2, $3);
  `;
  const values = [name, comment, id];

  try {
    await query(q, values);
  } catch (e) {
    console.error('Error inserting booking', e);
    success = false;
  }

  return success;
}

export async function updateEvent(slug, { name, description } = {}) {
  let success = true;
  const q = `
    UPDATE events
    SET name = $1,
      description = $2,
      updated = CURRENT_TIMESTAMP
    WHERE
      slug = $3;
  `;
  const values = [name, description, slug];

  try {
    await query(q, values);
  } catch (e) {
    console.error('Error updating event', e);
    success = false;
  }

  return success;
}
