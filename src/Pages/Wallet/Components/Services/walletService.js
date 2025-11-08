// walletService.js
import { ethers } from 'ethers';

class MultiChainWalletService {
  constructor() {
    this.connectedWallets = this.loadFromStorage();
    this.selectedWallet = this.loadSelectedWallet();
  }

  loadFromStorage() {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('multichain_connected_wallets');
    return stored ? JSON.parse(stored) : [];
  }

  loadSelectedWallet() {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('selectedWallet');
    return stored ? JSON.parse(stored) : null;
  }

  saveToStorage() {
    localStorage.setItem('multichain_connected_wallets', JSON.stringify(this.connectedWallets));
    if (this.selectedWallet) {
      localStorage.setItem('selectedWallet', JSON.stringify(this.selectedWallet));
    } else {
      localStorage.removeItem('selectedWallet');
    }
  }

  // Подключение Ethereum кошелька через Reown
  async connectEthereum(address, provider) {
    try {
      const balance = await provider.getBalance(address);
      
      return {
        id: `eth_${address}`,
        blockchain: 'ethereum',
        name: 'Ethereum Wallet',
        symbol: 'ETH',
        address: address,
        balance: ethers.formatEther(balance),
        isConnected: true,
        connectedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Ошибка подключения Ethereum: ${error.message}`);
    }
  }

  // Подключение Solana кошелька через Reown
  async connectSolana(publicKey, connection) {
    try {
      // Используем базовый JavaScript для работы с Solana через Reown
      // connection должен быть предоставлен через Reown Cloud
      const balance = await connection.getBalance(publicKey);
      
      return {
        id: `sol_${publicKey.toString()}`,
        blockchain: 'solana',
        name: 'Solana Wallet',
        symbol: 'SOL',
        address: publicKey.toString(),
        balance: (balance / 1e9).toString(), // Конвертация lamports в SOL
        isConnected: true,
        connectedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Ошибка подключения Solana: ${error.message}`);
    }
  }

  // Подключение TON кошелька через TonConnect
  async connectTON(address) {
    try {
      // Mock баланс для демонстрации
      const mockBalance = (Math.random() * 10).toFixed(4);
      
      return {
        id: `ton_${address}`,
        blockchain: 'ton',
        name: 'TON Wallet',
        symbol: 'TON',
        address: address,
        balance: mockBalance,
        isConnected: true,
        connectedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Ошибка подключения TON: ${error.message}`);
    }
  }

  // Подключение Bitcoin кошелька через Reown
  async connectBitcoin() {
    try {
      // Для Bitcoin используем mock данные
      const mockAddress = `bc1${Array(12).fill(0).map(() => 
        Math.random().toString(36).charAt(2)).join('')}`;
      const mockBalance = (Math.random() * 0.1).toFixed(6);
      
      return {
        id: `btc_${Date.now()}`,
        blockchain: 'bitcoin',
        name: 'Bitcoin Wallet',
        symbol: 'BTC',
        address: mockAddress,
        balance: mockBalance,
        isConnected: true,
        connectedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Ошибка подключения Bitcoin: ${error.message}`);
    }
  }

  // Обновление кошелька
  async updateWallet(blockchain, data) {
    try {
      let walletData;
      
      switch (blockchain) {
        case 'ethereum':
          walletData = await this.connectEthereum(data.address, data.provider);
          break;
        case 'solana':
          walletData = await this.connectSolana(data.publicKey, data.connection);
          break;
        case 'ton':
          walletData = await this.connectTON(data.address);
          break;
        case 'tron':
          // Для Tron используем готовые данные из tronService
          walletData = data;
          break;
        case 'bitcoin':
          walletData = await this.connectBitcoin();
          break;
        default:
          throw new Error(`Неподдерживаемый блокчейн: ${blockchain}`);
      }

      const connectedWallet = {
        ...walletData,
        connectedAt: new Date().toISOString(),
        isConnected: true
      };

      const existingIndex = this.connectedWallets.findIndex(
        w => w.blockchain === blockchain && w.address === walletData.address
      );

      if (existingIndex >= 0) {
        this.connectedWallets[existingIndex] = connectedWallet;
      } else {
        this.connectedWallets.push(connectedWallet);
      }

      if (!this.selectedWallet) {
        this.selectedWallet = connectedWallet;
      }

      this.saveToStorage();
      return connectedWallet;
    } catch (error) {
      console.error(`Error updating ${blockchain} wallet:`, error);
      throw error;
    }
  }

  // Установка выбранного кошелька
  setSelectedWallet(walletId) {
    const wallet = this.connectedWallets.find(w => w.id === walletId);
    if (wallet) {
      this.selectedWallet = wallet;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Получение выбранного кошелька
  getSelectedWallet() {
    return this.selectedWallet;
  }

  // Отключение кошелька
  disconnectWallet(walletId) {
    this.connectedWallets = this.connectedWallets.filter(w => w.id !== walletId);
    
    if (this.selectedWallet && this.selectedWallet.id === walletId) {
      this.selectedWallet = this.connectedWallets.length > 0 ? this.connectedWallets[0] : null;
    }
    
    this.saveToStorage();
  }

  getBalanceInRub(balance, symbol) {
    const rates = {
      ETH: 250000,
      SOL: 12000,
      TON: 150,
      TRX: 8,
      BTC: 3500000
    };
    return parseFloat(balance) * (rates[symbol] || 1000);
  }

  getConnectedWallets() {
    return this.connectedWallets.map(wallet => ({
      ...wallet,
      balanceInRub: this.getBalanceInRub(wallet.balance, wallet.symbol),
      icon: this.getWalletIcon(wallet.blockchain)
    }));
  }

  getTotalBalance() {
    return this.getConnectedWallets().reduce((total, wallet) => total + wallet.balanceInRub, 0);
  }

  getWalletIcon(blockchain) {
    const icons = {
      ethereum: '/eth.svg',
      solana: '/sol.svg',
      ton: '/ton.svg',
      tron: '/tron.svg',
      bitcoin: '/btc.svg'
    };
    return icons[blockchain] || '/crypto.svg';
  }

  // Метод для получения формата кошельков для базы данных
  getWalletsForDatabase() {
    return this.connectedWallets.map(wallet => ({
      blockchain: wallet.blockchain,
      address: wallet.address,
      symbol: wallet.symbol,
      balance: wallet.balance,
      connectedAt: wallet.connectedAt,
      isConnected: wallet.isConnected
    }));
  }
}

export const walletService = new MultiChainWalletService();