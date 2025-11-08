import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { ethers } from 'ethers';
import './Wallet.css';
import Menu from "../../assets/Menu/Menu";
import { walletService } from "./Components/Services/walletService";
import { appKit } from "../../config/appkit-config";
import { tronService } from "./Components/Services/tronService";

// Импорт компонентов
import WalletHeader from "./Components/WalletHeader/WalletHeader";
import BalanceDisplay from "./Components/BalanceDisplay/BalanceDisplay";
import WalletList from "./Components/WalletList/WalletList";
import WalletSelector from "./Components/WalletSelector/WalletSelector";
import ConnectWalletModal from "./Components/ConnectWalletModal/ConnectWalletModal";
import QRScanner from "./Components/QRScanner/QRScanner";

const UPDATE_WALLETS_URL = 'https://cryptopayappbackend.netlify.app/.netlify/functions/update-wallets';

function Wallet({ userData, updateUserData }) {
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  const [connectedWallets, setConnectedWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);

  // Хуки для разных блокчейнов
  const tonAddress = useTonAddress();
  const { address: ethAddress, isConnected: isEthConnected } = useAccount();
  const { disconnect: disconnectEth } = useDisconnect();
  const { connect: connectEth } = useConnect();
  const { connected: isSolConnected, disconnect: disconnectSol, publicKey: solPublicKey, wallet: solWallet } = useWallet();
  const { connection: solConnection } = useConnection();
  const [tonConnectUI] = useTonConnectUI();

  // Функция для обновления кошельков в базе данных
  const updateWalletsInDatabase = async (walletsArray) => {
    const userId = userData?.telegram_user_id;

    if (!userId) {
        console.log("User ID not found, cannot update wallets.");
        return false;
    }

    try {
        const response = await fetch(UPDATE_WALLETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telegramUserId: userId,
                wallets: walletsArray
            }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error(`Failed to update wallets: ${data.error}`);
        
        console.log("Wallets successfully updated in database");
        return true;
    } catch (error) {
        console.error("Error updating wallets:", error);
        toast.error("Ошибка обновления кошельков в базе данных");
        return false;
    }
  };

  // Загрузка подключенных кошельков
  const loadConnectedWallets = () => {
    const wallets = walletService.getConnectedWallets();
    const currentSelectedWallet = walletService.getSelectedWallet();
    
    console.log("Loading connected wallets:", wallets);
    console.log("Selected wallet:", currentSelectedWallet);
    
    setConnectedWallets(wallets);
    setSelectedWallet(currentSelectedWallet);
    setTotalBalance(walletService.getTotalBalance());
  };

  // Загрузка при монтировании
  useEffect(() => {
    loadConnectedWallets();
  }, []);

  // Обработка подключений через Reown Cloud (Ethereum, Solana, Bitcoin)
  useEffect(() => {
    const handleReownConnections = async () => {
      console.log("Checking Reown connections...");
      
      // Проверяем Ethereum
      if (isEthConnected && ethAddress) {
        console.log("Ethereum connected:", ethAddress);
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await walletService.updateWallet('ethereum', { address: ethAddress, provider });
          await updateWalletsInDatabase(walletService.getWalletsForDatabase());
          loadConnectedWallets();
        } catch (error) {
          console.error("Ошибка подключения Ethereum:", error);
        }
      }

      // Проверяем Solana
      if (isSolConnected && solPublicKey) {
        console.log("Solana connected:", solPublicKey.toString());
        try {
          await walletService.updateWallet('solana', { 
            publicKey: solPublicKey, 
            connection: solConnection 
          });
          await updateWalletsInDatabase(walletService.getWalletsForDatabase());
          loadConnectedWallets();
        } catch (error) {
          console.error("Ошибка подключения Solana:", error);
        }
      }
    };

    handleReownConnections();
  }, [tonAddress, ethAddress, isEthConnected, isSolConnected, solPublicKey]);

  // Обработка подключения TON через TonConnect
  useEffect(() => {
    const handleTONConnection = async () => {
      if (tonAddress) {
        console.log("TON connected:", tonAddress);
        try {
          await walletService.updateWallet('ton', { address: tonAddress });
          await updateWalletsInDatabase(walletService.getWalletsForDatabase());
          loadConnectedWallets();
        } catch (error) {
          console.error("Ошибка подключения TON:", error);
        }
      }
    };

    handleTONConnection();
  }, [tonAddress]);

  const handleSelectWallet = () => {
    setShowWalletSelector(true);
  };

  const handleScanQR = () => {
    setShowQRScanner(true);
    toast.info("Сканирование QR-кода");
  };

  const handleConnectWallet = () => {
    setShowConnectWallet(true);
  };

  const handleWalletConnection = async (blockchain) => {
    try {
      switch (blockchain) {
        case 'ethereum':
          console.log("Opening Reown for Ethereum");
          appKit.open();
          break;
          
        case 'solana':
          console.log("Opening Reown for Solana");
          appKit.open();
          break;
          
        case 'tron':
          console.log("Connecting Tron wallet via TronLink");
          const tronWallet = await tronService.connectTron();
          
          if (tronWallet) {
            await walletService.updateWallet('tron', tronWallet);
            await updateWalletsInDatabase(walletService.getWalletsForDatabase());
            toast.success("Tron кошелек подключен");
            loadConnectedWallets();
          }
          break;
          
        case 'ton':
          console.log("Connecting TON wallet");
          tonConnectUI.openModal();
          break;
          
        case 'bitcoin':
          console.log("Opening Reown for Bitcoin");
          appKit.open();
          break;
          
        default:
          throw new Error(`Неподдерживаемый блокчейн: ${blockchain}`);
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error(`Ошибка подключения: ${error.message}`);
    }
  };

  const handleDisconnectWallet = async (walletId) => {
    const wallet = connectedWallets.find(w => w.id === walletId);
    
    if (wallet) {
      switch (wallet.blockchain) {
        case 'ethereum':
          disconnectEth();
          break;
        case 'solana':
          disconnectSol();
          break;
        case 'ton':
          tonConnectUI.disconnect();
          break;
        case 'tron':
          // Для Tron просто удаляем из хранилища
          tronService.disconnectTron();
          break;
      }
    }
    
    walletService.disconnectWallet(walletId);
    await updateWalletsInDatabase(walletService.getWalletsForDatabase());
    toast.info("Кошелек отключен");
    loadConnectedWallets();
  };

  const handleWalletSelection = async (walletId) => {
    const success = walletService.setSelectedWallet(walletId);
    if (success) {
      setSelectedWallet(walletService.getSelectedWallet());
      await updateWalletsInDatabase(walletService.getWalletsForDatabase());
      loadConnectedWallets();
    }
  };

  // Периодическая проверка состояния кошельков
  useEffect(() => {
    const interval = setInterval(() => {
      loadConnectedWallets();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <div className="black">
        <WalletHeader 
          onSelectWallet={handleSelectWallet}
          onScanQR={handleScanQR}
          avatar={userData?.avatar}
          firstName={userData?.first_name}
          username={userData?.username}
          telegramUserId={userData?.telegram_user_id}
        />

        <BalanceDisplay 
          balance={totalBalance} 
          onConnectWallet={handleConnectWallet}
          userData={userData}
        />
      </div>

      <WalletList 
        connectedWallets={connectedWallets}
        selectedWallet={selectedWallet}
        onDisconnectWallet={handleDisconnectWallet}
        userData={userData}
      />

      <div className="safe-area-bottom" />

      <WalletSelector
        open={showWalletSelector}
        onOpenChange={setShowWalletSelector}
        connectedWallets={connectedWallets}
        selectedWallet={selectedWallet}
        onSelect={handleWalletSelection}
        userData={userData}
      />

      <ConnectWalletModal
        open={showConnectWallet}
        onOpenChange={setShowConnectWallet}
        onConnectWallet={handleWalletConnection}
        connectedWallets={connectedWallets}
        userData={userData}
      />

      <QRScanner
        open={showQRScanner}
        onOpenChange={setShowQRScanner}
        userData={userData}
      />

      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'sonner-toast',
          duration: 3000,
        }}
      />

      <Menu userData={userData} />
    </div>
  );
}

export default Wallet;