class TronService {
  constructor() {
    this.tronWeb = null;
    this.isConnected = false;
    this.address = null;
    this.init();
  }

  // Инициализация TronWeb
  async init() {
    if (typeof window === 'undefined') return null;

    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;
      
      const checkTronWeb = () => {
        attempts++;
        
        if (window.tronWeb && window.tronWeb.ready) {
          this.tronWeb = window.tronWeb;
          this.isConnected = true;
          this.address = this.tronWeb.defaultAddress?.base58;
          console.log('TronWeb инициализирован успешно');
          resolve(this.tronWeb);
        } else if (attempts < maxAttempts) {
          setTimeout(checkTronWeb, 100);
        } else {
          console.log('TronWeb не доступен');
          reject(new Error('TronWeb не доступен'));
        }
      };
      
      checkTronWeb();
    });
  }

  // Подключение Tron кошелька через TronLink
  async connectTron() {
    try {
      // Проверяем наличие TronLink
      if (typeof window === 'undefined' || !window.tronLink) {
        const shouldInstall = window.confirm(
          'TronLink не установлен. Хотите перейти на страницу установки?'
        );
        if (shouldInstall) {
          window.open('https://www.tronlink.org/', '_blank');
        }
        throw new Error('TronLink не установлен. Пожалуйста, установите расширение TronLink.');
      }

      // Запрашиваем подключение через TronLink
      if (window.tronLink.request) {
        const result = await window.tronLink.request({ method: 'tron_requestAccounts' });
        console.log('TronLink connection result:', result);
        
        if (result.code === 4000) {
          throw new Error('Пользователь отклонил запрос на подключение');
        }
      }

      // Ждем инициализации TronWeb
      await this.init();

      // Проверяем, что TronWeb инициализирован и есть адрес
      if (!this.tronWeb || !this.tronWeb.defaultAddress) {
        throw new Error('Не удалось инициализировать TronWeb');
      }

      const address = this.tronWeb.defaultAddress.base58;
      if (!address) {
        throw new Error('Не удалось получить адрес кошелька Tron');
      }

      // Получаем баланс через TronWeb
      const balance = await this.tronWeb.trx.getBalance(address);
      const balanceInTRX = this.tronWeb.fromSun(balance);

      console.log(`Tron баланс: ${balanceInTRX} TRX для адреса: ${address}`);

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
      console.error('Tron connection error:', error);
      if (error.code === 4000 || error.code === 4001) {
        throw new Error('Пользователь отклонил запрос на подключение TronLink.');
      }
      throw new Error(`Ошибка подключения Tron: ${error.message}`);
    }
  }

  // Отключение Tron кошелька
  disconnectTron() {
    this.tronWeb = null;
    this.isConnected = false;
    this.address = null;
    console.log('Tron кошелек отключен');
  }

  // Получение баланса Tron
  async getBalance() {
    if (!this.tronWeb || !this.address) {
      throw new Error('Tron кошелек не подключен');
    }

    try {
      const balance = await this.tronWeb.trx.getBalance(this.address);
      return this.tronWeb.fromSun(balance);
    } catch (error) {
      throw new Error(`Ошибка получения баланса: ${error.message}`);
    }
  }

  // Подписание транзакции Tron
  async signTransaction(transaction) {
    if (!this.tronWeb || !this.address) {
      throw new Error('Tron кошелек не подключен');
    }

    try {
      const signedTransaction = await this.tronWeb.trx.sign(transaction);
      return signedTransaction;
    } catch (error) {
      throw new Error(`Ошибка подписания транзакции: ${error.message}`);
    }
  }

  // Отправка транзакции Tron
  async sendTransaction(to, amount, options = {}) {
    if (!this.tronWeb || !this.address) {
      throw new Error('Tron кошелек не подключен');
    }

    try {
      const transaction = await this.tronWeb.transactionBuilder.sendTrx(
        to,
        this.tronWeb.toSun(amount),
        this.address,
        options
      );
      
      const signedTransaction = await this.signTransaction(transaction);
      const result = await this.tronWeb.trx.sendRawTransaction(signedTransaction);
      
      return result;
    } catch (error) {
      throw new Error(`Ошибка отправки транзакции: ${error.message}`);
    }
  }

  // Проверка подключения Tron
  checkConnection() {
    return this.isConnected && this.tronWeb && this.tronWeb.ready;
  }

  // Получение текущего адреса
  getCurrentAddress() {
    return this.address;
  }

  // Получение информации о сети
  getNetwork() {
    if (!this.tronWeb) return null;
    
    return {
      fullNode: this.tronWeb.fullNode.host,
      solidityNode: this.tronWeb.solidityNode?.host,
      eventServer: this.tronWeb.eventServer?.host
    };
  }
}

export const tronService = new TronService();