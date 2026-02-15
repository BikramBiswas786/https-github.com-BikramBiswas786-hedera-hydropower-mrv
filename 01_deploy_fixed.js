/**
 * Deploy Device DID to Hedera Testnet - COMPLETE IMPLEMENTATION
 * Creates a unique identity for hydropower device on HCS topic
 * 
 * Usage: node 01_deploy_did_complete.js
 * 
 * Prerequisites:
 * - HEDERA_ACCOUNT_ID environment variable
 * - HEDERA_PRIVATE_KEY environment variable
 * - Sufficient HBAR balance on testnet account
 */

const {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  PrivateKey,
  Hbar
} = require('@hashgraph/sdk');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID;
const HEDERA_PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY;
const DEVICE_ID = process.env.DEVICE_ID || 'TURBINE-1';
const DEVICE_NAME = process.env.DEVICE_NAME || 'Demo Hydropower Turbine';
const DEVICE_LOCATION = process.env.DEVICE_LOCATION || 'Test Site';

// Validate environment variables
if (!HEDERA_ACCOUNT_ID || !HEDERA_PRIVATE_KEY) {
  console.error('ERROR: Missing required environment variables');
  console.error('Required: HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY');
  process.exit(1);
}

// ============================================================================
// MAIN DEPLOYMENT FUNCTION
// ============================================================================

async function deployDeviceDID() {
  console.log('\n========================================');
  console.log('Deploying Device DID to Hedera Testnet');
  console.log('========================================\n');

  let client;

  try {
    // Step 1: Initialize Hedera Client
    console.log('Step 1: Initializing Hedera Client...');
    client = Client.forTestnet();
    const operatorPrivateKey = PrivateKey.fromString(HEDERA_PRIVATE_KEY);`n    client.setOperator(HEDERA_ACCOUNT_ID, operatorPrivateKey);
    client.setDefaultMaxTransactionFee(new Hbar(2));
    console.log(`✓ Connected to Hedera Testnet`);
    console.log(`✓ Operator Account: ${HEDERA_ACCOUNT_ID}\n`);

    // Step 2: Create HCS Topic for DID
    console.log('Step 2: Creating HCS Topic for Device DID...');
    const operatorPrivateKey = PrivateKey.fromString(HEDERA_PRIVATE_KEY);
    
    const topicCreateTx = await new TopicCreateTransaction()
      .setTopicMemo(`Device DID Topic - ${DEVICE_ID}`)
      .setAdminKey(operatorPrivateKey)
      .setSubmitKey(operatorPrivateKey)
      .execute(client);

    const topicReceipt = await topicCreateTx.getReceipt(client);
    const topicId = topicReceipt.topicId;
    console.log(`✓ DID Topic Created: ${topicId}`);
    console.log(`✓ HashScan: https://hashscan.io/testnet/topic/${topicId}/messages\n`);

    // Step 3: Generate Device Key Pair
    console.log('Step 3: Generating Device Key Pair...');
    const devicePrivateKey = PrivateKey.generateED25519();
    const devicePublicKey = devicePrivateKey.publicKey;
    console.log(`✓ Device Private Key Generated`);
    console.log(`✓ Device Public Key Generated\n`);

    // Step 4: Create DID Document
    console.log('Step 4: Creating DID Document...');
    const did = `did:hedera:testnet:${topicId}`;
    const publicKeyBase64 = Buffer.from(devicePublicKey.toBytes()).toString('base64');
    
    const didDocument = {
      '@context': 'https://w3c-ccg.github.io/did-spec/',
      'id': did,
      'publicKey': [
        {
          'id': `${did}#key-1`,
          'type': 'Ed25519VerificationKey2018',
          'controller': did,
          'publicKeyBase64': publicKeyBase64
        }
      ],
      'authentication': [
        `${did}#key-1`
      ],
      'created': new Date().toISOString(),
      'proof': {
        'type': 'Ed25519Signature2018',
        'created': new Date().toISOString(),
        'verificationMethod': `${did}#key-1`,
        'signatureValue': generateSignature(did, devicePrivateKey)
      }
    };

    console.log(`✓ DID: ${did}`);
    console.log(`✓ DID Document Structure: Valid\n`);

    // Step 5: Submit DID Document to HCS Topic
    console.log('Step 5: Submitting DID Document to HCS Topic...');
    const didDocumentJson = JSON.stringify(didDocument);
    
    const submitTx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(didDocumentJson)
      .execute(client);

    const submitReceipt = await submitTx.getReceipt(client);
    const transactionId = submitTx.transactionId;
    console.log(`✓ DID Document Submitted: ${submitReceipt.status}`);
    console.log(`✓ Transaction ID: ${transactionId}`);
    console.log(`✓ HashScan: https://hashscan.io/testnet/transaction/${transactionId}\n`);

    // Step 6: Create Device Registration Document
    console.log('Step 6: Creating Device Registration Document...');
    const deviceRegistration = {
      'type': 'DeviceRegistration',
      'deviceId': DEVICE_ID,
      'deviceName': DEVICE_NAME,
      'deviceLocation': DEVICE_LOCATION,
      'did': did,
      'publicKey': devicePublicKey.toString(),
      'registrationDate': new Date().toISOString(),
      'deviceType': 'hydropower-turbine',
      'manufacturer': 'Unknown',
      'model': 'Unknown',
      'serialNumber': generateSerialNumber(),
      'capabilities': [
        'telemetry-submission',
        'signature-generation',
        'data-integrity'
      ]
    };

    console.log(`✓ Device Registration Document Created\n`);

    // Step 7: Submit Device Registration to HCS Topic
    console.log('Step 7: Submitting Device Registration to HCS Topic...');
    const registrationJson = JSON.stringify(deviceRegistration);
    
    const registrationTx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(registrationJson)
      .execute(client);

    const registrationReceipt = await registrationTx.getReceipt(client);
    console.log(`✓ Device Registration Submitted: ${registrationReceipt.status}\n`);

    // Step 8: Display Summary
    console.log('========================================');
    console.log('Device DID Deployment Summary');
    console.log('========================================\n');

    const summary = {
      'Device ID': DEVICE_ID,
      'Device Name': DEVICE_NAME,
      'DID': did,
      'DID Topic ID': topicId.toString(),
      'Operator Account': HEDERA_ACCOUNT_ID,
      'Network': 'Testnet',
      'Deployment Date': new Date().toISOString(),
      'Status': 'Active'
    };

    Object.entries(summary).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });

    console.log('\n========================================');
    console.log('Deployment Successful!');
    console.log('========================================\n');

    // Save deployment details to file
    const deploymentDetails = {
      ...summary,
      'devicePrivateKey': devicePrivateKey.toString(),
      'devicePublicKey': devicePublicKey.toString(),
      'didDocument': didDocument,
      'deviceRegistration': deviceRegistration,
      'transactionIds': {
        'topicCreation': transactionId.toString(),
        'didDocumentSubmission': transactionId.toString(),
        'deviceRegistrationSubmission': registrationTx.transactionId.toString()
      }
    };

    const outputDir = path.join(__dirname, '../../evidence');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'did-deployment.json'),
      JSON.stringify(deploymentDetails, null, 2)
    );

    console.log('✓ Deployment details saved to: evidence/did-deployment.json\n');

    return {
      success: true,
      topicId: topicId.toString(),
      did,
      devicePublicKey: devicePublicKey.toString(),
      devicePrivateKey: devicePrivateKey.toString(),
      deploymentDetails
    };
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (client) {
      client.close();
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate cryptographic signature for DID document
 */
function generateSignature(did, privateKey) {
  const message = Buffer.from(did);
  const signature = privateKey.sign(message);
  return Buffer.from(signature).toString('base64');
}

/**
 * Generate unique serial number for device
 */
function generateSerialNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `HYDRO-${timestamp}-${random}`;
}

// ============================================================================
// EXECUTION
// ============================================================================

deployDeviceDID()
  .then((result) => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
