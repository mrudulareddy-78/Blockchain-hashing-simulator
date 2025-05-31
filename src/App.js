import React, { useState, useEffect } from 'react';
import { Blockchain } from './Blockchain';
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

function App() {
  const [blockchain] = useState(new Blockchain());
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState(10);
  const [miner, setMiner] = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [activeTab, setActiveTab] = useState(0);
  const [status, setStatus] = useState({ message: 'Ready', severity: 'info' });
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (blockchain.addresses.length > 0) {
      setSender(blockchain.addresses[0]);
      setReceiver(blockchain.addresses[1]);
      setMiner(blockchain.addresses[0]);
    }
  }, [blockchain.addresses]);

  const handleAddTransaction = () => {
    try {
      if (!sender || !receiver) throw new Error('Please select sender and receiver');
      if (amount <= 0) throw new Error('Amount must be positive');
      if (sender === receiver) throw new Error('Sender and receiver cannot be the same');

      blockchain.addTransaction(sender, receiver, parseFloat(amount));
      forceUpdate(n => n + 1);
      setStatus({ message: `Added transaction: ${sender.substring(0, 5)}... → ${receiver.substring(0, 5)}... (${amount} coins)`, severity: 'success' });
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

  const handleRunAnalysis = () => {
    setActiveTab(2);
    setStatus({ message: 'Analysis completed. See charts for details.', severity: 'info' });
  };

  const miningChartData = {
    labels: blockchain.difficultyLevels.map((_, i) => `Block ${i}`),
    datasets: [{
      label: 'Mining Time (seconds)',
      data: blockchain.miningTimes,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }, {
      label: 'Difficulty Level',
      data: blockchain.difficultyLevels,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      yAxisID: 'y1',
      tension: 0.1
    }]
  };

  const blockchainGrowthData = {
    labels: blockchain.chain.map((_, i) => `Block ${i}`),
    datasets: [{
      label: 'Transaction Count',
      data: blockchain.chain.map(block => block.transactions.length),
      backgroundColor: 'rgba(54, 162, 235, 0.5)'
    }]
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
        Blockchain Simulator
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary">
        Design and Analysis of Algorithms Project
      </Typography>

      <Alert severity={status.severity} sx={{ my: 2 }}>{status.message}</Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6"><WalletIcon sx={{ mr: 1 }} /> Wallet Controls</Typography>
            <Divider sx={{ my: 2 }} />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Sender Address</InputLabel>
              <Select value={sender} onChange={(e) => setSender(e.target.value)} label="Sender Address">
                {blockchain.addresses.map(addr => <MenuItem key={addr} value={addr}>{addr}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Receiver Address</InputLabel>
              <Select value={receiver} onChange={(e) => setReceiver(e.target.value)} label="Receiver Address">
                {blockchain.addresses.map(addr => <MenuItem key={addr} value={addr}>{addr}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField fullWidth label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} />
            <Button fullWidth variant="contained" color="primary" startIcon={<SendIcon />} onClick={handleAddTransaction} sx={{ mb: 3 }}>
              Add Transaction
            </Button>

            <Typography variant="h6"><AddIcon sx={{ mr: 1 }} /> Mining Controls</Typography>
            <Divider sx={{ my: 2 }} />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Miner Address</InputLabel>
              <Select value={miner} onChange={(e) => setMiner(e.target.value)} label="Miner Address">
                {blockchain.addresses.map(addr => <MenuItem key={addr} value={addr}>{addr}</MenuItem>)}
              </Select>
            </FormControl>

            <Typography sx={{ mb: 2 }}>Current Difficulty: <strong>{blockchain.difficulty}</strong></Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Set Difficulty</InputLabel>
              <Select 
                value={difficulty}
                onChange={(e) => handleDifficultyChange(Number(e.target.value))}
                label="Set Difficulty"
              >
                <MenuItem value={1}>1 (Easy)</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4 (Medium)</MenuItem>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={6}>6 (Hard)</MenuItem>
              </Select>
            </FormControl>

            <Button fullWidth variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleMineBlock} sx={{ mb: 2 }}>
              Mine Block
            </Button>
            <Button fullWidth variant="outlined" startIcon={<ValidateIcon />} onClick={handleValidateChain} sx={{ mb: 2 }}>
              Validate Chain
            </Button>
            <Button fullWidth variant="outlined" startIcon={<AnalysisIcon />} onClick={handleRunAnalysis}>
              Run Analysis
            </Button>
          </Paper>

          <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6"><WalletIcon sx={{ mr: 1 }} /> Account Balances</Typography>
            <Divider sx={{ my: 2 }} />
            {blockchain.addresses.map(addr => (
              <Typography key={addr} sx={{ mb: 1 }}>
                {addr.substring(0, 10)}...: <strong>{blockchain.getBalance(addr)} coins</strong>
              </Typography>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label="Blockchain" icon={<BlockIcon />} />
              <Tab label="Pending Transactions" icon={<TransactionIcon />} />
              <Tab label="Analysis" icon={<AnalysisIcon />} />
            </Tabs>
            <Divider />
            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Blockchain Contents</Typography>
                  {blockchain.chain.map(block => (
                    <Card key={block.index} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6">Block #{block.index}</Typography>
                        <Typography variant="body2">Timestamp: {new Date(block.timestamp).toLocaleString()}</Typography>
                        <Typography variant="body2">Previous Hash: {block.previousHash.substring(0, 20)}...</Typography>
                        <Typography variant="body2">Hash: {block.hash.substring(0, 20)}...</Typography>
                        <Typography variant="body2">Merkle Root: {block.merkleRoot.substring(0, 20)}...</Typography>
                        <Typography variant="body2">Nonce: {block.nonce}</Typography>
                        <Typography variant="body2">Transactions: {block.transactions.length}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Pending Transactions</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Sender</TableCell>
                          <TableCell>Receiver</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Timestamp</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {blockchain.pendingTransactions.map((tx, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{tx.sender?.substring(0, 10)}...</TableCell>
                            <TableCell>{tx.receiver?.substring(0, 10)}...</TableCell>
                            <TableCell>{tx.amount}</TableCell>
                            <TableCell>{new Date(tx.timestamp).toLocaleTimeString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Mining Analysis</Typography>
                  <Box sx={{ mb: 4 }}>
                    <Line data={miningChartData} options={{
                      responsive: true,
                      plugins: { title: { display: true, text: 'Mining Time vs Difficulty Level' }},
                      scales: {
                        y: { title: { display: true, text: 'Mining Time (seconds)' }},
                        y1: {
                          position: 'right',
                          title: { display: true, text: 'Difficulty Level' },
                          grid: { drawOnChartArea: false }
                        }
                      }
                    }} />
                  </Box>
                  <Typography variant="h6" gutterBottom>Blockchain Growth</Typography>
                  <Bar data={blockchainGrowthData} options={{
                    responsive: true,
                    plugins: { title: { display: true, text: 'Transaction Count per Block' }}
                  }} />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;