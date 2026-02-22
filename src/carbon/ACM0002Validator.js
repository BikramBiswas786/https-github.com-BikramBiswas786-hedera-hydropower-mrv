// src/carbon/ACM0002Validator.js
// ACM0002 Methodology Validator

class ACM0002Validator {
  constructor() {
    this.methodology = 'ACM0002 v18.0';
  }

  checkProjectEligibility(project) {
    const { projectType, capacity_mw, gridConnected, commissioningDate } = project;

    if (projectType !== 'hydropower') {
      return { isEligible: false, reason: 'Not a hydropower project' };
    }

    if (!gridConnected) {
      return { isEligible: false, reason: 'Not grid-connected' };
    }

    return {
      isEligible: true,
      category: 'Type I: Renewable electricity generation',
      methodology: this.methodology,
    };
  }

  checkGridConnection(params) {
    const { gridConnected, interconnectionAgreement, meterLocation } = params;

    if (!gridConnected) {
      return { compliant: false, reason: 'Not grid-connected' };
    }

    if (!interconnectionAgreement) {
      return { compliant: false, reason: 'No interconnection agreement' };
    }

    if (meterLocation !== 'grid_injection_point') {
      return { compliant: false, reason: 'Meter not at grid injection point' };
    }

    return { compliant: true };
  }

  calculateBaselineEmissions(params) {
    const { generation_MWh, gridEmissionFactor } = params;
    const BE_y = generation_MWh * gridEmissionFactor;

    return {
      BE_y: parseFloat(BE_y.toFixed(6)),
      formula: 'BE_y = EG_y × EF_grid',
      methodology: this.methodology,
    };
  }

  calculateProjectEmissions(params) {
    const { projectType, fossilFuelUse = 0, reservoirArea_km2 = 0 } = params;

    if (projectType === 'hydropower' && reservoirArea_km2 === 0) {
      return {
        PE_y: 0,
        reason: 'Run-of-river hydropower with no reservoir',
        methodology: this.methodology,
      };
    }

    return {
      PE_y: fossilFuelUse,
      methodology: this.methodology,
    };
  }

  calculateLeakageEmissions(params) {
    const { projectType } = params;

    if (projectType === 'hydropower') {
      return {
        LE_y: 0,
        reason: 'No leakage for grid-connected renewables',
        methodology: this.methodology,
      };
    }

    return { LE_y: 0, methodology: this.methodology };
  }

  calculateEmissionReductions(params) {
    const { baselineEmissions, projectEmissions = 0, leakageEmissions = 0 } = params;
    const ER_y = baselineEmissions - projectEmissions - leakageEmissions;

    return {
      ER_y: parseFloat(ER_y.toFixed(6)),
      formula: 'ER_y = BE_y - PE_y - LE_y',
      methodology: this.methodology,
      certificationReady: ER_y > 0,
    };
  }

  generateComplianceReport(data) {
    const {
      projectInfo,
      generation_MWh,
      gridEmissionFactor,
      monitoringPeriod,
    } = data;

    const eligibility = this.checkProjectEligibility(projectInfo);
    const baseline = this.calculateBaselineEmissions({
      generation_MWh,
      gridEmissionFactor,
    });
    const projectEmissions = this.calculateProjectEmissions(projectInfo);
    const leakage = this.calculateLeakageEmissions(projectInfo);
    const emissionReductions = this.calculateEmissionReductions({
      baselineEmissions: baseline.BE_y,
      projectEmissions: projectEmissions.PE_y,
      leakageEmissions: leakage.LE_y,
    });

    return {
      methodology: this.methodology,
      monitoringPeriod,
      eligibility,
      baseline,
      projectEmissions,
      leakage,
      emissionReductions,
      verified: eligibility.isEligible && emissionReductions.ER_y > 0,
      certificationReady: emissionReductions.certificationReady,
    };
  }

  generateMonitoringReport(data) {
    const {
      projectId,
      monitoringPeriod,
      totalGeneration_MWh,
      gridEmissionFactor,
      projectInfo = {
        projectType: 'hydropower',
        capacity_mw: 50,
        gridConnected: true,
        reservoirArea_km2: 0
      }
    } = data;

    const baseline = this.calculateBaselineEmissions({
      generation_MWh: totalGeneration_MWh,
      gridEmissionFactor,
    });

    const projectEmissions = this.calculateProjectEmissions(projectInfo);
    const leakage = this.calculateLeakageEmissions(projectInfo);
    
    const emissionReductions = this.calculateEmissionReductions({
      baselineEmissions: baseline.BE_y,
      projectEmissions: projectEmissions.PE_y,
      leakageEmissions: leakage.LE_y,
    });

    return {
      methodology: this.methodology,
      projectId,
      monitoringPeriod,
      totalGeneration_MWh,
      gridEmissionFactor,
      baseline,
      projectEmissions,
      leakage,
      emissionReductions,
      verified: emissionReductions.ER_y > 0,
      certificationReady: emissionReductions.certificationReady,
    };
  }
}

module.exports = ACM0002Validator;
