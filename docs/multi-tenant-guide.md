# Hedera Hydropower MRV – Multi-Tenant, Onboarding, Billing (Testnet Guide)

## 0. Assumptions

- **Backend:** Node.js (Express/Fastify style), TypeScript or JS
- **DB:** PostgreSQL (or compatible; adapt syntax if needed)
- **Current MRV APIs:** Already exist (plants, readings, HCS submit, etc.)
- **Environment:** Hedera testnet

---

## 1. Multi-Tenant Architecture (Week 5–8)

### 1.1 DB Changes

Add `tenants` table and link your existing entities:

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tier VARCHAR(50) NOT NULL,         -- starter, pro, enterprise
  license_key VARCHAR(255) UNIQUE,
  plants_limit INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

Link to your existing domain tables:

```sql
ALTER TABLE plants
  ADD COLUMN tenant_id UUID REFERENCES tenants(id);

ALTER TABLE readings
  ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Any other per-operator data table gets tenant_id as well
```

**Rule:** No customer data row without `tenant_id`.

### 1.2 Tenant Resolution Middleware

Create `src/middleware/tenant.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import db from '../db'; // your DB helper

export interface TenantRequest extends Request {
  tenantId?: string;
}

export async function tenantMiddleware(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const licenseKey = req.headers['x-license-key'] as string | undefined;

    if (!licenseKey) {
      return res.status(401).json({ error: 'Missing x-license-key header' });
    }

    const tenant = await db('tenants').where({ license_key: licenseKey }).first();
    if (!tenant) {
      return res.status(401).json({ error: 'Invalid license key' });
    }

    req.tenantId = tenant.id;
    return next();
  } catch (e) {
    return res.status(500).json({ error: 'Tenant resolution failed' });
  }
}
```

Wire it in your API setup:

```typescript
import { tenantMiddleware } from './middleware/tenant';

app.use('/api', tenantMiddleware); // or per-route where needed
```

### 1.3 Tenant-Scoped Handlers

Example: plants API:

```typescript
// POST /api/plants
app.post('/api/plants', async (req: any, res) => {
  const { tenantId } = req;
  const { name, capacityMw, location } = req.body;

  if (!tenantId) return res.status(401).json({ error: 'No tenant' });

  const plantId = crypto.randomUUID();
  await db('plants').insert({
    id: plantId,
    tenant_id: tenantId,
    name,
    capacity_mw: capacityMw,
    location
  });

  res.json({ plantId });
});

// GET /api/plants
app.get('/api/plants', async (req: any, res) => {
  const { tenantId } = req;
  const plants = await db('plants').where({ tenant_id: tenantId });
  res.json({ plants });
});
```

Apply the same pattern to:
- readings
- MRV calculations
- HCS submit

**Every query must filter by `tenant_id`.**

---

## 2. Self-Service Onboarding Portal (Week 9–12)

### 2.1 Backend Endpoints

#### 2.1.1 Create Tenant

```typescript
// POST /api/tenants/create
// body: { companyName, email, tier }
app.post('/api/tenants/create', async (req, res) => {
  const { companyName, email, tier } = req.body;

  if (!companyName || !email || !tier) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const tenantId = crypto.randomUUID();
  const licenseKey = crypto.randomUUID();

  const plantsLimit =
    tier === 'starter' ? 5 :
    tier === 'pro' ? 20 :
    100;

  await db('tenants').insert({
    id: tenantId,
    name: companyName,
    tier,
    license_key: licenseKey,
    plants_limit: plantsLimit
  });

  // later: send email; for now respond with keys
  res.json({ tenantId, licenseKey, tier, plantsLimit });
});
```

#### 2.1.2 License Validation

```typescript
// POST /api/licenses/validate
app.post('/api/licenses/validate', async (req, res) => {
  const { licenseKey } = req.body;
  if (!licenseKey) return res.status(400).json({ error: 'Missing licenseKey' });

  const tenant = await db('tenants').where({ license_key: licenseKey }).first();
  if (!tenant) return res.status(404).json({ valid: false });

  res.json({
    valid: true,
    tenantId: tenant.id,
    tier: tenant.tier,
    plantsLimit: tenant.plants_limit
  });
});
```

This is what your edge agent can call on startup.

### 2.2 Simple Frontend Flow

You can implement this as a minimal React app or server-rendered:

#### Signup Page
- Form: `companyName`, `email`, `password`, `tier` (radio buttons)
- On submit, call `POST /api/tenants/create`

#### Success Page
- Show `tenantId` and `licenseKey`
- Show instructions for edge agent env:
  ```bash
  MRV_LICENSE_KEY=<licenseKey>
  ```

#### Plants Page
- After signup, call `/api/plants` using `x-license-key`
- Allow user to add first plant via `POST /api/plants`

This is enough for testnet demos.

---

## 3. Basic Licensing / Billing (Week 13–16)

### 3.1 DB Tables

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  tier VARCHAR(50) NOT NULL,
  annual_fee DECIMAL(12,2) NOT NULL,
  billing_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL, -- active, cancelled
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  transaction_type VARCHAR(50), -- hedera_message, api_call, etc
  cost_usd DECIMAL(10,4),
  cost_inr DECIMAL(12,2),
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE transaction_bills (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  transaction_count INT NOT NULL,
  total_cost_inr DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) NOT NULL, -- draft, sent, paid
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 3.2 Subscription API

```typescript
// POST /api/subscriptions/subscribe
// body: { tier }
app.post('/api/subscriptions/subscribe', async (req: any, res) => {
  const { tenantId } = req;
  const { tier } = req.body;

  if (!tenantId || !tier) return res.status(400).json({ error: 'Missing tenant/tier' });

  const annualFee =
    tier === 'starter' ? 500000 :   // ₹5L
    tier === 'pro' ? 2000000 :      // ₹20L
    5000000;                        // ₹50L

  const subId = crypto.randomUUID();

  await db('subscriptions').insert({
    id: subId,
    tenant_id: tenantId,
    tier,
    annual_fee: annualFee,
    billing_date: new Date(),
    status: 'active'
  });

  res.json({ subscriptionId: subId, tier, annualFee });
});

// GET /api/subscriptions/me
app.get('/api/subscriptions/me', async (req: any, res) => {
  const { tenantId } = req;
  const sub = await db('subscriptions')
    .where({ tenant_id: tenantId, status: 'active' })
    .orderBy('created_at', 'desc')
    .first();
  res.json({ subscription: sub || null });
});
```

### 3.3 Transaction Metering (Hedera Testnet)

Wrap your HCS submit logic to log per-tenant costs:

```typescript
async function submitToHcsForTenant(tenantId: string, message: string) {
  // existing Hedera client (testnet)
  const tx = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(message)
    .freezeWith(client);

  const resp = await tx.execute(client);

  // Approx real network fee in INR (for demo; tune later)
  const costInr = 0.03; // e.g., ₹0.03 per message

  await db('transactions').insert({
    id: crypto.randomUUID(),
    tenant_id: tenantId,
    transaction_type: 'hedera_message',
    cost_usd: 0.0001,
    cost_inr: costInr,
    created_at: new Date()
  });

  return resp;
}
```

Use `tenantId` from middleware, so each tenant sees their own cost.

### 3.4 Bill Generation Endpoint

```typescript
// POST /api/billing/transaction-bills/generate
// body: { periodStart, periodEnd }
app.post('/api/billing/transaction-bills/generate', async (req: any, res) => {
  const { tenantId } = req;
  const { periodStart, periodEnd } = req.body;

  const rows = await db('transactions')
    .where('tenant_id', tenantId)
    .andWhere('created_at', '>=', periodStart)
    .andWhere('created_at', '<=', periodEnd);

  const transactionCount = rows.length;
  const totalCostInr = rows.reduce((sum, r) => sum + Number(r.cost_inr), 0);

  const billId = crypto.randomUUID();

  await db('transaction_bills').insert({
    id: billId,
    tenant_id: tenantId,
    period_start: periodStart,
    period_end: periodEnd,
    transaction_count: transactionCount,
    total_cost_inr: totalCostInr,
    status: 'draft'
  });

  res.json({ billId, transactionCount, totalCostInr, status: 'draft' });
});

// GET /api/billing/transaction-bills
app.get('/api/billing/transaction-bills', async (req: any, res) => {
  const { tenantId } = req;
  const bills = await db('transaction_bills')
    .where({ tenant_id: tenantId })
    .orderBy('created_at', 'desc');
  res.json({ bills });
});
```

---

## 4. Test Plan (All on Testnet)

1. Create two tenants via `POST /api/tenants/create`
2. For each tenant:
   - Call `POST /api/subscriptions/subscribe`
   - Create 1–2 plants via `/api/plants` with `x-license-key`
   - Generate some readings; ensure HCS submit uses `submitToHcsForTenant(tenantId, ...)`
   - Run `POST /api/billing/transaction-bills/generate` for the last 24h
3. Confirm:
   - Bills only include that tenant's transactions
   - Plants and readings are invisible across tenants

This gives you a working, testnet-ready multi-tenant MRV SaaS skeleton aligned with the revenue strategy doc.

---

## Integration with Existing Codebase

### Current Project Structure
Based on your existing Hedera Hydropower MRV project:

```
src/
├── api/
│   ├── server.js                  # Main API server
│   └── v1/
│       ├── forecast.js            # Forecasting endpoints
│       ├── anomalies.js           # Clustering endpoints
│       ├── feedback.js            # Active learning
│       └── multi-plant.js         # Multi-plant management
├── blockchain/
│   └── hedera-client.js           # Hedera HCS/HTS integration
├── engine/
│   └── v1/
│       └── engine-v1.js           # MRV calculation engine
└── workflow.js                    # Main workflow orchestration
```

### Implementation Steps

#### Step 1: Add Middleware (Week 1)
Create `src/middleware/tenant.js`:
```javascript
// Use your existing DB connection from src/db.js or similar
```

#### Step 2: Update Server (Week 2)
Modify `src/api/server.js`:
```javascript
const { tenantMiddleware } = require('../middleware/tenant');

// Apply to all /api routes AFTER they're authenticated
app.use('/api/v1', tenantMiddleware);
```

#### Step 3: Update Multi-Plant API (Week 3)
Modify `src/api/v1/multi-plant.js` to use `req.tenantId`:
- Add `tenant_id` filter to all plant queries
- Ensure plant creation includes `tenant_id`

#### Step 4: Update Workflow (Week 4)
Modify `src/workflow.js` and `src/engine/v1/engine-v1.js`:
- Pass `tenantId` through the workflow
- Log transactions with `tenant_id` for billing

---

## Revenue Streams Overview

Based on your revenue integration strategy [file:88], this multi-tenant system enables 7 revenue streams:

1. **Carbon Credit Monetization** (73% of revenue) - ₹426 Cr/year [file:88]
2. **Carbon Credit Premium** (5% of revenue) - ₹10-42 Cr/year [file:88]
3. **Platform Licensing** (6.5% of revenue) - ₹5-90 Cr/year [file:88]
4. **Implementation Services** (5.3% of revenue) - ₹6-60 Cr/year [file:88]
5. **Transaction Fees** (5.7% of revenue) - ₹4.73-70.95 Cr/year [file:88]
6. **Analytics Add-Ons** (0.5% of revenue) - ₹0.5-4.23 Cr/year [file:88]
7. **Carbon Credit Arbitrage** (4% of revenue) - ₹7.5-37.5 Cr/year [file:88]

### Pricing Tiers

**Starter:** ₹5 lakh/year (1-10 MW, 5 plants) [file:88]  
**Professional:** ₹20 lakh/year (10-50 MW, 20 plants) [file:88]  
**Enterprise:** ₹50 lakh/year (50+ MW, 100 plants) [file:88]

---

## Next Steps

1. **Review this guide** with your team
2. **Set up PostgreSQL** with the schema above
3. **Implement Phase 1** (Multi-tenant architecture)
4. **Test with 2 tenants** on Hedera testnet
5. **Deploy onboarding portal** for self-service signup
6. **Enable billing endpoints** for transaction metering

**Questions?** Share your actual repo structure and I can provide exact file-level implementation guidance.

---

**Estimated Timeline:**
- Week 1-4: Multi-tenant DB + middleware
- Week 5-8: Tenant-scoped APIs
- Week 9-12: Onboarding portal
- Week 13-16: Billing system

**Result:** Production-ready multi-tenant SaaS on Hedera testnet, ready for external customers.
