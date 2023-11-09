'use client';

import { useState } from 'react';

import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Text,
  SimpleGrid,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Button,
  VStack
} from '@chakra-ui/react';

import { ArrowRightCircle } from 'lucide-react';

import { useNetwork } from 'wagmi';

import { SYSTEM_COIN_ADDRESS, blockExplorerBaseUrl } from './utils/contracts';
import { getAccountString } from './utils/helpers';

import { RedeemBox } from './components/RedeemBox';
import { WithdrawCollateral } from './components/WithdrawCollateral';

import { useGeb } from './hooks/useGeb';
import { BalanceDisplay } from './components/BalanceDisplay';
import { tokenTickers } from '@/app/utils/contracts';

export default function Home() {
  const { chain } = useNetwork();

  const [safeId, setSafeId] = useState(0);

  const {
    updateSafeId,
    safeOwner,
    lockedCollateralAmount,
    generatedDebtAmount,
    proxyAddress,
    shutdownTime,
    proxiedCollateralWithdraw,
    proxiedPrepareSystemCoins,
    proxiedRedeemSystemCoins,
    approveSystemCoin,
    approvedSystemCoin,
    systemCoinBalance,
    collateralBalance,
    redeemableCoinBalance,
    collateralCashPrice,
    outstandingCoinSupply,
    txReceiptPending
  } = useGeb();

  return (
    <Flex direction='column'>
      <Flex direction='column'>
        {/* <Text fontSize={{ lg: '24px', sm: '18px' }} mb='1rem'>
          Global Settlement
        </Text> */}
        <Text fontSize={{ lg: '16px', sm: '14px' }} maxW='800px' opacity='0.7'>
          In case of an emergency protocol shutdown, you can withdraw any excess
          collateral & redeem system coins below.
        </Text>
      </Flex>

      <SimpleGrid columns='3' gap='5' my='2rem'>
        <Flex
          direction='column'
          mr={{ lg: '2rem', sm: 0 }}
          alignItems='left'
          justifyContent='center'
        >
          <Text
            fontSize={{ lg: '28px', sm: '18px' }}
            mb='.5rem'
            background='linear-gradient(to right, #41c1d0, #1a6c51)'
            backgroundClip='text'
            fontWeight='extrabold'
          >
            {shutdownTime &&
              new Date(Number(shutdownTime) * 1000).toDateString()}
          </Text>
          <Text fontSize={{ lg: '14px', sm: '12px' }} fontWeight='bold'>
            Shutdown Triggered Time
          </Text>
        </Flex>

        <Flex
          direction='column'
          mr={{ lg: '2rem', sm: 0 }}
          alignItems='left'
          justifyContent='center'
        >
          <Text
            fontSize={{ lg: '28px', sm: '18px' }}
            mb='.5rem'
            background='linear-gradient(to right, #41c1d0, #1a6c51)'
            backgroundClip='text'
            fontWeight='extrabold'
          >
            {getAccountString(proxyAddress)}
          </Text>

          <Text
            fontSize={{ lg: '14px', sm: '12px' }}
            fontWeight='bold'
            onClick={() =>
              window.open(
                `${
                  blockExplorerBaseUrl[chain?.id]
                }/address/${proxyAddress.toString()}`,
                '_blank'
              )
            }
            textDecoration='underline'
            cursor='pointer'
          >
            Your Proxy
          </Text>
        </Flex>
      </SimpleGrid>

      <Flex direction='column'>
        {!chain ? (
          <Text
            mt='4rem'
            mx='auto'
            opacity='0.7'
            fontSize={{ lg: '14px', sm: '12px' }}
          >
            Connect your wallet to proceed
          </Text>
        ) : (
          <>
            {shutdownTime > 0 && (
              <Flex mt='2rem' alignItems='baseline'>
                <HStack w='400px' spacing={5}>
                  <InputGroup borderColor='#41c1d0'>
                    <InputLeftAddon
                      children='SAFE ID'
                      color='black'
                      background='#41c1d0'
                      fontWeight='bold'
                      border='none'
                    />
                    <Input
                      onChange={(e) => setSafeId(e.target.value)}
                      placeholder='0'
                      border='none'
                      bg='#232D3F'
                    />
                  </InputGroup>
                  <Button
                    background='#41c1d0'
                    color='black'
                    _hover={{ opacity: 0.7 }}
                    onClick={() => {
                      updateSafeId(safeId);
                    }}
                    px='2rem'
                  >
                    Search
                  </Button>
                </HStack>
              </Flex>
            )}

            {shutdownTime > 0 && proxyAddress !== safeOwner && (
              <Text
                mt='4rem'
                mx='auto'
                opacity='0.7'
                fontSize={{ lg: '14px', sm: '12px' }}
              >
                Connected proxy is not the owner of safe #{safeId}
              </Text>
            )}

            {shutdownTime > 0 && proxyAddress === safeOwner && (
              <>
                <SimpleGrid columns='3' gap='5' mb='2rem' mt='3rem'>
                  <VStack spacing={4} mb={4} align='stretch'>
                    <BalanceDisplay
                      amount={collateralBalance}
                      label='Collateral Balance'
                      symbol={tokenTickers[chain?.id]?.collateral}
                      borderColor='#41c1d0'
                    />
                    <BalanceDisplay
                      amount={systemCoinBalance}
                      label='System Coin Balance'
                      symbol={tokenTickers[chain?.id]?.systemcoin}
                      borderColor='#41c1d0'
                    />
                    <BalanceDisplay
                      amount={redeemableCoinBalance}
                      label='Redeemable Coin Balance'
                      symbol={tokenTickers[chain?.id]?.systemcoin}
                      borderColor='#41c1d0'
                    />
                  </VStack>
                  <VStack spacing={4} mb={4} align='stretch'>
                    <BalanceDisplay
                      amount={lockedCollateralAmount}
                      label='Locked Collateral'
                      symbol={tokenTickers[chain?.id]?.collateral}
                      borderColor='#41c1d0'
                    />
                    <BalanceDisplay
                      amount={approvedSystemCoin}
                      label='Approved System Coin'
                      symbol={tokenTickers[chain?.id]?.systemcoin}
                      borderColor='#41c1d0'
                    />
                    <BalanceDisplay
                      amount={generatedDebtAmount}
                      label='Generated Debt'
                      symbol={tokenTickers[chain?.id]?.systemcoin}
                      borderColor='#41c1d0'
                    />
                  </VStack>
                  <VStack spacing={4} mb={4} align='stretch'>
                    <BalanceDisplay
                      amount={outstandingCoinSupply}
                      label={
                        outstandingCoinSupply === '0'
                          ? 'Outstanding Coin Supply (not set)'
                          : 'Outstanding Coin Supply'
                      }
                      symbol={tokenTickers[chain?.id]?.systemcoin}
                      borderColor='#41c1d0'
                    />
                    <BalanceDisplay
                      amount={collateralCashPrice}
                      label={
                        collateralCashPrice === '0'
                          ? 'Collateral Cash Price (not set)'
                          : 'Collateral Cash Price'
                      }
                      symbol={
                        tokenTickers[chain?.id]?.collateral +
                        '/' +
                        tokenTickers[chain?.id]?.systemcoin
                      }
                      borderColor='#41c1d0'
                    />
                  </VStack>
                </SimpleGrid>
                <Tabs
                  variant='unstyled'
                  mb='2rem'
                  border='2px solid #41c1d0'
                  borderRadius='5px'
                  isFitted
                >
                  <TabList>
                    <Tab _selected={{ color: 'black', bg: '#41c1d0' }}>
                      <Text mr='1rem'> Withdraw Collateral</Text>
                      <ArrowRightCircle />
                    </Tab>
                    <Tab _selected={{ color: 'black', bg: '#41c1d0' }}>
                      <Text mr='1rem'>Redeem System Coins</Text>
                      <ArrowRightCircle />
                    </Tab>
                  </TabList>

                  <TabPanels
                    minH='350px'
                    py={6}
                    display='flex'
                    flexDirection='column'
                    alignItems='center'
                    justifyContent='center'
                    border='2px solid rgb(5, 25, 46)'
                  >
                    <TabPanel w='100%' maxW='532px'>
                      <WithdrawCollateral
                        lockedCollateralAmount={lockedCollateralAmount}
                        proxiedCollateralWithdraw={proxiedCollateralWithdraw}
                        txReceiptPending={txReceiptPending}
                      />
                    </TabPanel>
                    <TabPanel>
                      <RedeemBox
                        generatedDebtAmount={generatedDebtAmount}
                        lockedCollateralAmount={lockedCollateralAmount}
                        proxiedPrepareSystemCoins={proxiedPrepareSystemCoins}
                        proxiedRedeemSystemCoins={proxiedRedeemSystemCoins}
                        approveSystemCoin={approveSystemCoin}
                        redeemableCoinBalance={redeemableCoinBalance}
                        systemCoinBalance={systemCoinBalance}
                        approvedSystemCoin={approvedSystemCoin}
                        collateralCashPrice={collateralCashPrice}
                        txReceiptPending={txReceiptPending}
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </>
            )}
          </>
        )}
      </Flex>
    </Flex>
  );
}
