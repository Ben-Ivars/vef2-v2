import { readFile } from 'fs/promises';
import * as faker from 'faker'

import { end, query } from './lib/db.js';

const schemaFile = './sql/schema.sql'

function createFakeEvents(n) {
  // TODO setja upp gagnagrun + gögn
  const fake = [];

  while (fake.length < n) {
    const timeNow = new Date();
    // TODO fix slug
    fake.push({
      name: faker.name.findName(),
      slug: 'slug',
      description: faker.Lorem.sentence(),
      created: timeNow,
      updated: timeNow
    })
  }
  return fake;

}

function createFakeUsers(n) {
  // TODO setja upp gagnagrun + gögn
}

function createFakeSignUps(n) {
  // TODO setja upp gagnagrun + gögn
}

async function create() {
  // TODO setja upp gagnagrun + gögn
  const data = await readFile(schemaFile);

  try {
    await query(data.toString('utf-8'));
    console.info('Schema created');
  } catch (e) {
    console.error('Error creating schema', e);
  }

  // TODO add fake data
  // see: https://github.com/vefforritun/vef2-2021-v3-synilausn/blob/main/src/setup.js

  await end();
}

create().catch((err) => {
  console.error('Error creating running setup', err);
});
