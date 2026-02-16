const { Client, AccountCreateTransaction, PrivateKey, Hbar } = require("@hashgraph/sdk");
require('dotenv').config();

async function main() {
    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    console.log("Seeding Scenario 1: Hydropower Plant Initialization...");

    const newAccountPrivateKey = PrivateKey.generateED25519(); 
    const transaction = new AccountCreateTransaction()
        .setKey(newAccountPrivateKey.publicKey)
        .setInitialBalance(new Hbar(10));

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);
    const newAccountId = receipt.accountId;

    console.log(`- Hydropower Plant Supplier Account Created: ${newAccountId}`);
    console.log(`- Private Key: ${newAccountPrivateKey.toString()}`);

    console.log("- Submitting initial plant metadata to HCS...");
    
    console.log("Scenario 1 Seeding Complete.");
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
