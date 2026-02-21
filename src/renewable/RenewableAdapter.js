'use strict';

/**
 * Renewable Energy Source Adapter
 * ════════════════════════════════════════════════════════════════
 * Version: 1.4.0 - Complete validation for solar, wind, biomass
 * Adapts MRV engine for multiple renewable energy sources
 */

class RenewableAdapter {
  constructor(sourceType) {
    this.sourceType = sourceType; // 'solar', 'wind', 'biomass', 'hydropower'
  }

  /**
   * Normalize telemetry to standard format
   */
  normalizeTelemetry(rawTelemetry) {
    switch (this.sourceType) {
      case 'solar':
        return this._normalizeSolar(rawTelemetry);
      case 'wind':
        return this._normalizeWind(rawTelemetry);
      case 'biomass':
        return this._normalizeBiomass(rawTelemetry);
      case 'hydropower':
      default:
        return rawTelemetry; // Already in standard format
    }
  }

  /**
   * Validate reading based on source type
   * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
   */
  validate(rawTelemetry) {
    switch (this.sourceType) {
      case 'solar':
        return this.validateSolar(rawTelemetry);
      case 'wind':
        return this.validateWind(rawTelemetry);
      case 'biomass':
        return this.validateBiomass(rawTelemetry);
      case 'hydropower':
        return { valid: true, errors: [], warnings: [] }; // Use standard MRV
      default:
        return {
          valid: false,
          errors: [`Unknown source type: ${this.sourceType}`],
          warnings: []
        };
    }
  }

  // ════════════════════════════════════════════════════════════════
  // SOLAR VALIDATION
  // ════════════════════════════════════════════════════════════════

  validateSolar(raw) {
    const errors = [];
    const warnings = [];

    const irradiance = raw.irradiance || 0;
    const panelArea = raw.panelArea || 0;
    const generatedKwh = raw.generatedKwh || 0;
    const panelTemp = raw.panelTemperature_c || 25;
    const efficiency = raw.efficiency || 0;
    const timestamp = new Date(raw.timestamp || Date.now());
    const hour = timestamp.getHours();

    // 1. Irradiance validation (200-1000 W/m² typical, up to 1200 at high altitude)
    if (irradiance < 0 || irradiance > 1200) {
      errors.push(`Invalid irradiance: ${irradiance} W/m² (expected 0-1200)`);
    }
    if (irradiance > 1000) {
      warnings.push(`Very high irradiance: ${irradiance} W/m² (verify sensor calibration)`);
    }

    // 2. Time-of-day validation (no generation at night)
    if ((hour < 6 || hour > 19) && irradiance > 100) {
      errors.push(`Suspicious irradiance at night (hour ${hour}): ${irradiance} W/m²`);
    }
    if ((hour >= 6 && hour <= 19) && irradiance < 50 && generatedKwh > 0) {
      warnings.push(`Low irradiance during day but generating power`);
    }

    // 3. Panel efficiency validation (typical: 15-22%)
    const theoreticalMax = (irradiance * panelArea * 0.22) / 1000; // Best case 22%
    const actualEfficiency = theoreticalMax > 0 ? (generatedKwh / theoreticalMax) : 0;

    if (actualEfficiency > 1.1) {
      errors.push(`Impossible efficiency: ${(actualEfficiency * 100).toFixed(1)}% (>110% of theoretical)`);
    }
    if (actualEfficiency > 0.25) {
      warnings.push(`Very high efficiency: ${(actualEfficiency * 100).toFixed(1)}% (typical max 22%)`);
    }
    if (actualEfficiency < 0.12 && irradiance > 500) {
      warnings.push(`Low efficiency: ${(actualEfficiency * 100).toFixed(1)}% (typical 15-22%)`);
    }

    // 4. Panel temperature validation (typically -20°C to +80°C)
    if (panelTemp < -20 || panelTemp > 85) {
      errors.push(`Invalid panel temperature: ${panelTemp}°C (expected -20 to 85)`);
    }

    // 5. Temperature coefficient check (efficiency drops ~0.4% per °C above 25°C)
    if (panelTemp > 25) {
      const tempLoss = (panelTemp - 25) * 0.004;
      const expectedEfficiency = efficiency * (1 - tempLoss);
      if (actualEfficiency > expectedEfficiency * 1.2) {
        warnings.push(`Efficiency too high for panel temperature ${panelTemp}°C`);
      }
    }

    // 6. Power output validation
    if (generatedKwh < 0) {
      errors.push(`Negative power generation: ${generatedKwh} kWh`);
    }
    if (panelArea > 0 && generatedKwh / panelArea > 0.22) {
      errors.push(`Power density too high: ${(generatedKwh / panelArea).toFixed(2)} kW/m² (max ~0.22)`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metrics: {
        efficiency: actualEfficiency,
        theoreticalMax,
        powerDensity: panelArea > 0 ? generatedKwh / panelArea : 0
      }
    };
  }

  _normalizeSolar(raw) {
    return {
      deviceId: raw.deviceId,
      timestamp: raw.timestamp || new Date().toISOString(),
      readings: {
        flowRate_m3_per_s: 0,
        headHeight_m: 0,
        generatedKwh: raw.generatedKwh || 0,
        pH: 7.0,
        turbidity_ntu: 0,
        temperature_celsius: raw.panelTemperature_c || 25,
        efficiency: raw.efficiency || this._estimateSolarEfficiency(raw)
      },
      sourceSpecific: {
        irradiance_w_per_m2: raw.irradiance || 1000,
        panelArea_m2: raw.panelArea || 100,
        inverterEfficiency: raw.inverterEfficiency || 0.96,
        panelTemperature_c: raw.panelTemperature_c || 25
      }
    };
  }

  _estimateSolarEfficiency(raw) {
    const irradiance = raw.irradiance || 1000;
    const panelArea = raw.panelArea || 100;
    const generatedKwh = raw.generatedKwh || 0;
    const theoreticalMax = (irradiance * panelArea * 0.20) / 1000; // 20% typical
    return theoreticalMax > 0 ? generatedKwh / theoreticalMax : 0.18;
  }

  // ════════════════════════════════════════════════════════════════
  // WIND VALIDATION
  // ════════════════════════════════════════════════════════════════

  validateWind(raw) {
    const errors = [];
    const warnings = [];

    const windSpeed = raw.windSpeed || 0;
    const generatedKwh = raw.generatedKwh || 0;
    const rotorDiameter = raw.rotorDiameter || 90;
    const bladeRPM = raw.bladeRPM || 0;
    const hubHeight = raw.hubHeight_m || 80;

    // 1. Wind speed validation (cut-in: 3 m/s, cut-out: 25 m/s)
    if (windSpeed < 0 || windSpeed > 35) {
      errors.push(`Invalid wind speed: ${windSpeed} m/s (expected 0-35)`);
    }
    if (windSpeed > 25 && generatedKwh > 0) {
      warnings.push(`Generation above cut-out speed (${windSpeed} m/s > 25 m/s)`);
    }
    if (windSpeed < 3 && generatedKwh > 100) {
      errors.push(`Generation below cut-in speed (${windSpeed} m/s < 3 m/s)`);
    }

    // 2. Power curve validation (P ∝ v³)
    const airDensity = 1.225; // kg/m³ at sea level
    const sweptArea = Math.PI * Math.pow(rotorDiameter / 2, 2);
    const theoreticalPower = 0.5 * airDensity * sweptArea * Math.pow(windSpeed, 3) / 1000; // kW
    const betzLimit = theoreticalPower * 0.593; // Betz's law: max 59.3%
    const practicalMax = betzLimit * 0.85; // Typical turbine efficiency

    if (generatedKwh > practicalMax * 1.1) {
      errors.push(`Power exceeds Betz limit: ${generatedKwh.toFixed(1)} kW > ${practicalMax.toFixed(1)} kW`);
    }
    if (generatedKwh > betzLimit) {
      errors.push(`Power exceeds theoretical maximum (Betz limit): ${generatedKwh.toFixed(1)} kW`);
    }

    // 3. RPM validation (typical: 10-20 RPM for large turbines)
    const tipSpeed = (bladeRPM * Math.PI * rotorDiameter) / 60; // m/s
    const tipSpeedRatio = windSpeed > 0 ? tipSpeed / windSpeed : 0;

    if (bladeRPM < 0 || bladeRPM > 30) {
      errors.push(`Invalid blade RPM: ${bladeRPM} (expected 0-30)`);
    }
    if (tipSpeedRatio > 9) {
      warnings.push(`High tip speed ratio: ${tipSpeedRatio.toFixed(1)} (typical 6-8)`);
    }
    if (windSpeed > 5 && bladeRPM < 5) {
      warnings.push(`Low RPM for wind speed: ${bladeRPM} RPM at ${windSpeed} m/s`);
    }

    // 4. Air density correction for altitude
    if (hubHeight > 1000) {
      const altitudeFactor = Math.exp(-hubHeight / 8500); // Approximate
      const correctedDensity = airDensity * altitudeFactor;
      if (correctedDensity < 1.0) {
        warnings.push(`Low air density at altitude ${hubHeight}m (factor: ${altitudeFactor.toFixed(2)})`);
      }
    }

    // 5. Power output validation
    if (generatedKwh < 0) {
      errors.push(`Negative power generation: ${generatedKwh} kW`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metrics: {
        theoreticalPower,
        betzLimit,
        practicalMax,
        tipSpeedRatio,
        efficiency: practicalMax > 0 ? generatedKwh / practicalMax : 0
      }
    };
  }

  _normalizeWind(raw) {
    return {
      deviceId: raw.deviceId,
      timestamp: raw.timestamp || new Date().toISOString(),
      readings: {
        flowRate_m3_per_s: 0,
        headHeight_m: raw.hubHeight_m || 80,
        generatedKwh: raw.generatedKwh || 0,
        pH: 7.0,
        turbidity_ntu: 0,
        temperature_celsius: raw.ambientTemperature_c || 20,
        efficiency: raw.efficiency || this._estimateWindEfficiency(raw)
      },
      sourceSpecific: {
        windSpeed_m_per_s: raw.windSpeed || 10,
        windDirection_degrees: raw.windDirection || 180,
        bladeRPM: raw.bladeRPM || 15,
        rotorDiameter_m: raw.rotorDiameter || 90,
        hubHeight_m: raw.hubHeight_m || 80
      }
    };
  }

  _estimateWindEfficiency(raw) {
    const airDensity = 1.225;
    const windSpeed = raw.windSpeed || 10;
    const rotorDiameter = raw.rotorDiameter || 90;
    const area = Math.PI * Math.pow(rotorDiameter / 2, 2);
    const windPower = 0.5 * airDensity * area * Math.pow(windSpeed, 3) / 1000;
    const betzLimit = windPower * 0.593;
    return betzLimit > 0 ? (raw.generatedKwh || 0) / betzLimit : 0.35;
  }

  // ════════════════════════════════════════════════════════════════
  // BIOMASS VALIDATION
  // ════════════════════════════════════════════════════════════════

  validateBiomass(raw) {
    const errors = [];
    const warnings = [];

    const fuelFlowRate = raw.fuelFlowRate_kg_per_s || 0;
    const generatedKwh = raw.generatedKwh || 0;
    const combustionTemp = raw.combustionTemp_c || 800;
    const fuelMoisture = raw.fuelMoisture_percent || 10;
    const ashContent = raw.ashContent_percent || 2;
    const co2Emissions = raw.co2Emissions_g_per_kwh || 0;
    const noxEmissions = raw.noxEmissions_ppm || 0;

    // 1. Fuel consumption rate validation
    if (fuelFlowRate < 0 || fuelFlowRate > 10) {
      errors.push(`Invalid fuel flow rate: ${fuelFlowRate} kg/s (expected 0-10)`);
    }

    // 2. Combustion efficiency validation (typical: 70-90%)
    const fuelEnergyContent = 18000; // kJ/kg for wood pellets
    const theoreticalPower = (fuelFlowRate * fuelEnergyContent) / 3600; // kW
    const efficiency = theoreticalPower > 0 ? generatedKwh / theoreticalPower : 0;

    if (efficiency > 0.95) {
      errors.push(`Impossible efficiency: ${(efficiency * 100).toFixed(1)}% (max ~90%)`);
    }
    if (efficiency < 0.65 && fuelFlowRate > 0.1) {
      warnings.push(`Low combustion efficiency: ${(efficiency * 100).toFixed(1)}% (typical 70-90%)`);
    }

    // 3. Combustion temperature validation (typical: 700-1200°C)
    if (combustionTemp < 500 || combustionTemp > 1400) {
      errors.push(`Invalid combustion temperature: ${combustionTemp}°C (expected 500-1400)`);
    }
    if (combustionTemp < 700 && generatedKwh > 100) {
      warnings.push(`Low combustion temperature for power output: ${combustionTemp}°C`);
    }

    // 4. Fuel moisture content validation
    if (fuelMoisture < 0 || fuelMoisture > 50) {
      errors.push(`Invalid fuel moisture: ${fuelMoisture}% (expected 0-50)`);
    }
    if (fuelMoisture > 30) {
      warnings.push(`High fuel moisture content: ${fuelMoisture}% (reduces efficiency)`);
    }

    // 5. Ash content validation
    if (ashContent < 0 || ashContent > 15) {
      errors.push(`Invalid ash content: ${ashContent}% (expected 0-15)`);
    }
    if (ashContent > 5) {
      warnings.push(`High ash content: ${ashContent}% (may require more frequent cleaning)`);
    }

    // 6. Emissions validation
    if (co2Emissions > 1500) {
      warnings.push(`High CO2 emissions: ${co2Emissions} g/kWh (typical <1000 for biomass)`);
    }
    if (noxEmissions > 200) {
      warnings.push(`High NOx emissions: ${noxEmissions} ppm (typical <150)`);
    }

    // 7. Power output validation
    if (generatedKwh < 0) {
      errors.push(`Negative power generation: ${generatedKwh} kW`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metrics: {
        efficiency,
        theoreticalPower,
        fuelEnergyContent,
        effectiveEnergyContent: fuelEnergyContent * (1 - fuelMoisture / 100)
      }
    };
  }

  _normalizeBiomass(raw) {
    return {
      deviceId: raw.deviceId,
      timestamp: raw.timestamp || new Date().toISOString(),
      readings: {
        flowRate_m3_per_s: (raw.fuelFlowRate_kg_per_s || 0) / 1000,
        headHeight_m: 0,
        generatedKwh: raw.generatedKwh || 0,
        pH: 7.0,
        turbidity_ntu: 0,
        temperature_celsius: raw.combustionTemp_c || 800,
        efficiency: raw.efficiency || 0.75
      },
      sourceSpecific: {
        fuelType: raw.fuelType || 'wood_pellets',
        fuelFlowRate_kg_per_s: raw.fuelFlowRate_kg_per_s || 0,
        fuelMoisture_percent: raw.fuelMoisture_percent || 10,
        ashContent_percent: raw.ashContent_percent || 2,
        combustionTemp_c: raw.combustionTemp_c || 800,
        co2Emissions_g_per_kwh: raw.co2Emissions_g_per_kwh || 0,
        noxEmissions_ppm: raw.noxEmissions_ppm || 0
      }
    };
  }
}

module.exports = { RenewableAdapter };
