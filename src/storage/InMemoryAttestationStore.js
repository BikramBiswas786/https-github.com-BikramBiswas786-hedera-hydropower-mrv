'use strict';

/**
 * InMemoryAttestationStore
 *
 * Lightweight in-process attestation store.
 * Implements the same interface as the planned PostgreSQL adapter so
 * it can be swapped in production with zero changes to callers.
 *
 * Interface contract (mirrors future DB adapter):
 *   save(attestation)           → attestation
 *   findById(id)                → attestation | null
 *   findByStatus(status)        → attestation[]
 *   findByDevice(deviceId)      → attestation[]
 *   all()                       → attestation[]
 *   count()                     → number
 *   exportJSON()                → string
 *   importJSON(jsonString)      → void
 *   clear()                     → void
 */
class InMemoryAttestationStore {
  constructor() {
    /** @type {Map<string, object>} */
    this._store = new Map();
  }

  /**
   * Persist an attestation object.
   * @param {object} attestation - Must contain an `id` field.
   * @returns {object} The saved attestation (same reference).
   */
  save(attestation) {
    if (!attestation || !attestation.id) {
      throw new Error('Attestation must have an id field');
    }
    this._store.set(attestation.id, attestation);
    return attestation;
  }

  /**
   * Find a single attestation by its id.
   * @param {string} id
   * @returns {object|null}
   */
  findById(id) {
    return this._store.get(id) ?? null;
  }

  /**
   * Return all attestations matching a verification status.
   * @param {string} status  e.g. 'APPROVED' | 'FLAGGED' | 'REJECTED'
   * @returns {object[]}
   */
  findByStatus(status) {
    return [...this._store.values()].filter(a => a.status === status);
  }

  /**
   * Return all attestations for a specific device.
   * @param {string} deviceId
   * @returns {object[]}
   */
  findByDevice(deviceId) {
    return [...this._store.values()].filter(a => a.deviceId === deviceId);
  }

  /**
   * Return a shallow copy of all stored attestations.
   * Callers cannot mutate the internal store via this array.
   * @returns {object[]}
   */
  all() {
    return [...this._store.values()];
  }

  /** @returns {number} Total number of stored attestations. */
  count() {
    return this._store.size;
  }

  /**
   * Serialize the store to a JSON string (for file-based backup).
   * @returns {string}
   */
  exportJSON() {
    return JSON.stringify([...this._store.values()], null, 2);
  }

  /**
   * Hydrate the store from a JSON string produced by exportJSON().
   * Merges into existing data (use clear() first for a full replace).
   * @param {string} jsonString
   */
  importJSON(jsonString) {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      throw new Error('importJSON expects a JSON array of attestation objects');
    }
    parsed.forEach(a => this.save(a));
  }

  /** Wipe all stored data. */
  clear() {
    this._store.clear();
  }
}

module.exports = { InMemoryAttestationStore };
