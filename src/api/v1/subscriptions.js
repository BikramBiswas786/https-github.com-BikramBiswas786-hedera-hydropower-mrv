/**
 * Subscription Management API
 * Tier subscriptions and plan management
 */

const express = require('express');
const { tenantStore } = require('../../middleware/tenant');
const { subscriptionStore } = require('./tenants');

const router = express.Router();

/**
 * POST /api/v1/subscriptions/subscribe
 * Subscribe to or change tier
 * 
 * Body: { tier }
 */
router.post('/subscribe', async (req, res) => {
  try {
    const licenseKey = req.headers['x-license-key'];
    const { tier } = req.body;

    if (!licenseKey) {
      return res.status(401).json({ error: 'Missing x-license-key header' });
    }

    if (!tier || !['starter', 'pro', 'enterprise'].includes(tier)) {
      return res.status(400).json({
        error: 'Invalid tier',
        valid_tiers: ['starter', 'pro', 'enterprise']
      });
    }

    const tenant = await tenantStore.findByLicenseKey(licenseKey);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const subscription = await subscriptionStore.create(tenant.id, tier);

    res.json({
      status: 'success',
      message: 'Subscription created successfully',
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        annual_fee_inr: subscription.annual_fee,
        billing_date: subscription.billing_date,
        status: subscription.status
      }
    });
  } catch (error) {
    console.error('[SUBSCRIPTION ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/subscriptions/me
 * Get active subscription
 */
router.get('/me', async (req, res) => {
  try {
    const licenseKey = req.headers['x-license-key'];

    if (!licenseKey) {
      return res.status(401).json({ error: 'Missing x-license-key header' });
    }

    const tenant = await tenantStore.findByLicenseKey(licenseKey);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const subscription = await subscriptionStore.findByTenantId(tenant.id);

    res.json({
      status: 'success',
      subscription: subscription || null
    });
  } catch (error) {
    console.error('[SUBSCRIPTION GET ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = { router };
