const express = require('express');
const router = express.Router();

const telemetryRouter = require('./telemetry');
const organizationsRouter = require('./organizations');
const plantsRouter = require('./plants');
const analyticsRouter = require('./analytics');
const reportsRouter = require('./reports');

router.use('/telemetry', telemetryRouter);
router.use('/organizations', organizationsRouter);
router.use('/plants', plantsRouter);
router.use('/analytics', analyticsRouter);
router.use('/reports', reportsRouter);

module.exports = router;
