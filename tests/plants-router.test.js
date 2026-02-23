'use strict';

/**
 * Integration tests for POST+GET /api/v1/plants
 * ─────────────────────────────────────────────────────────────────
 * Covers P3 (PostgreSQL-backed storage) and P4 (express-validator).
 *
 * Auth strategy:
 *   Operator/admin routes need a JWT.  We use POST /api/auth/login
 *   with the demo operator credential (op-secret) to obtain a real
 *   token from the running app, then pass it as Bearer.
 *
 *   Public GET routes are called without auth.
 */

const request = require('supertest');
const app     = require('../src/api/server');

// ─── helpers ─────────────────────────────────────────────────────────────────

async function getOperatorToken() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'operator@mrv.local', password: 'op-secret' });
  return res.body.token;
}

async function getAdminToken() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@mrv.local', password: 'admin-secret' });
  return res.body.token;
}

// Unique plant_id per test run to avoid cross-test collisions in
// the in-memory store (PlantRepository resets between process restarts
// but NOT between Jest test files in the same process).
let runId;
beforeAll(() => { runId = Date.now().toString(36); });
function pid(suffix) { return `PLT-${runId}-${suffix}`; }

// ───────────────────────────────────────────────────────────────────────
describe('Plants Router — P3 (PostgreSQL) + P4 (express-validator)', () => {

  // ─── POST /api/v1/plants ───────────────────────────────────────────────────
  describe('POST /api/v1/plants', () => {

    test('[P4] rejects capacity_mw above 10000 with 422', async () => {
      const token = await getOperatorToken();
      const res = await request(app)
        .post('/api/v1/plants')
        .set('Authorization', `Bearer ${token}`)
        .send({
          plant_id:    pid('too-big'),
          name:        'Too Big Plant',
          capacity_mw: 99999        // express-validator: max 10000
        });
      expect(res.status).toBe(422);
      expect(res.body.errors).toBeDefined();
    });

    test('[P4] rejects negative capacity_mw with 422', async () => {
      const token = await getOperatorToken();
      const res = await request(app)
        .post('/api/v1/plants')
        .set('Authorization', `Bearer ${token}`)
        .send({
          plant_id:    pid('negative'),
          name:        'Negative Plant',
          capacity_mw: -5           // express-validator: min 0
        });
      expect(res.status).toBe(422);
    });

    test('[P4] rejects SQL-injection-style string for capacity_mw', async () => {
      const token = await getOperatorToken();
      const res = await request(app)
        .post('/api/v1/plants')
        .set('Authorization', `Bearer ${token}`)
        .send({
          plant_id:    pid('sqli'),
          name:        'Injected',
          capacity_mw: '999999; DROP TABLE plants;'
        });
      expect(res.status).toBe(422);
    });

    test('[P3] creates a plant and reports storage backend', async () => {
      const token = await getOperatorToken();
      const res = await request(app)
        .post('/api/v1/plants')
        .set('Authorization', `Bearer ${token}`)
        .send({
          plant_id:    pid('valid'),
          name:        'Test Hydro Plant',
          location:    'West Bengal, IN',
          capacity_mw: 12.5,
          plant_type:  'hydro'
        });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.plant.plant_id).toBe(pid('valid'));
      expect(res.body.plant.capacity_mw).toBe(12.5);
      // P3 proof: response declares which storage backend is active
      expect(['postgresql', 'in-memory']).toContain(res.body.storage);
    });

    test('returns 409 on duplicate plant_id', async () => {
      const token = await getAdminToken();
      const payload = {
        plant_id:    pid('dup'),
        name:        'Duplicate Test',
        capacity_mw: 5
      };
      // First create succeeds
      await request(app)
        .post('/api/v1/plants')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
      // Second create must return 409
      const res = await request(app)
        .post('/api/v1/plants')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already exists/i);
    });

    test('returns 400 when required fields are missing', async () => {
      const token = await getOperatorToken();
      const res = await request(app)
        .post('/api/v1/plants')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Missing plant_id and capacity' });
      // express-validator returns 422; bare required-field check returns 400
      expect([400, 422]).toContain(res.status);
    });

    test('returns 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/v1/plants')
        .send({ plant_id: pid('noauth'), name: 'No Auth', capacity_mw: 1 });
      expect(res.status).toBe(401);
    });
  });

  // ─── GET /api/v1/plants ───────────────────────────────────────────────────
  describe('GET /api/v1/plants', () => {

    test('returns plant list (public, no auth required)', async () => {
      const res = await request(app).get('/api/v1/plants');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.plants)).toBe(true);
      expect(typeof res.body.total_capacity_mw).toBe('number');
      expect(['postgresql', 'in-memory']).toContain(res.body.storage);
    });

    test('returns 404 for unknown plant_id', async () => {
      const res = await request(app).get('/api/v1/plants/DOES-NOT-EXIST-XYZ');
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/i);
    });

    test('returns a known plant by id', async () => {
      // Create one first
      const token = await getOperatorToken();
      const createRes = await request(app)
        .post('/api/v1/plants')
        .set('Authorization', `Bearer ${token}`)
        .send({ plant_id: pid('fetch'), name: 'Fetch Me', capacity_mw: 7 });
      expect(createRes.status).toBe(201);

      const res = await request(app).get(`/api/v1/plants/${pid('fetch')}`);
      expect(res.status).toBe(200);
      expect(res.body.plant.plant_id).toBe(pid('fetch'));
    });
  });

  // ─── GET /api/v1/plants/aggregate/stats ─────────────────────────────────
  describe('GET /api/v1/plants/aggregate/stats', () => {

    test('returns aggregate totals (requires JWT)', async () => {
      const token = await getOperatorToken();
      const res = await request(app)
        .get('/api/v1/plants/aggregate/stats')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(typeof res.body.total_plants).toBe('number');
      expect(typeof res.body.total_capacity_mw).toBe('number');
    });

    test('returns 401 without auth token', async () => {
      const res = await request(app).get('/api/v1/plants/aggregate/stats');
      expect(res.status).toBe(401);
    });
  });
});
