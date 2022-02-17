import { end, createSchema, insertFakes } from './lib/db.js';

async function create() {
  await createSchema();
  await insertFakes();
  // eslint-disable-next-line no-console
  console.log('schema created and fakes added')
  await end();
}

create().catch((err) => {
  console.error('Error creating running setup', err);
});
