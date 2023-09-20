'use client';

import './globals.css';
import { Poppins } from 'next/font/google';

import { Flex, Box } from '@chakra-ui/react';
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

import { Header } from './shared/Header';
import { Footer } from './shared/Footer';
import { Providers } from './providers';

const poppins = Poppins({ subsets: ['latin'], weight: '500' });

const chains = [mainnet, sepolia];
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID;

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={poppins.className}>
        <Providers>
          <WagmiConfig config={wagmiConfig}>
            <Box>
              <Flex
                direction='column'
                maxW='90rem'
                minH='100vh'
                mx='auto'
                pt='2rem'
                px={{ lg: '4rem', sm: '2rem' }}
              >
                <Header />
                {children}
                <Footer />
              </Flex>
            </Box>
          </WagmiConfig>
          <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
        </Providers>
      </body>
    </html>
  );
}
