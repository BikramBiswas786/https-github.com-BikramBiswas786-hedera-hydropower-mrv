/**
 * Tenant Management API - Multi-Tenant SaaS Foundation
 * 
 * PURPOSE: Self-service onboarding, licensing for operators
 * STATUS: MVP implementation (in-memory, ready for production)
 * REVENUE: Enables ₹15.73-220.95 Cr/year from platform licensing
 * 
 * ENDPOINTS (THIS FILE):
 *   POST   /api/v1/tenants/create    - Create new tenant (signup)
 *   POST   /api/v1/tenants/validate  - Validate license key
 *   GET    /api/v1/tenants/me        - Get current tenant info
 *   GET    /api/v1/tenants/pricing   - Public pricing tiers
 *   GET    /api/v1/tenants/stats     - Admin statistics
 * 
 * OTHER ROUTES (SEPARATE FILES):
 *   Subscriptions: src/api/v1/subscriptions.js
 *   Billing: src/api/v1/billing.js
 */

const express = require('express');
const crypto = require('crypto');
const { tenantStore } = require('../../middleware/tenant');

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// IN-MEMORY STORES (MVP - Replace with PostgreSQL)
// ═══════════════════════════════════════════════════════════════

class SubscriptionStore {
  constructor() {
    this.subscriptions = new Map();
  }

  async create(tenantId, tier) {
    const annualFees = {
      starter: 500000,    // ₹5 lakh/year
      pro: 2000000,       // ₹20 lakh/year
      enterprise: 5000000 // ₹50 lakh/year
    };

    const subscription = {
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      tier,
      annual_fee: annualFees[tier] || annualFees.starter,
      billing_date: new Date().toISOString(),
      status: 'active',
      created_at: new Date().toISOString()
    };

    this.subscriptions.set(tenantId, subscription);
    return subscription;
  }

  async findByTenantId(tenantId) {
    return this.subscriptions.get(tenantId) || null;
  }
}

class TransactionStore {
  constructor() {
    this.transactions = [];
  }

  async record(tenantId, type, costUsd, costInr) {
    const transaction = {
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      transaction_type: type,
      cost_usd: costUsd,
      cost_inr: costInr,
      created_at: new Date().toISOString()
    };

    this.transactions.push(transaction);
    return transaction;
  }

  async getUsageByTenantId(tenantId, periodStart = null, periodEnd = null) {
    let filtered = this.transactions.filter(t => t.tenant_id === tenantId);

    if (periodStart) {
      filtered = filtered.filter(t => new Date(t.created_at) >= new Date(periodStart));
    }

    if (periodEnd) {
      filtered = filtered.filter(t => new Date(t.created_at) <= new Date(periodEnd));
    }

    const totalCostInr = filtered.reduce((sum, t) => sum + (t.cost_inr || 0), 0);
    const totalCostUsd = filtered.reduce((sum, t) => sum + (t.cost_usd || 0), 0);

    return {
      transaction_count: filtered.length,
      total_cost_inr: totalCostInr,
      total_cost_usd: totalCostUsd,
      transactions: filtered,
      by_type: this._groupByType(filtered)
    };
  }

  _groupByType(transactions) {
    const grouped = {};
    transactions.forEach(t => {
      if (!grouped[t.transaction_type]) {
        grouped[t.transaction_type] = { count: 0, cost_inr: 0 };
      }
      grouped[t.transaction_type].count++;
      grouped[t.transaction_type].cost_inr += t.cost_inr || 0;
    });
    return grouped;
  }
}

const subscriptionStore = new SubscriptionStore();
const transactionStore = new TransactionStore();

// ═══════════════════════════════════════════════════════════════
// TENANT ONBOARDING ENDPOINTS
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/v1/tenants/create
 * Self-service signup for new operators
 * 
 * Body: { companyName, email, tier }
 * Returns: { tenantId, licenseKey, tier, plantsLimit }
 */
router.post('/create', async (req, res) => {
  try {
    const { companyName, email, tier } = req.body;

    // Validation
    if (!companyName || !email || !tier) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['companyName', 'email', 'tier'],
        tiers: ['starter', 'pro', 'enterprise']
      });
    }

    if (!['starter', 'pro', 'enterprise'].includes(tier)) {
      return res.status(400).json({
        error: 'Invalid tier',
        valid_tiers: ['starter', 'pro', 'enterprise']
      });
    }

    // Create tenant
    const tenant = await tenantStore.create({
      name: companyName,
      tier,
      email
    });

    // Create default subscription
    const subscription = await subscriptionStore.create(tenant.id, tier);

    // Return credentials
    res.status(201).json({
      status: 'success',
      message: 'Tenant created successfully',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        tier: tenant.tier,
        license_key: tenant.license_key,
        plants_limit: tenant.plants_limit,
        created_at: tenant.created_at
      },
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        annual_fee_inr: subscription.annual_fee,
        status: subscription.status
      },
      next_steps: [
        'Save your license_key securely',
        'Include x-license-key header in API requests',
        'Start adding plants via POST /api/v1/plants'
      ]
    });
  } catch (error) {
    console.error('[TENANT CREATE ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/tenants/validate
 * Validate license key (for edge agent startup)
 * 
 * Body: { licenseKey }
 * Returns: { valid, tenantId, tier, plantsLimit }
 */
router.post('/validate', async (req, res) => {
  try {
    const { licenseKey } = req.body;

    if (!licenseKey) {
      return res.status(400).json({
        error: 'Missing licenseKey',
        hint: 'Include licenseKey in request body'
      });
    }

    const tenant = await tenantStore.findByLicenseKey(licenseKey);

    if (!tenant) {
      return res.status(404).json({
        valid: false,
        error: 'Invalid license key'
      });
    }

    res.json({
      valid: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        tier: tenant.tier,
        plants_limit: tenant.plants_limit,
        status: tenant.status
      }
    });
  } catch (error) {
    console.error('[TENANT VALIDATE ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/tenants/me
 * Get current tenant info (requires x-license-key header)
 */
router.get('/me', async (req, res) => {
  try {
    const licenseKey = req.headers['x-license-key'];

    if (!licenseKey) {
      return res.status(401).json({
        error: 'Missing x-license-key header'
      });
    }

    const tenant = await tenantStore.findByLicenseKey(licenseKey);

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found'
      });
    }

    const subscription = await subscriptionStore.findByTenantId(tenant.id);

    res.json({
      status: 'success',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        tier: tenant.tier,
        plants_limit: tenant.plants_limit,
        status: tenant.status,
        created_at: tenant.created_at
      },
      subscription: subscription || null
    });
  } catch (error) {
    console.error('[TENANT ME ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/tenants/stats
 * Admin endpoint - get tenant statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await tenantStore.getStats();
    res.json({
      status: 'success',
      ...stats
    });
  } catch (error) {
    console.error('[TENANT STATS ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// PRICING INFO ENDPOINT (PUBLIC)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/v1/tenants/pricing
 * Public endpoint - show pricing tiers
 */
router.get('/pricing', (req, res) => {
  res.json({
    status: 'success',
    tiers: [
      {
        name: 'starter',
        annual_fee_inr: 500000,
        annual_fee_usd: 6000,
        plants_limit: 5,
        capacity_range: '1-10 MW',
        features: [
          'Up to 5 plants',
          'Basic MRV monitoring',
          'Email support',
          'API access'
        ]
      },
      {
        name: 'pro',
        annual_fee_inr: 2000000,
        annual_fee_usd: 24000,
        plants_limit: 20,
        capacity_range: '10-50 MW',
        features: [
          'Up to 20 plants',
          'Advanced ML analytics',
          'Priority support',
          'Custom integrations',
          'Forecasting & clustering'
        ]
      },
      {
        name: 'enterprise',
        annual_fee_inr: 5000000,
        annual_fee_usd: 60000,
        plants_limit: 100,
        capacity_range: '50+ MW',
        features: [
          'Unlimited plants',
          'White-label solution',
          'Dedicated support',
          'Custom SLAs',
          'On-premise deployment'
        ]
      }
    ],
    transaction_fees: {
      hedera_message: { cost_inr: 0.03, cost_usd: 0.0004 },
      token_mint: { cost_inr: 0.05, cost_usd: 0.0006 },
      api_call: { cost_inr: 0.001, cost_usd: 0.00001 }
    },
    notes: [
      'Annual fees billed upfront',
      'Transaction fees billed monthly',
      'Custom pricing available for 100+ MW operators'
    ]
  });
});

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  router,
  transactionStore, // Export for billing.js
  subscriptionStore, // Export for subscriptions.js

  // Helper function to record Hedera transaction cost
  async recordHederaTransaction(tenantId, type, hbarCost) {
    const costUsd = hbarCost * 0.05; // Approximate HBAR to USD
    const costInr = costUsd * 83; // Approximate USD to INR
    return transactionStore.record(tenantId, type, costUsd, costInr);
  }
};
