import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import { createSchema, dropSchema, end, insertEvent, selectEvent } from '../lib/db';

/**
 * Hér er test gagnagrunnur búinn til og hent áður en test eru keyrð.
 * package.json sér um að nota dotenv-cli til að loada .env.test sem vísar í þann gagnagrunn
 * sem ætti *ekki* að vera sá sami og við notum „almennt“
 */

describe('db', () => {
  beforeAll(async () => {
    await dropSchema();
    await createSchema();
  });

  afterAll(async () => {
    await end();
  });

  it('creates a valid event and returns it', async () => {
    const created = await insertEvent({
      name: 'Prufu Viðburður',
      description: 'Wow þetta er lýsing',
    });

    expect(created).toBe(true);

    const createdEvent = await selectEvent('prufu-vidburdur');

    expect(createdEvent.name).toBe('Prufu Viðburður');
    expect(createdEvent.slug).toBe('prufu-vidburdur');
    expect(createdEvent.description).toBe('Wow þetta er lýsing');
  });
});
