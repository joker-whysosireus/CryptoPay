import { ethers } from 'ethers';
import { Connection, clusterApiUrl } from '@solana/web3.js';

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

  // Подключение Ethereum кошелька
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
        isConnected: true
      };
    } catch (error) {
      throw new Error(`Ошибка подключения Ethereum: ${error.message}`);
    }
  }

  // Подключение Solana кошелька
  async connectSolana(publicKey, connection) {
    try {
      const balance = await connection.getBalance(publicKey);
      
      return {
        id: `sol_${publicKey.toString()}`,
        blockchain: 'solana',
        name: 'Solana Wallet',
        symbol: 'SOL',
        address: publicKey.toString(),
        balance: (balance / 1e9).toString(),
        isConnected: true
      };
    } catch (error) {
      throw new Error(`Ошибка подключения Solana: ${error.message}`);
    }
  }

  // Подключение TON кошелька
  async connectTON(address) {
    try {
      const mockBalance = (Math.random() * 10).toFixed(4);
      
      return {
        id: `ton_${address}`,
        blockchain: 'ton',
        name: 'TON Wallet',
        symbol: 'TON',
        address: address,
        balance: mockBalance,
        isConnected: true
      };
    } catch (error) {
      throw new Error(`Ошибка подключения TON: ${error.message}`);
    }
  }

  // Подключение Tron кошелька
  async connectTron() {
    return new Promise((resolve, reject) => {
      const checkTronConnection = () => {
        try {
          // Проверяем наличие TronLink
          if (window.tronWeb && window.tronWeb.defaultAddress && window.tronWeb.defaultAddress.base58) {
            const address = window.tronWeb.defaultAddress.base58;
            window.tronWeb.trx.getBalance(address)
              .then(balance => {
                resolve({
                  id: `trx_${address}`,
                  blockchain: 'tron',
                  name: 'Tron Wallet',
                  symbol: 'TRX',
                  address: address,
                  balance: (balance / 1e6).toString(),
                  isConnected: true
                });
              })
              .catch(error => reject(new Error(`Ошибка получения баланса Tron: ${error.message}`)));
          } else {
            // Если TronLink установлен, но не подключен, запрашиваем подключение
            if (window.tronLink && window.tronLink.request) {
              window.tronLink.request({ method: 'tron_requestAccounts' })
                .then(() => {
                  // Даем время на обработку запроса
                  setTimeout(() => {
                    if (window.tronWeb && window.tronWeb.defaultAddress && window.tronWeb.defaultAddress.base58) {
                      const address = window.tronWeb.defaultAddress.base58;
                      window.tronWeb.trx.getBalance(address)
                        .then(balance => {
                          resolve({
                            id: `trx_${address}`,
                            blockchain: 'tron',
                            name: 'Tron Wallet',
                            symbol: 'TRX',
                            address: address,
                            balance: (balance / 1e6).toString(),
                            isConnected: true
                          });
                        })
                        .catch(error => reject(new Error(`Ошибка получения баланса Tron: ${error.message}`)));
                    } else {
                      reject(new Error('Пожалуйста, разрешите доступ к аккаунту в TronLink'));
                    }
                  }, 1000);
                })
                .catch(error => {
                  reject(new Error(`Ошибка запроса подключения TronLink: ${error.message}`));
                });
            } else {
              // TronLink не установлен
              const shouldInstall = window.confirm(
                'TronLink не установлен. Хотите перейти на страницу установки?'
              );
              if (shouldInstall) {
                window.open('https://www.tronlink.org/', '_blank');
              }
              reject(new Error('TronLink не установлен. Пожалуйста, установите расширение TronLink.'));
            }
          }
        } catch (error) {
          reject(new Error(`Ошибка подключения Tron: ${error.message}`));
        }
      };

      // Если tronWeb уже готов, подключаем сразу
      if (window.tronWeb && window.tronWeb.ready) {
        checkTronConnection();
      } else {
        // Ждем пока tronWeb будет готов
        setTimeout(checkTronConnection, 1000);
      }
    });
  }

  // Подключение Bitcoin кошелька
  async connectBitcoin() {
    try {
      // Для Bitcoin используем Web3Modal или другие кошельки, поддерживающие Bitcoin
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length > 0) {
          const address = accounts[0];
          const btcAddress = `bc1${address.slice(2).toLowerCase()}`;
          const mockBalance = (Math.random() * 0.1).toFixed(6);
          
          return {
            id: `btc_${address}`,
            blockchain: 'bitcoin',
            name: 'Bitcoin Wallet',
            symbol: 'BTC',
            address: btcAddress,
            balance: mockBalance,
            isConnected: true
          };
        }
      }
      
      // Если нет доступных кошельков, создаем mock данные
      const mockAddress = `bc1${Array(12).fill(0).map(() => Math.random().toString(36).charAt(2)).join('')}`;
      const mockBalance = (Math.random() * 0.1).toFixed(6);
      
      return {
        id: `btc_${Date.now()}`,
        blockchain: 'bitcoin',
        name: 'Bitcoin Wallet',
        symbol: 'BTC',
        address: mockAddress,
        balance: mockBalance,
        isConnected: true
      };
    } catch (error) {
      throw new Error(`Ошибка подключения Bitcoin: ${error.message}`);
    }
  }

  // Определение типа кошелька по адресу и провайдеру
  detectWalletType(address, provider) {
    if (window.trustWallet && window.trustWallet.isTrust) {
      return 'solana';
    }
    
    if (window.ethereum && window.ethereum.isMetaMask) {
      return 'ethereum';
    }
    
    if (window.solana && window.solana.isPhantom) {
      return 'solana';
    }
    
    if (window.tronWeb && window.tronWeb.defaultAddress) {
      return 'tron';
    }
    
    return 'ethereum';
  }

  // Универсальное подключение кошелька
  async connectUniversalWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length > 0) {
          const address = accounts[0];
          const walletType = this.detectWalletType(address, window.ethereum);
          const provider = new ethers.BrowserProvider(window.ethereum);
          
          switch (walletType) {
            case 'ethereum':
              return await this.connectEthereum(address, provider);
            case 'solana':
              const connection = new Connection(clusterApiUrl('mainnet-beta'));
              return await this.connectSolana({ toString: () => address }, connection);
            default:
              return await this.connectEthereum(address, provider);
          }
        }
      } catch (error) {
        throw new Error(`Ошибка подключения кошелька: ${error.message}`);
      }
    }
    
    throw new Error('Не найден поддерживаемый кошелек');
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
          walletData = await this.connectTron();
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
      this.selectedWallet = null;
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
    return Math.floor(parseFloat(balance) * (rates[symbol] || 1000));
  }

  getConnectedWallets() {
    return this.connectedWallets.map(wallet => ({
      ...wallet,
      balanceInRub: this.getBalanceInRub(wallet.balance, wallet.symbol),
      icon: this.getWalletIcon(wallet.blockchain)
    }));
  }

  getTotalBalance() {
    if (this.selectedWallet) {
      return this.getBalanceInRub(this.selectedWallet.balance, this.selectedWallet.symbol);
    }
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

  // Метод для сброса всех данных
  resetStorage() {
    this.connectedWallets = [];
    this.selectedWallet = null;
    localStorage.removeItem('multichain_connected_wallets');
    localStorage.removeItem('selectedWallet');
  }
}

export const walletService = new MultiChainWalletService();