import { readFile } from 'fs/promises';
import pg from 'pg';

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

/* TODO útfæra aðgeðir á móti gagnagrunni */

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

export async function deleteRowSignup(id) {
  let result = [];
  try {
    const queryResult = await query(
      'DELETE FROM signups WHERE id = $1',
      [id],
    );

    if (queryResult && queryResult.rows) {
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
export async function insertEvent({
  name, slug, description,
} = {}) {
  let success = true;

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
 * Insert a signup registration into the signup table.
 *
 * @param {string} entry.name – name of user who is signing up
 * @param {string} entry.comment – comment about signup
 * @param {Date} entry.event – id of event to be updated

 * @returns {Promise<boolean>} Promise, resolved as true if inserted, otherwise false
 */
export async function insertSignup({
  name, comment, event,
} = {}) {
  let success = true;

  const q = `
    INSERT INTO events
      (name, comment, event)
    VALUES
      ($1, $2, $3);
  `;
  const values = [name, comment, event];

  try {
    await query(q, values);
  } catch (e) {
    console.error('Error inserting signup', e);
    success = false;
  }

  return success;
}
