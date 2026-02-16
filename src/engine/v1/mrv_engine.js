const { Client, TokenMintTransaction, PrivateKey, Hbar } = require("@hashgraph/sdk");
const { validatePhysics } = require("./index");
const verifyEvidence = require("./verify-evidence");
const logger = require("./logger");

/**
 * Hydropower MRV Engine V1
 * Core logic for validating telemetry and publishing to Hedera
 */
class EngineV1 {
  constructor() {
    this.operatorId = process.env.OPERATOR_ID;
    this.operatorKey = process.env.OPERATOR_KEY;
    this.tokenId = process.env.TOKEN_ID || "0.0.7943984";
  }

  /**
   * Verify telemetry and publish REC to Hedera
   * @param {Object} telemetry - Telemetry data object
   * @returns {Object} - Result with attestation and transaction ID
   */
  async verifyAndPublish(telemetry) {
    logger.info(`Processing telemetry for device: \${telemetry.deviceId}`);

    // 1. Physics Validation (Internal V1)
    const physicsResult = validatePhysics(telemetry.readings[0]);
    if (!physicsResult.isValid) {
      throw new Error(`Physics validation failed: \${physicsResult.reason}`);
    }
    logger.info("✓ Physics validation passed");

    // 2. Evidence Verification
    await verifyEvidence.verify(telemetry);
    logger.info("✓ Evidence verified");

    // 3. Hedera Token Minting (REC Generation)
    const kwh = telemetry.readings[0].kwh;
    const amountToMint = Math.floor(kwh / 100);

    if (amountToMint <= 0) {
      return {
        attestation: {
          verificationStatus: "VALIDATED_LOW_OUTPUT",
          trustScore: 0.8,
        },
        transactionId: "N/A"
      };
    }

    try {
      const client = Client.forTestnet();
      client.setOperator(this.operatorId, PrivateKey.fromString(this.operatorKey));

      const mintTx = await new TokenMintTransaction()
        .setTokenId(this.tokenId)
        .setAmount(amountToMint)
        .execute(client);

      const receipt = await mintTx.getReceipt(client);
      
      return {
        attestation: {
          verificationStatus: "VERIFIED_AND_MINTED",
          trustScore: 0.98,
        },
        transactionId: mintTx.transactionId.toString()
      };
    } catch (error) {
      logger.error(`Hedera transaction failed: \${error.message}`);
      throw error;
    }
  }
}

module.exports = { EngineV1 };
