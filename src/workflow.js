/**
 * Workflow Module
 * Orchestrates MRV workflow steps
 */
module.exports = class Workflow {
  constructor(config) {
    this.config = config || {};
    this.steps = [];
  }
  addStep(name, fn) {
    this.steps.push({ name, fn });
    return this;
  }
  async execute(data) {
    const results = [];
    for (const step of this.steps) {
      try {
        const result = await step.fn(data);
        results.push({ step: step.name, success: true, result });
      } catch (error) {
        results.push({ step: step.name, success: false, error: error.message });
        throw error;
      }
    }
    return { success: true, data, results };
  }
  reset() {
    this.steps = [];
  }
};
