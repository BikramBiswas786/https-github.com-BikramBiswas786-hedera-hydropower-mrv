'use strict';

/**
 * Unit tests for the Plants layer — P3 (storage) + P4 (validation)
 * ─────────────────────────────────────────────────────────────────
 * Zero extra dependencies — no supertest, no HTTP layer.
 *
 * P4: plantCreateRules chains are run directly via chain.run(req)
 *   (express-validator v6+ API, already installed).
 *
 * P3: plantRepo is exercised by calling its JS API directly.
 *   jest.resetModules() in beforeEach gives every test a fresh
 *   in-memory store so tests cannot pollute each other.
 */

const { validationResult } = require('express-validator');
const { plantCreateRules }  = require('../src/middleware/validate');

// ─── unique IDs per test run to survive any shared-state edge cases ──────────────
let runId;
beforeAll(() => { runId = Date.now().toString(36); });
function pid(suffix) { return `PLT-${runId}-${suffix}`; }

/**
 * Run all plantCreateRules validator chains against a plain body object.
 * Returns express-validator's Result so tests can inspect errors.
 */
async function validate(body) {
  const req = { body };
  for (const chain of plantCreateRules) {
    await chain.run(req);
  }
  return validationResult(req);
}

// ═══════════════════════════════════════════════════════════════════════
describe('plantCreateRules — P4 input sanitization (express-validator)', () => {

  test('accepts valid plant data — no errors', async () => {
    const result = await validate({
      plant_id:    pid('ok'),
      name:        'Ganges Hydro Unit 1',
      capacity_mw: 12.5
    });
    expect(result.isEmpty()).toBe(true);
  });

  test('rejects capacity_mw above 10 000', async () => {
    const result = await validate({
      plant_id:    pid('big'),
      name:        'Too Big',
      capacity_mw: 99999
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array().some(e => e.path === 'capacity_mw')).toBe(true);
  });

  test('rejects negative capacity_mw', async () => {
    const result = await validate({
      plant_id:    pid('neg'),
      name:        'Negative',
      capacity_mw: -1
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array().some(e => e.path === 'capacity_mw')).toBe(true);
  });

  test('rejects SQL-injection-style string for capacity_mw', async () => {
    const result = await validate({
      plant_id:    pid('sqli'),
      name:        'Injected',
      capacity_mw: '999999; DROP TABLE plants;'
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array().some(e => e.path === 'capacity_mw')).toBe(true);
  });

  test('rejects missing plant_id', async () => {
    const result = await validate({ name: 'No ID', capacity_mw: 5 });
    expect(result.isEmpty()).toBe(false);
    expect(result.array().some(e => e.path === 'plant_id')).toBe(true);
  });

  test('rejects missing name', async () => {
    const result = await validate({ plant_id: pid('noname'), capacity_mw: 5 });
    expect(result.isEmpty()).toBe(false);
    expect(result.array().some(e => e.path === 'name')).toBe(true);
  });

  test('rejects missing capacity_mw', async () => {
    const result = await validate({ plant_id: pid('nocap'), name: 'No Cap' });
    expect(result.isEmpty()).toBe(false);
    expect(result.array().some(e => e.path === 'capacity_mw')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
describe('PlantRepository — P3 persistent storage (PostgreSQL / in-memory)', () => {

  let plantRepo;

  // Fresh module = fresh in-memory store for every test
  beforeEach(() => {
    jest.resetModules();
    ({ plantRepo } = require('../src/db/plants'));
  });

  const plant = (suffix, overrides = {}) => ({
    plant_id:    pid(suffix),
    name:        'Unit Test Plant',
    capacity_mw: 10,
    plant_type:  'hydro',
    status:      'active',
    created_by:  'test@mrv.local',
    ...overrides
  });

  test('create() — returns the created plant with correct fields', async () => {
    const created = await plantRepo.create(plant('create'));
    expect(created.plant_id).toBe(pid('create'));
    expect(Number(created.capacity_mw)).toBe(10);
    expect(created.status).toBe('active');
  });

  test('create() — throws PLANT_EXISTS on duplicate plant_id', async () => {
    await plantRepo.create(plant('dup'));
    await expect(
      plantRepo.create(plant('dup'))
    ).rejects.toThrow('PLANT_EXISTS');
  });

  test('findAll() — returns list that includes a newly created plant', async () => {
    await plantRepo.create(plant('list'));
    const all = await plantRepo.findAll({});
    expect(Array.isArray(all)).toBe(true);
    expect(all.some(p => p.plant_id === pid('list'))).toBe(true);
  });

  test('findAll() — returns empty array when store is empty', async () => {
    const all = await plantRepo.findAll({});
    expect(Array.isArray(all)).toBe(true);
    expect(all).toHaveLength(0);
  });

  test('findById() — returns plant by exact id', async () => {
    await plantRepo.create(plant('byid'));
    const found = await plantRepo.findById(pid('byid'));
    expect(found).not.toBeNull();
    expect(found.plant_id).toBe(pid('byid'));
  });

  test('findById() — returns null for unknown id', async () => {
    const result = await plantRepo.findById('DOES-NOT-EXIST-XYZ-999');
    expect(result).toBeNull();
  });

  test('aggregate() — returns numeric total_plants and total_capacity_mw', async () => {
    await plantRepo.create(plant('agg1', { capacity_mw: 5  }));
    await plantRepo.create(plant('agg2', { capacity_mw: 15 }));
    const stats = await plantRepo.aggregate();
    expect(typeof stats.total_plants).toBe('number');
    expect(stats.total_plants).toBeGreaterThanOrEqual(2);
    expect(typeof stats.total_capacity_mw).toBe('number');
    expect(Number(stats.total_capacity_mw)).toBeGreaterThanOrEqual(20);
  });

  test('isUsingDB() — returns a boolean', () => {
    expect(typeof plantRepo.isUsingDB()).toBe('boolean');
  });
});
