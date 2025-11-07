import { createConfig } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { getDefaultConfig } from 'connectkit';

export const client = createConfig(
  getDefaultConfig({
    appName: 'MultiChain Wallet',
    alchemyId: process.env.ALCHEMY_ID,
    walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID,
    chains: [mainnet, polygon],
  })
);