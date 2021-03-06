const chainUtil = require("../chain-util");
const { MINING_REWARD } = require("../config");
class Transaction {
  constructor() {
    this.id = chainUtil.id();
    this.input = null;
    this.outputs = [];
  }
  update(senderWallet, amount, recipient) {
    const senderOutput = this.outputs.find(
      output => output.address === senderWallet.publicKey
    );
    if (amount > senderOutput.amount) {
      console.log(`Your ${amount} is more than balance`);
      return;
    }
    senderOutput.amount = senderOutput.amount - amount;
    // console.log(amount);
    this.outputs.push({ amount, address: recipient, time: Date.now() });
    Transaction.signTransaction(this, senderWallet);
    return this;
  }

  static transactionWithOutputs(senderWallet, outputs) {
    const transaction = new Transaction();
    transaction.outputs.push(...outputs);

    Transaction.signTransaction(transaction, senderWallet);
    return transaction;
  }

  static newTransaction(senderWallet, recipient, amount) {
    // console.log(senderWallet);
    if (senderWallet.balance < amount) {
      console.log(
        `Your amount ${amount} is exceeding your ${senderWallet.balance}.`
      );
      return;
    }
    return Transaction.transactionWithOutputs(senderWallet, [
      {
        amount: senderWallet.balance - amount,
        address: senderWallet.publicKey,
        time: Date.now()
      },

      { amount, address: recipient, time: Date.now() }
    ]);
  }
  static rewardTransaction(minerWallet, blockchainWallet) {
    return Transaction.transactionWithOutputs(blockchainWallet, [
      { amount: MINING_REWARD, address: minerWallet.publicKey }
    ]);
  }

  static signTransaction(transaction, senderWallet) {
    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(chainUtil.hash(transaction.outputs))
    };
  }
  static verifyTransaction(transaction) {
    return chainUtil.verifySignature(
      transaction.input.address,
      transaction.input.signature,
      chainUtil.hash(transaction.outputs)
    );
  }
}
module.exports = Transaction;
