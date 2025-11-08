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

  // Подключение Ethereum через MetaMask
  async connectEthereum() {
    try {
      // Проверяем наличие MetaMask
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask не установлен. Пожалуйста, установите расширение MetaMask.');
      }

      // Запрашиваем подключение аккаунтов
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('Пользователь отклонил запрос на подключение.');
      }

      const address = accounts[0];
      
      // Получаем баланс
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const balanceInETH = ethers.formatEther(balance);

      return {
        id: `eth_${address}`,
        blockchain: 'ethereum',
        name: 'Ethereum Wallet',
        symbol: 'ETH',
        address: address,
        balance: balanceInETH,
        isConnected: true,
        connectedAt: new Date().toISOString()
      };
    } catch (error) {
      if (error.code === 4001) {
        throw new Error('Пользователь отклонил запрос на подключение MetaMask.');
      }
      throw new Error(`Ошибка подключения Ethereum: ${error.message}`);
    }
  }

  // Подключение Solana через Phantom
  async connectSolana() {
    try {
      // Проверяем наличие Phantom
      if (typeof window === 'undefined' || !window.phantom?.solana) {
        throw new Error('Phantom не установлен. Пожалуйста, установите расширение Phantom Wallet.');
      }

      const provider = window.phantom.solana;
      
      // Запрашиваем подключение
      const response = await provider.connect();
      const publicKey = response.publicKey.toString();

      // Получаем баланс (используем публичный RPC)
      const connectionUrl = 'https://api.mainnet-beta.solana.com';
      const balanceResponse = await fetch(connectionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [publicKey],
        }),
      });

      const balanceData = await balanceResponse.json();
      const balanceInLamports = balanceData.result?.value || 0;
      const balanceInSOL = (balanceInLamports / 1e9).toString();

      return {
        id: `sol_${publicKey}`,
        blockchain: 'solana',
        name: 'Solana Wallet',
        symbol: 'SOL',
        address: publicKey,
        balance: balanceInSOL,
        isConnected: true,
        connectedAt: new Date().toISOString()
      };
    } catch (error) {
      if (error.code === 4001) {
        throw new Error('Пользователь отклонил запрос на подключение Phantom.');
      }
      throw new Error(`Ошибка подключения Solana: ${error.message}`);
    }
  }

  // Подключение TON через TonConnect
  async connectTON(address) {
    try {
      // Mock баланс - в реальном приложении нужно получать через TON API
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

  // Подключение Tron через TronLink
  async connectTron() {
    try {
      // Проверяем наличие TronLink
      if (typeof window === 'undefined' || !window.tronLink) {
        throw new Error('TronLink не установлен. Пожалуйста, установите расширение TronLink.');
      }

      // Запрашиваем подключение
      if (window.tronLink.request) {
        const result = await window.tronLink.request({ method: 'tron_requestAccounts' });
        
        if (result.code === 4000) {
          throw new Error('Пользователь отклонил запрос на подключение.');
        }
      }

      // Ждем инициализации TronWeb
      await new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 30;
        
        const checkTronWeb = () => {
          attempts++;
          
          if (window.tronWeb && window.tronWeb.ready) {
            resolve(window.tronWeb);
          } else if (attempts < maxAttempts) {
            setTimeout(checkTronWeb, 100);
          } else {
            reject(new Error('TronWeb не доступен'));
          }
        };
        
        checkTronWeb();
      });

      if (!window.tronWeb || !window.tronWeb.defaultAddress) {
        throw new Error('Не удалось инициализировать TronWeb');
      }

      const address = window.tronWeb.defaultAddress.base58;
      if (!address) {
        throw new Error('Не удалось получить адрес кошелька Tron');
      }

      // Получаем баланс
      const balance = await window.tronWeb.trx.getBalance(address);
      const balanceInTRX = window.tronWeb.fromSun(balance);

      return {
        id: `trx_${address}`,
        blockchain: 'tron',
        name: 'Tron Wallet',
        symbol: 'TRX',
        address: address,
        balance: balanceInTRX.toString(),
        isConnected: true,
        connectedAt: new Date().toISOString()
      };
    } catch (error) {
      if (error.code === 4000 || error.code === 4001) {
        throw new Error('Пользователь отклонил запрос на подключение TronLink.');
      }
      throw new Error(`Ошибка подключения Tron: ${error.message}`);
    }
  }

  // Обновление кошелька
  async updateWallet(blockchain, data) {
    try {
      let walletData;
      
      switch (blockchain) {
        case 'ethereum':
          walletData = data; // Уже подключен через connectEthereum
          break;
        case 'solana':
          walletData = data; // Уже подключен через connectSolana
          break;
        case 'ton':
          walletData = await this.connectTON(data.address);
          break;
        case 'tron':
          walletData = data; // Уже подключен через connectTron
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