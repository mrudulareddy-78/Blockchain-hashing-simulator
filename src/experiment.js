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
// Simple Blockchain implementation
class Transaction {
  constructor(sender, receiver, amount) {
    this.sender = sender;
    this.receiver = receiver;
    this.amount = amount;
    this.timestamp = Date.now();
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.index = 0;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
    this.merkleRoot = this.calculateMerkleRoot();
  }

  calculateHash() {
    const hashString = this.index + 
                      this.previousHash + 
                      this.timestamp + 
                      JSON.stringify(this.transactions) + 
                      this.nonce;
    // Simple hash simulation
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(10, '0');
  }

  calculateMerkleRoot() {
    return Math.random().toString(36).substring(2, 15);
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    const startTime = Date.now();
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    
    return (Date.now() - startTime) / 1000;
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 10;
    this.addresses = this.generateAddresses();
    this.miningTimes = [];
    this.difficultyLevels = [];
  }

  generateAddresses() {
    const addresses = [];
    for (let i = 0; i < 5; i++) {
      addresses.push('0x' + Math.random().toString(16).substring(2, 42));
    }
    return addresses;
  }

  createGenesisBlock() {
    const block = new Block(Date.now(), [], '0');
    block.index = 0;
    return block;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTransaction = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTransaction);

    const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.index = this.chain.length;
    
    const miningTime = block.mineBlock(this.difficulty);
    this.miningTimes.push(miningTime);
    this.difficultyLevels.push(this.difficulty);

    this.chain.push(block);
    this.pendingTransactions = [];
    
    return miningTime;
  }

  addTransaction(sender, receiver, amount) {
    if (sender !== 'network' && this.getBalance(sender) < amount) {
      throw new Error('Insufficient balance');
    }
    this.pendingTransactions.push(new Transaction(sender, receiver, amount));
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
    if (newDifficulty >= 1 && newDifficulty <= 6) {
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
      pendingTransactions: this.pendingTransactions.length
    };
  }
}

// Login Component
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
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
          🛡️
        </div>
        
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#4a5568',
          margin: '0 0 0.5rem 0'
        }}>
          Blockchain Simulator Login
        </h1>
        
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Enter your credentials to access the blockchain
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

        <form onSubmit={handleLogin}>
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
              marginBottom: '1.5rem',
              boxSizing: 'border-box'
            }}
          />
          
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
            Login to Blockchain
          </button>
        </form>
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


  const handleLogin = (username) => {
    setCurrentUser(username);
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
      setStatus({ message: `Added transaction: ${sender.substring(0, 8)}... → ${receiver.substring(0, 8)}... (${amount} coins)`, severity: 'success' });
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

  const DifficultyTrendChart = () => {
    return (
      <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#4a5568' }}>Difficulty vs Mining Time Correlation</h4>
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
          {blockchain.miningTimes.map((time, index) => {
            const difficulty = blockchain.difficultyLevels[index] || blockchain.difficulty;
            return (
              <div key={index} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: 1,
                minWidth: '40px'
              }}>
                <div style={{
                  width: '100%',
                  background: `linear-gradient(to top, #ef4444 0%, #f59e0b ${difficulty * 16.67}%, #10b981 100%)`,
                  borderRadius: '4px 4px 0 0',
                  height: `${(time / Math.max(...blockchain.miningTimes, 1)) * 150}px`,
                  minHeight: '3px',
                  marginBottom: '0.5rem'
                }}></div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>D{difficulty}</div>
                <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{time.toFixed(1)}s</div>
              </div>
            );
          })}
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
          <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: 0 }}>
            Welcome back, {currentUser}! 
          </p>
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
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4 (Medium)</option>
                      <option value={5}>5</option>
                      <option value={6}>6 (Hard)</option>
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
                  <h2 style={{ margin: '0 0 2rem 0', color: '#4a5568' }}>🔗 Blockchain Contents</h2>
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
                        <div style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: '1.6' }}>
                          <div><strong>Timestamp:</strong> {new Date(block.timestamp).toLocaleString()}</div>
                          <div><strong>Previous Hash:</strong> {block.previousHash.substring(0, 20)}...</div>
                          <div><strong>Hash:</strong> {block.hash.substring(0, 20)}...</div>
                          <div><strong>Merkle Root:</strong> {block.merkleRoot.substring(0, 20)}...</div>
                          <div><strong>Nonce:</strong> {block.nonce}</div>
                          <div><strong>Transactions:</strong> {block.transactions.length}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'analysis' && (
                <div>
                  <h2 style={{ margin: '0 0 2rem 0', color: '#4a5568' }}>📊 Mining Analysis</h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <SimpleLineChart 
                      data={blockchain.miningTimes} 
                      title="Mining Time (seconds)" 
                    />
                    
                    <SimpleBarChart 
                      data={blockchain.chain.map(block => block.transactions.length)} 
                      title="Transaction Count per Block" 
                    />
                  </div>
                  
                  {/* Additional Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div style={{ 
                      padding: '1rem', 
                      backgroundColor: '#f0f9ff', 
                      borderRadius: '8px', 
                      textAlign: 'center' 
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>
                        {blockchain.chain.length}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Blocks</div>
                    </div>
                    
                    <div style={{ 
                      padding: '1rem', 
                      backgroundColor: '#f0fdf4', 
                      borderRadius: '8px', 
                      textAlign: 'center' 
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>
                        {blockchain.chain.reduce((total, block) => total + block.transactions.length, 0)}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Transactions</div>
                    </div>
                    
                    <div style={{ 
                      padding: '1rem', 
                      backgroundColor: '#fefce8', 
                      borderRadius: '8px', 
                      textAlign: 'center' 
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a16207' }}>
                        {blockchain.miningTimes.length > 0 ? 
                          (blockchain.miningTimes.reduce((a, b) => a + b, 0) / blockchain.miningTimes.length).toFixed(2) : 
                          '0.00'
                        }s
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Avg Mining Time</div>
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