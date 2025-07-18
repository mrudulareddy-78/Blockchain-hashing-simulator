import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Grid, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Card, CardContent, Divider, Box, Alert, Tab, Tabs
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Send as SendIcon,
  AddCircle as AddIcon,
  CheckCircle as ValidateIcon,
  Assessment as AnalysisIcon,
  AccountTree as BlockIcon,
  Receipt as TransactionIcon
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend
);
// SHA-256 Implementation
function sha256(message) {
  // SHA-256 constants
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  // Initial hash values
  let H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  // Convert message to bytes
  const msgBytes = new TextEncoder().encode(message);
  const msgBits = msgBytes.length * 8;

  // Padding
  const padded = new Uint8Array(Math.ceil((msgBits + 65) / 512) * 64);
  padded.set(msgBytes);
  padded[msgBytes.length] = 0x80;

  // Append length as 64-bit big-endian
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, msgBits, false);

  // Process in 512-bit chunks
  for (let chunk = 0; chunk < padded.length; chunk += 64) {
    const W = new Array(64);
    
    // Copy chunk into first 16 words
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(chunk + i * 4, false);
    }

    // Extend the first 16 words into the remaining 48 words
    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(W[i - 15], 7) ^ rightRotate(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rightRotate(W[i - 2], 17) ^ rightRotate(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    // Initialize working variables
    let [a, b, c, d, e, f, g, h] = H;

    // Main loop
    for (let i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    // Add chunk's hash to result
    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  // Convert to hex string
  return H.map(h => h.toString(16).padStart(8, '0')).join('');
}

function rightRotate(value, amount) {
  return (value >>> amount) | (value << (32 - amount));
}
// Simple Blockchain implementation
class Transaction {
  constructor(sender, receiver, amount, timestamp = Date.now()) {
    Object.defineProperties(this, {
      sender: { value: sender, enumerable: true },
      receiver: { value: receiver, enumerable: true },
      amount: { value: amount, enumerable: true },
      timestamp: { value: timestamp, enumerable: true },
      txHash: { 
        value: sha256(`${sender}${receiver}${amount}${timestamp}`),
        enumerable: true 
      }
    });
  }
}

class Block {
  constructor(timestamp, transactions = [], previousHash = '') {
    // First calculate merkleRoot before making properties immutable
    const merkleRoot = this.calculateMerkleRoot(transactions);
    const initialHash = this.calculateInitialHash(timestamp, transactions, previousHash, merkleRoot);

    // Now define all properties as immutable
    Object.defineProperties(this, {
      index: { value: 0, writable: true }, // Only index can change during mining
      timestamp: { value: timestamp, enumerable: true },
      transactions: { 
        value: Object.freeze([...transactions]), // Deep immutability
        enumerable: true 
      },
      previousHash: { value: previousHash, enumerable: true },
      nonce: { value: 0, writable: true }, // Only nonce can change during mining
      hash: { value: initialHash, writable: true }, // Hash will be updated during mining
      merkleRoot: { value: merkleRoot, enumerable: true },
      merkleTree: { value: null, writable: true },
      hashOperations: { value: 0, writable: true }
    });
  }
  calculateInitialHash(timestamp, transactions, previousHash, merkleRoot) {
    return sha256(
      `0${previousHash}${timestamp}${JSON.stringify(transactions)}0${merkleRoot}`
    );
  }

  calculateHash() {
    const hashString = this.index + 
                      this.previousHash + 
                      this.timestamp + 
                      JSON.stringify(this.transactions) + 
                      this.nonce;
    return sha256(hashString);
  }

  calculateMerkleRoot(transactions) {
    if (!transactions || transactions.length === 0) {
      return sha256('genesis');
    }
    if (transactions.length === 1) {
      return sha256(JSON.stringify(transactions[0]));
    }

    let hashes = transactions.map(tx => sha256(JSON.stringify(tx)));
    this.merkleTree = { leaves: [...hashes], levels: [] };

    while (hashes.length > 1) {
      const newHashes = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || hashes[i];
        const combinedHash = sha256(left + right);
        newHashes.push(combinedHash);
        this.merkleTree.levels.push({ left, right, hash: combinedHash });
      }
      hashes = newHashes;
    }
    return hashes[0];
  }


 mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    const startTime = Date.now();
    this.hashOperations = 0;
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hashOperations++;
      this.hash = this.calculateHash();
      
      // Update index when mining completes (for block height)
      if (this.hash.substring(0, difficulty) === target) {
        Object.defineProperty(this, 'index', { 
          value: this.index, 
          writable: false 
        });
      }
    }
    
    return {
      time: (Date.now() - startTime) / 1000,
      operations: this.hashOperations
    };
  }
   calculateHash() {
    return sha256(
      this.index +
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.transactions) +
      this.nonce +
      this.merkleRoot
    );
  }
}

class Blockchain {
  constructor() {
    // Initialize with proper genesis block
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.addresses = this.generateAddresses();
    this.miningTimes = [];
    this.difficultyLevels = [];
    this.hashOperations = [];
    this.totalHashOperations = 0;
  }

  createGenesisBlock() {
    const genesisTx = new Transaction(
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000001', 
      1000000,
      Date.parse('2023-01-01T00:00:00Z')
    );
    
    return new Block(
      Date.parse('2023-01-01T00:00:00Z'),
      [genesisTx],
      '0'
    );
  }
  generateAddresses() {
    const addresses = [];
    for (let i = 0; i < 5; i++) {
      addresses.push('0x' + Math.random().toString(16).substring(2, 42));
    }
    return addresses;
  }
attemptTamper(blockIndex) {
  if (blockIndex >= this.chain.length) return false;
  
  const originalChain = [...this.chain];
  try {
    // Try to modify a property (will fail)
    this.chain[blockIndex].timestamp = Date.now();
    return false; // Should never reach here
  } catch (error) {
    // Expected error - show warning
    this.chain = originalChain; // Restore original chain
    return {
      success: false,
      message: `Failed to tamper with Block ${blockIndex}: ${error.message}`
    };
  }
}
  
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

   minePendingTransactions(miningRewardAddress) {
    
    const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.index = this.chain.length;
    
    const miningResult = block.mineBlock(this.difficulty);
    this.miningTimes.push(miningResult.time);
    this.difficultyLevels.push(this.difficulty);
    this.hashOperations.push(miningResult.operations);
    this.totalHashOperations += miningResult.operations;

    this.chain.push(block);
    this.pendingTransactions = [];
    
    return miningResult.time;
  }

  addTransaction(sender, receiver, amount) {
  // Validate sender has enough balance (unless it's the network)
  if (sender !== 'network') {
    const senderBalance = this.getBalance(sender);
    if (senderBalance < amount) {
      throw new Error('Insufficient balance');
    }
  }
  
  // Create and add the transaction
  const transaction = new Transaction(sender, receiver, amount);
  this.pendingTransactions.push(transaction);
}

  getBalance(address) {
  let balance = 0;

  for (const block of this.chain) {
    for (const trans of block.transactions) {
      if (trans.sender === address) {
        balance -= trans.amount;
      }
      if (trans.receiver === address) {
        balance += trans.amount;
      }
    }
  }

  return balance;
}

  setDifficulty(newDifficulty) {
    if (newDifficulty >= 1 && newDifficulty <= 4) {
      this.difficulty = newDifficulty;
      return true;
    }
    return false;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getTransactionHistory() {
    const history = [];
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        history.push({
          ...transaction,
          blockIndex: block.index,
          blockTimestamp: block.timestamp
        });
      }
    }
    return history.sort((a, b) => b.timestamp - a.timestamp);
  }

  getNetworkStats() {
    const totalBlocks = this.chain.length;
    const totalTransactions = this.chain.reduce((total, block) => total + block.transactions.length, 0);
    const avgMiningTime = this.miningTimes.length > 0 ? 
      this.miningTimes.reduce((a, b) => a + b, 0) / this.miningTimes.length : 0;
    const totalHashRate = totalBlocks / (avgMiningTime || 1);
    
    return {
      totalBlocks,
      totalTransactions,
      avgMiningTime,
      totalHashRate,
      currentDifficulty: this.difficulty,
      pendingTransactions: this.pendingTransactions.length,
      totalHashOperations: this.totalHashOperations,
      avgHashOperations: this.hashOperations.length > 0 ? 
        this.hashOperations.reduce((a, b) => a + b, 0) / this.hashOperations.length : 0
    };
  }
}

// Login Component
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (isRegistering) {
      if (!password) {
        setError('Please enter a password');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else {
      if (!password) {
        setError('Please enter a password');
        return;
      }
    }
    
    setError('');
    onLogin(username.trim());
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '3rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          borderRadius: '50%',
          margin: '0 auto 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem'
        }}>
          {isRegistering ? '📝' : '🔐'}
        </div>
        
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#4a5568',
          margin: '0 0 0.5rem 0'
        }}>
          {isRegistering ? 'Create Account' : 'Blockchain Login'}
        </h1>
        
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          {isRegistering ? 'Register to access the blockchain' : 'Enter your credentials'}
        </p>

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              marginBottom: '1rem',
              boxSizing: 'border-box'
            }}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              marginBottom: isRegistering ? '1rem' : '1.5rem',
              boxSizing: 'border-box'
            }}
          />
          
          {isRegistering && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                marginBottom: '1.5rem',
                boxSizing: 'border-box'
              }}
            />
          )}
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>
        
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            marginTop: '1rem',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [blockchain] = useState(new Blockchain());
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState(10);
  const [miner, setMiner] = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [activeSection, setActiveSection] = useState('transactions');
  const [status, setStatus] = useState({ message: 'Ready', severity: 'info' });
  const [, forceUpdate] = useState(0);
  const [dollarsToAdd, setDollarsToAdd] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showFullHashes, setShowFullHashes] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState(null);
   const [selectedTx, setSelectedTx] = useState(null);

  const handleLogin = (username) => {
  setCurrentUser(username);
  setUsername(username);  // Add this line
  setUserProfile({
    username: username,
    publicKey: '0x' + Math.random().toString(16).substring(2, 42),
    privateKey: Math.random().toString(16).substring(2, 66)
  });
  setIsLoggedIn(true);
};

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setUserProfile(null);
    setActiveSection('transactions');
  };

  useEffect(() => {
    if (blockchain.addresses.length > 0 && userProfile) {
      setSender(userProfile.publicKey);
      setReceiver(blockchain.addresses[1]);
      setMiner(userProfile.publicKey);
    }
  }, [blockchain.addresses, userProfile]);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const handleAddTransaction = () => {
  try {
    if (!sender || !receiver) throw new Error('Please select sender and receiver');
    if (amount <= 0) throw new Error('Amount must be positive');
    if (sender === receiver) throw new Error('Sender and receiver cannot be the same');

    blockchain.addTransaction(sender, receiver, parseFloat(amount));
    forceUpdate(n => n + 1);
    setStatus({ 
      message: `Added transaction: ${sender.substring(0, 8)}... → ${receiver.substring(0, 8)}... (${amount} coins)`, 
      severity: 'success' 
    });
  } catch (error) {
    setStatus({ message: error.message, severity: 'error' });
  }
};
  const handleMineBlock = () => {
    try {
      if (!miner) throw new Error('Please select miner address');

      if (blockchain.pendingTransactions.length === 0) {
        if (!window.confirm('No pending transactions. Mine empty block?')) return;
        blockchain.addTransaction('network', miner, 0);
      }

      const miningTime = blockchain.minePendingTransactions(miner);
      forceUpdate(n => n + 1);
      setStatus({
        message: `Mined block #${blockchain.chain.length - 1} in ${miningTime.toFixed(2)}s | Difficulty: ${blockchain.difficulty}`,
        severity: 'success'
      });
    } catch (error) {
      setStatus({ message: error.message, severity: 'error' });
    }
  };

  const handleDifficultyChange = (newDifficulty) => {
    if (blockchain.setDifficulty(newDifficulty)) {
      setDifficulty(newDifficulty);
      setStatus({ message: `Difficulty set to ${newDifficulty}`, severity: 'success' });
    } else {
      setStatus({ message: 'Invalid difficulty level', severity: 'error' });
    }
  };

  const handleValidateChain = () => {
    const isValid = blockchain.isChainValid();
    setStatus({
      message: isValid ? 'Blockchain is valid!' : 'Blockchain is NOT valid!',
      severity: isValid ? 'success' : 'error'
    });
  };

  const handleAddCoins = () => {
    try {
      const dollars = parseFloat(dollarsToAdd);
      if (dollars <= 0) throw new Error('Amount must be positive');
      
      const coins = dollars * 0.1;
      blockchain.addTransaction('network', userProfile.publicKey, coins);
      forceUpdate(n => n + 1);
      setStatus({ message: `Added ${coins} coins ($${dollars}) to your account`, severity: 'success' });
      setDollarsToAdd('');
    } catch (error) {
      setStatus({ message: error.message, severity: 'error' });
    }
  };
  const SimpleLineChart = ({ data, title }) => {
    const maxValue = Math.max(...data);
    return (
      <div>
        <h4 style={{ margin: '0 0 1rem 0', color: '#6b7280' }}>{title}</h4>
        <div style={{ 
          display: 'flex', 
          alignItems: 'end', 
          gap: '4px', 
          height: '200px',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          {data.map((value, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              flex: 1
            }}>
              <div style={{
                width: '100%',
                backgroundColor: '#8b5cf6',
                borderRadius: '4px 4px 0 0',
                height: `${(value / maxValue) * 150}px`,
                minHeight: '2px',
                marginBottom: '0.5rem'
              }}></div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>B{index}</div>
              <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{value.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  

  const SimpleBarChart = ({ data, title }) => {
    const maxValue = Math.max(...data);
    return (
      <div>
        <h4 style={{ margin: '0 0 1rem 0', color: '#6b7280' }}>{title}</h4>
        <div style={{ 
          display: 'flex', 
          alignItems: 'end', 
          gap: '4px', 
          height: '200px',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          {data.map((value, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              flex: 1
            }}>
              <div style={{
                width: '100%',
                backgroundColor: '#a855f7',
                borderRadius: '4px 4px 0 0',
                height: `${maxValue > 0 ? (value / maxValue) * 150 : 2}px`,
                minHeight: '2px',
                marginBottom: '0.5rem'
              }}></div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>B{index}</div>
              <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced chart components
  const EnhancedLineChart = ({ data, title, color = '#8b5cf6' }) => {
    if (data.length === 0) return <div>No data available</div>;
    
    const maxValue = Math.max(...data, 1);
    const minValue = Math.min(...data);
    
    return (
      <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#4a5568' }}>{title}</h4>
        <div style={{ 
          display: 'flex', 
          alignItems: 'end', 
          gap: '6px', 
          height: '200px',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          {data.map((value, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              flex: 1,
              minWidth: '30px'
            }}>
              <div style={{
                width: '100%',
                backgroundColor: color,
                borderRadius: '4px 4px 0 0',
                height: `${(value / maxValue) * 150}px`,
                minHeight: '3px',
                marginBottom: '0.5rem',
                position: 'relative',
                cursor: 'pointer'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#374151',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  opacity: 0,
                  transition: 'opacity 0.2s'
                }} 
                onMouseEnter={(e) => e.target.style.opacity = 1}
                onMouseLeave={(e) => e.target.style.opacity = 0}>
                  {value.toFixed(2)}
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>B{index}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  

  const availableAddresses = [...blockchain.addresses, userProfile.publicKey];
  const networkStats = blockchain.getNetworkStats();

  return (
    <div style={{ backgroundColor: '#faf8ff', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
  <h1 style={{ 
    fontFamily: 'Playfair Display, serif', 
    fontSize: '3rem', 
    fontWeight: 'bold', 
    color: '#4a5568',
    margin: '0 0 0.5rem 0'
  }}>
    Blockchain Simulator
  </h1>
  <div>
    <p style={{ color: '#6b7280', fontSize: '1.1rem', display: 'inline', marginRight: '1rem' }}>
      Welcome back, {currentUser}! 
    </p>
    <button 
      onClick={handleLogout}
      style={{
        padding: '0.25rem 0.75rem',
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
      }}
    >
      Logout
    </button>
  </div>
</div>

        {/* Navigation Menu */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {[
               { key: 'transactions', label: '💳 Transactions' },
  { key: 'mining', label: '⛏️ Mining' },
  { key: 'blockchain', label: '🔗 Blockchain' },
  { key: 'security', label: '🔒 Security' }, // New tab
  { key: 'analysis', label: '📊 Analysis' },
  { key: 'profile', label: '👤 Profile' }
            ].map(section => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: activeSection === section.key ? '#e6e6fa' : 'transparent',
                  color: activeSection === section.key ? '#5b21b6' : '#6b7280',
                  fontWeight: activeSection === section.key ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Alert */}
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          backgroundColor: status.severity === 'success' ? '#d1fae5' : 
                           status.severity === 'error' ? '#fee2e2' : '#dbeafe',
          color: status.severity === 'success' ? '#065f46' : 
                 status.severity === 'error' ? '#991b1b' : '#1e40af',
          border: `1px solid ${status.severity === 'success' ? '#a7f3d0' : 
                              status.severity === 'error' ? '#fecaca' : '#bfdbfe'}`
        }}>
          {status.message}
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Left Sidebar */}
          <div style={{ flex: '0 0 350px' }}>
            {/* Network Stats */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#4a5568' }}>📊 Network Stats</h3>
              <hr style={{ border: 'none', height: '1px', backgroundColor: '#e5e7eb', margin: '1rem 0' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div>
                  <div style={{ color: '#6b7280' }}>Total Blocks</div>
                  <div style={{ fontWeight: 'bold', color: '#5b21b6' }}>{networkStats.totalBlocks}</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280' }}>Total Transactions</div>
                  <div style={{ fontWeight: 'bold', color: '#5b21b6' }}>{networkStats.totalTransactions}</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280' }}>Avg Mining Time</div>
                  <div style={{ fontWeight: 'bold', color: '#5b21b6' }}>{networkStats.avgMiningTime.toFixed(2)}s</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280' }}>Current Difficulty</div>
                  <div style={{ fontWeight: 'bold', color: '#5b21b6' }}>{networkStats.currentDifficulty}</div>
                </div>
              </div>
            </div>

            {/* Account Balances */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#4a5568' }}>💰 Account Balances</h3>
              <hr style={{ border: 'none', height: '1px', backgroundColor: '#e5e7eb', margin: '1rem 0' }} />
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>Your Account:</div>
                <div style={{ fontWeight: 'bold', color: '#5b21b6' }}>
                  {userProfile.publicKey.substring(0, 12)}...: {blockchain.getBalance(userProfile.publicKey)} coins
                </div>
              </div>
              
              {blockchain.addresses.map(addr => (
                <div key={addr} style={{ marginBottom: '0.5rem', color: '#6b7280' }}>
                  {addr.substring(0, 12)}...: <strong>{blockchain.getBalance(addr)} coins</strong>
                </div>
              ))}
            </div>

            {/* Add Coins */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#4a5568' }}>💵 Add Coins</h3>
              <hr style={{ border: 'none', height: '1px', backgroundColor: '#e5e7eb', margin: '1rem 0' }} />
              
              <input
                type="number"
                placeholder="Enter dollars ($)"
                value={dollarsToAdd}
                onChange={(e) => setDollarsToAdd(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={handleAddCoins}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                💰 Convert to Coins
              </button>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                Rate: $1 = 0.1 coins
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1 }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              {activeSection === 'transactions' && (
                <div>
                  <h2 style={{ margin: '0 0 2rem 0', color: '#4a5568' }}>💳 Transaction Manager</h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '600' }}>
                        Sender Address
                      </label>
                      <select
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      >
                        {availableAddresses.map(addr => (
                          <option key={addr} value={addr}>
                            {addr === userProfile.publicKey ? `👤 ${addr.substring(0, 12)}... (You)` : `${addr.substring(0, 12)}...`}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '600' }}>
                        Receiver Address
                      </label>
                      <select
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      >
                        {availableAddresses.map(addr => (
                          <option key={addr} value={addr}>
                            {addr === userProfile.publicKey ? `👤 ${addr.substring(0, 12)}... (You)` : `${addr.substring(0, 12)}...`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '600' }}>
                      Amount (coins)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <button
                    onClick={handleAddTransaction}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    📤 Add Transaction
                  </button>

                  {/* Pending Transactions */}
                  <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#4a5568' }}>⏳ Pending Transactions</h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {blockchain.pendingTransactions.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
                          No pending transactions
                        </p>
                      ) : (
                        blockchain.pendingTransactions.map((tx, idx) => (
                          <div key={idx} style={{
                            padding: '1rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            marginBottom: '0.5rem',
                            backgroundColor: '#f8fafc'
                          }}>
                            <div style={{ fontSize: '0.9rem' }}>
                              <strong>{tx.sender?.substring(0, 10)}...</strong> → <strong>{tx.receiver?.substring(0, 10)}...</strong>
                              <span style={{ float: 'right', fontWeight: 'bold' }}>{tx.amount} coins</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                              {new Date(tx.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'mining' && (
                <div>
                  <h2 style={{ margin: '0 0 2rem 0', color: '#4a5568' }}>⛏️ Mining Controls</h2>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '600' }}>
                      Miner Address
                    </label>
                    <select
                      value={miner}
                      onChange={(e) => setMiner(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      {availableAddresses.map(addr => (
                        <option key={addr} value={addr}>
                          {addr === userProfile.publicKey ? `👤 ${addr.substring(0, 12)}... (You)` : `${addr.substring(0, 12)}...`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ marginBottom: '0.5rem', color: '#6b7280' }}>
                      Current Difficulty: <strong style={{ color: '#5b21b6' }}>{blockchain.difficulty}</strong>
                    </div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '600' }}>
                      Set Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => handleDifficultyChange(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value={1}>1 (Easy)</option>
                      <option value={2}>2(Medium)</option>
                      <option value={3}>3(Medium)</option>
                      <option value={4}>4 (Hard)</option>
                      
                    </select>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button
                      onClick={handleMineBlock}
                      style={{
                        padding: '1rem',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ⛏️ Mine Block
                    </button>
                    
                    <button
                      onClick={handleValidateChain}
                      style={{
                        padding: '1rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ✅ Validate Chain
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'blockchain' && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <h2 style={{ margin: 0, color: '#4a5568' }}>🔗 Blockchain Contents</h2>
      <button 
        onClick={() => setShowFullHashes(!showFullHashes)}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: showFullHashes ? '#ef4444' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.9rem'
        }}
      >
        {showFullHashes ? 'Hide Full Hashes' : 'Show Full Hashes'}
      </button>
    </div>

    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
      {blockchain.chain.map(block => (
        <div key={block.index} style={{
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          marginBottom: '1rem',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#5b21b6' }}>Block #{block.index}</h3>
          <div style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: '1.6', wordBreak: 'break-all' }}>
            <div><strong>Timestamp:</strong> {new Date(block.timestamp).toLocaleString()}</div>
            <div><strong>Previous Hash:</strong> {showFullHashes ? block.previousHash : `${block.previousHash.substring(0, 20)}...`}</div>
            <div><strong>Hash:</strong> {showFullHashes ? block.hash : `${block.hash.substring(0, 20)}...`}</div>
            <div><strong>Nonce:</strong> {block.nonce}</div>
            <div><strong>Transactions:</strong> {block.transactions.length}</div>
            {expandedBlock === block.index && block.transactions.length > 1 && (
  <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
    <h4 style={{ margin: '0 0 0.5rem 0', color: '#4a5568' }}>
      Intermediate Hashes
      <button 
        onClick={() => setShowFullHashes(!showFullHashes)}
        style={{
          marginLeft: '1rem',
          padding: '0.25rem 0.5rem',
          background: showFullHashes ? '#ef4444' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '0.8rem',
          cursor: 'pointer'
        }}
      >
        {showFullHashes ? 'Hide Full Hashes' : 'Show Full Hashes'}
      </button>
    </h4>
    {block.merkleTree?.levels?.map((level, idx) => (
      <div key={idx} style={{ marginBottom: '0.5rem' }}>
        <div>
          <strong>Level {idx + 1}:</strong> {showFullHashes ? level.hash : `${level.hash.substring(0, 16)}...`}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
          (Left: {showFullHashes ? level.left : `${level.left.substring(0, 8)}...`}, 
          Right: {showFullHashes ? level.right : `${level.right.substring(0, 8)}...`})
        </div>
      </div>
    ))}
  </div>
)}
            
            {/* Enhanced Merkle Tree Display */}
<div style={{ marginTop: '1rem' }}>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
    <h4 style={{ margin: 0, color: '#4a5568' }}>Merkle Tree</h4>
    <button 
      onClick={() => setExpandedBlock(expandedBlock === block.index ? null : block.index)}
      style={{
        padding: '0.25rem 0.75rem',
        backgroundColor: expandedBlock === block.index ? '#e5e7eb' : '#f3f4f6',
        color: '#4b5563',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}
    >
      {expandedBlock === block.index ? (
        <>
          <span>▲</span> Collapse
        </>
      ) : (
        <>
          <span>▼</span> Expand
        </>
      )}
    </button>
  </div>
  
  <div style={{ 
    backgroundColor: 'white', 
    padding: '1.5rem', 
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    {/* Root Node */}
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: expandedBlock === block.index ? '1rem' : '0'
    }}>
      <div style={{ 
        padding: '0.75rem 1.25rem',
        backgroundColor: '#8b5cf6',
        color: 'white',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '0.85rem',
        boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)'
      }}>
        Merkle Root
      </div>
      <div style={{ 
        marginTop: '0.5rem',
        padding: '0.5rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        fontSize: '0.75rem',
        wordBreak: 'break-all',
        textAlign: 'center'
      }}>
        {showFullHashes ? block.merkleRoot : `${block.merkleRoot.substring(0, 12)}...`}
      </div>
    </div>

    {expandedBlock === block.index && block.transactions.length > 0 && (
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '1rem'
      }}>
        {/* Intermediate Nodes */}
        {block.transactions.length > 1 && (
          <>
            <div style={{ fontSize: '1.25rem', color: '#9ca3af' }}>↓</div>
            
            <div style={{ 
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {Array(Math.ceil(block.transactions.length / 2)).fill(0).map((_, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{ 
                    padding: '0.5rem 1rem',
                    backgroundColor: '#a78bfa',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    Intermediate Hash {idx+1}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Transaction Leaves */}
        <div style={{ fontSize: '1.25rem', color: '#9ca3af' }}>↓</div>
        
        <div style={{ 
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {block.transactions.map((tx, idx) => (
            <div 
              key={idx} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <div 
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#c4b5fd',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }
                }}
                onClick={() => setSelectedTx(selectedTx === tx.hash ? null : tx.hash)}
              >
                Transaction {idx+1}
              </div>
              
              {selectedTx === tx.hash && (
                <div style={{ 
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '200px',
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  fontSize: '0.7rem'
                }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>From:</strong> {tx.sender?.substring(0, 12)}...
                  </div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>To:</strong> {tx.receiver?.substring(0, 12)}...
                  </div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>Amount:</strong> {tx.amount} coins
                  </div>
                  <div>
                    <strong>Hash:</strong> {tx.hash.substring(0, 12)}...
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {block.transactions.length === 0 && (
      <div style={{ 
        textAlign: 'center', 
        padding: '1rem',
        color: '#6b7280',
        fontStyle: 'italic'
      }}>
        No transactions in this block
      </div>
    )}
  </div>
</div>

{/* Transaction Details Section */}
<div style={{ marginTop: '1.5rem' }}>
  <h4 style={{ margin: '0 0 0.75rem 0', color: '#4a5568' }}>Transaction Details</h4>
  {block.transactions.length === 0 ? (
    <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No transactions to display</p>
  ) : (
    <div style={{ 
      maxHeight: '300px', 
      overflowY: 'auto',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '0.75rem',
      backgroundColor: '#f9fafb'
    }}>
      {block.transactions.map((tx, idx) => (
        <div 
          key={idx} 
          style={{ 
            padding: '0.75rem',
            borderBottom: idx < block.transactions.length - 1 ? '1px solid #e5e7eb' : 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            ':hover': {
              backgroundColor: '#f3f4f6'
            }
          }}
          onClick={() => setSelectedTx(selectedTx === tx.hash ? null : tx.hash)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <strong>From:</strong> {showFullHashes ? tx.sender : `${tx.sender?.substring(0, 10)}...`}
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                <strong>To:</strong> {showFullHashes ? tx.receiver : `${tx.receiver?.substring(0, 10)}...`}
              </div>
            </div>
            <div style={{ 
              fontWeight: 'bold',
              color: '#5b21b6',
              fontSize: '0.9rem'
            }}>
              {tx.amount} coins
            </div>
          </div>
          
          {selectedTx === tx.hash && (
            <div style={{ 
              marginTop: '0.75rem',
              padding: '0.75rem',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              fontSize: '0.75rem'
            }}>
              <div style={{ marginBottom: '0.25rem', wordBreak: 'break-all' }}>
                <strong>Hash:</strong> {tx.hash}
              </div>
              <div>
                <strong>Time:</strong> {new Date(tx.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
              {activeSection === 'security' && (
  <div>
    <h2 style={{ marginBottom: '2rem' }}>🔒 Security Test</h2>
    
    <div style={{
      padding: '1.5rem',
      backgroundColor: '#fff3f3',
      borderRadius: '12px',
      border: '1px solid #ffd6d6',
      marginBottom: '2rem'
    }}>
      <h3>Tamper Test</h3>
      <p>Select a block to attempt modification:</p>
      
     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0', flexWrap: 'wrap' }}>
  {blockchain.chain.map((block, index) => (
    <React.Fragment key={index}>
      <button
        onClick={() => {
          const result = blockchain.attemptTamper(index);
          setStatus({
            message: result.message || `Block ${index} is immutable!`,
            severity: result.success ? 'success' : 'error'
          });
        }}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#ffebeb',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        Block #{index}
      </button>
      
      {/* Add arrow between blocks (except after last block) */}
      {index < blockchain.chain.length - 1 && (
        <div style={{
          width: '20px',
          height: '1px',
          backgroundColor: '#8b5cf6',
          position: 'relative',
          margin: '0 0.5rem'
        }}>
          <div style={{
            position: 'absolute',
            right: '-4px',
            top: '-4px',
            width: '0',
            height: '0',
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderLeft: '8px solid #8b5cf6'
          }}></div>
        </div>
      )}
    </React.Fragment>
  ))}
</div>
      
      <div style={{
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginTop: '1rem'
      }}>
        <h4>What's happening?</h4>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Blocks are immutable after creation</li>
          <li>Any modification attempt throws an error</li>
          <li>The blockchain automatically restores itself</li>
          <li>Hash changes would break chain integrity</li>
        </ul>
      </div>
    </div>
    
    {/* Visual demonstration */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem',
      backgroundColor: '#f0fdf4',
      borderRadius: '12px'
    }}>
      <div>
        <h3>Try This:</h3>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li>Click any block to attempt modification</li>
          <li>See the error message appear</li>
          <li>Check that the block remains unchanged</li>
        </ol>
      </div>
      <div style={{
        padding: '1rem',
        backgroundColor: '#dcfce7',
        borderRadius: '8px'
      }}>
        <p style={{ fontWeight: 'bold' }}>Expected Result:</p>
        <p style={{ color: '#ef4444' }}>
          ⚠️ Error: Cannot assign to read only property...
        </p>
      </div>
    </div>
  </div>
)}
              {activeSection === 'analysis' && (
  <div>
    <h2 style={{ margin: '0 0 2rem 0', color: '#4a5568' }}>📊 Blockchain Algorithm Analysis</h2>
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
      <EnhancedLineChart 
        data={blockchain.miningTimes} 
        title="Mining Time (seconds)" 
        color="#8b5cf6"
      />
      
      <SimpleBarChart 
        data={blockchain.difficultyLevels} 
        title="Difficulty Level" 
      />
    </div>
    
    

    {/* New Mining Analysis Charts */}
    <div style={{ 
      padding: '1.5rem', 
      backgroundColor: 'white', 
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#4a5568' }}>⛏️ Mining Analysis</h3>
      
      {/* Mining Time vs Difficulty Level Chart */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#6b7280' }}>Mining Time vs Difficulty Level</h4>
        <div style={{ 
          height: '300px',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <Line 
            data={{
              labels: blockchain.miningTimes.map((_, index) => `Block ${index}`),
              datasets: [
                {
                  label: 'Mining Time (seconds)',
                  data: blockchain.miningTimes,
                  borderColor: '#8b5cf6',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  yAxisID: 'y',
                },
                {
                  label: 'Difficulty Level',
                  data: blockchain.difficultyLevels,
                  borderColor: '#f59e0b',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  yAxisID: 'y1',
                  type: 'line'
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Mining Time (seconds)'
                  },
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Difficulty Level'
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                },
              }
            }}
          />
        </div>
      </div>
      
      
    </div>
    
 
    
    <div style={{ 
      padding: '1.5rem', 
      backgroundColor: 'white', 
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#4a5568' }}>📈 Performance Metrics</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>Hash Rate</h4>
          <p style={{ margin: 0, color: '#6b7280' }}>
            <strong>Total Hashes:</strong> {networkStats.totalHashOperations.toLocaleString()}
          </p>
          <p style={{ margin: 0, color: '#6b7280' }}>
            <strong>Avg Hashes/Block:</strong> {networkStats.avgHashOperations.toFixed(0)}
          </p>
        </div>
        
        <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>Block Production</h4>
          <p style={{ margin: 0, color: '#6b7280' }}>
            <strong>Total Blocks:</strong> {networkStats.totalBlocks}
          </p>
          <p style={{ margin: 0, color: '#6b7280' }}>
            <strong>Avg Time:</strong> {networkStats.avgMiningTime.toFixed(2)}s
          </p>
        </div>
        
        <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>Transactions</h4>
          <p style={{ margin: 0, color: '#6b7280' }}>
            <strong>Total:</strong> {networkStats.totalTransactions}
          </p>
          <p style={{ margin: 0, color: '#6b7280' }}>
            <strong>Pending:</strong> {networkStats.pendingTransactions}
          </p>
        </div>
        
        <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>Difficulty</h4>
          <p style={{ margin: 0, color: '#6b7280' }}>
            <strong>Current:</strong> {networkStats.currentDifficulty}
          </p>
          <p style={{ margin: 0, color: '#6b7280' }}>
            <strong>Target:</strong> {Array(networkStats.currentDifficulty + 1).join('0')}...
          </p>
        </div>
      </div>
    </div>
  </div>
)}
              {activeSection === 'profile' && (
                <div>
                  <h2 style={{ margin: '0 0 2rem 0', color: '#4a5568' }}>👤 User Profile</h2>
                  
                  <div style={{ 
                    padding: '2rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        backgroundColor: '#8b5cf6', 
                        borderRadius: '50%', 
                        margin: '0 auto 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem'
                      }}>
                        👤
                      </div>
                      <h3 style={{ margin: 0, color: '#4a5568' }}>Hey {username}!</h3>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '600' }}>
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: '#f9fafb',
                            color: '#6b7280'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '600' }}>
                          Public Key
                        </label>
                        <input
                          type="text"
                          value={userProfile.publicKey}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: '#f9fafb',
                            color: '#6b7280',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '600' }}>
                          Private Key
                        </label>
                        <input
                          type="password"
                          value={userProfile.privateKey}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: '#f9fafb',
                            color: '#6b7280',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '600' }}>
                          Your Balance
                        </label>
                        <input
                          type="text"
                          value={`${blockchain.getBalance(userProfile.publicKey)} coins`}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: '#f0fdf4',
                            color: '#166534',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }

  export default App;
