import sha256 from 'crypto-js/sha256';

// First define the Block class
class Block {
  constructor(index, transactions, previousHash, nonce = 0) {
    this.index = index;
    this.timestamp = new Date().toISOString();
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.merkleRoot = this.calculateMerkleRoot();
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return sha256(JSON.stringify({
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions,
      previousHash: this.previousHash,
      nonce: this.nonce,
      merkleRoot: this.merkleRoot
    })).toString();
  }

  calculateMerkleRoot() {
    if (!this.transactions || this.transactions.length === 0) return '';
    
    let transactionHashes = this.transactions.map(tx => 
      sha256(JSON.stringify(tx)).toString()
    );

    while (transactionHashes.length > 1) {
      const newHashes = [];
      for (let i = 0; i < transactionHashes.length; i += 2) {
        const left = transactionHashes[i];
        const right = (i + 1 < transactionHashes.length) 
          ? transactionHashes[i + 1] 
          : transactionHashes[i];
        newHashes.push(sha256(left + right).toString());
      }
      transactionHashes = newHashes;
    }

    return transactionHashes[0];
  }

  mineBlock(difficulty) {
    const target = '0'.repeat(difficulty);
    const startTime = Date.now();
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    
    return (Date.now() - startTime) / 1000; // Return time in seconds
  }
}

// Then define the Blockchain class
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 10;
    this.miningTimes = [];
    this.difficultyLevels = [];
    this.addresses = this.generateAddresses();
  }

  generateAddresses() {
    return [
      `User1-${Math.random().toString(36).substring(2, 10)}`,
      `User2-${Math.random().toString(36).substring(2, 10)}`,
      `User3-${Math.random().toString(36).substring(2, 10)}`
    ];
  }

  createGenesisBlock() {
    return new Block(0, ['Genesis Transaction'], '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  setDifficulty(newDifficulty) {
    if (newDifficulty >= 1 && newDifficulty <= 6) {
      this.difficulty = newDifficulty;
      return true;
    }
    return false;
  }

  addTransaction(sender, receiver, amount) {
    this.pendingTransactions.push({
      sender,
      receiver,
      amount,
      timestamp: new Date().toISOString()
    });
  }

  minePendingTransactions(minerAddress) {
    const block = new Block(
      this.chain.length,
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    
    const miningTime = block.mineBlock(this.difficulty);
    this.miningTimes.push(miningTime);
    this.difficultyLevels.push(this.difficulty);
    
    this.chain.push(block);
    this.pendingTransactions = [{
      sender: 'network',
      receiver: minerAddress,
      amount: this.miningReward,
      timestamp: new Date().toISOString()
    }];
    
    return miningTime;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      
      if (current.hash !== current.calculateHash()) return false;
      if (current.previousHash !== previous.hash) return false;
      if (current.merkleRoot !== current.calculateMerkleRoot()) return false;
    }
    return true;
  }
  

  getBalance(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.receiver === address) balance += tx.amount;
        if (tx.sender === address) balance -= tx.amount;
      }
    }
    return balance;
  }
}

// Export both classes
export { Block, Blockchain };