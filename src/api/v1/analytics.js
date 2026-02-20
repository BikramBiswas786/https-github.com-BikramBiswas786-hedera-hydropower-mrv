const express = require('express');
const router = express.Router();
const { authenticateAPI } = require('../../middleware/auth');

router.get('/summary', authenticateAPI, async (req, res) => {
    try {
        const { plant_id, timeframe } = req.query;
        res.status(200).json({
            plant_id: plant_id || 'plant_1',
            metrics: {
                total_power_generated_mwh: 125.4,
                carbon_offset_tco2e: 102.8,
                uptime_percentage: 98.5
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
