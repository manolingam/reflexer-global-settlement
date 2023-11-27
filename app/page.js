'use client';

import { useState, useEffect } from 'react';

import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Text,
  SimpleGrid,
  FormControl,
  FormLabel,
  VStack,
  Spinner
} from '@chakra-ui/react';

import { ArrowRightCircle } from 'lucide-react';

import { useNetwork } from 'wagmi';
import { zeroAddress } from 'viem';

import { blockExplorerBaseUrl } from './utils/contracts';
import { getAccountString } from './utils/helpers';

import { RedeemBox } from './components/RedeemBox';
import { WithdrawCollateral } from './components/WithdrawCollateral';
import { PrepareBox } from './components/PrepareBox';
import { RadioBox } from './components/RadioBox';

import { useGeb } from './hooks/useGeb';
import { BalanceDisplay } from './components/BalanceDisplay';
import { tokenTickers } from '@/app/utils/contracts';
import { TransactionAlert } from './components/TransactionAlert';

export default function Home() {
  const { chain } = useNetwork();

  const [safeIds, setSafeIds] = useState([]);
  const [selectedSafeId, setSelectedSafeId] = useState('0');

  const {
    safesQueryResult,
    safesQueryLoading,
    safeOwner,
    lockedCollateralAmount,
    generatedDebtAmount,
    proxyAddress,
    shutdownTime,
    approvedSystemCoin,
    systemCoinBalance,
    collateralBalance,
    redeemableCoinBalance,
    collateralCashPrice,
    outstandingCoinSupply,
    fetchSafeAddress,
    fetchSafeOwner
  } = useGeb();

  const updateSafeId = async (_safeId) => {
    if (Number.isNaN(_safeId)) {
      return;
    } else {
      fetchSafeOwner(_safeId);
      fetchSafeAddress(_safeId);
    }
  };

  useEffect(() => {
    let safeIds = [];
    if (safesQueryResult?.users?.length > 0) {
      safesQueryResult.users[0].safes.map((safe) => {
        safeIds.push(safe.safeId);
      });
    }
    setSafeIds(safeIds);
    if (safeIds.length > 0) {
      setSelectedSafeId(safeIds[0]);
    } else {
      setSelectedSafeId(0);
    }
  }, [safesQueryResult]);

  useEffect(() => {
    if (selectedSafeId != '0') updateSafeId(Number(selectedSafeId));
  }, [selectedSafeId]);

  return (
    <Flex direction='column'>
      <Flex direction='column'>
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
            {shutdownTime
              ? new Date(Number(shutdownTime) * 1000).toDateString()
              : 'Not Available'}
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
            {proxyAddress === zeroAddress && (
              <Spinner size='lg' color='#41c1d0' mx='auto' mt='4rem' />
            )}

            {shutdownTime > 0 && safesQueryLoading && (
              <Text
                mt='4rem'
                mx='auto'
                opacity='0.7'
                fontSize={{ lg: '14px', sm: '12px' }}
              >
                Loading your safes..
              </Text>
            )}

            {shutdownTime > 0 && !safesQueryLoading && safeIds.length == 0 && (
              <Text
                mt='4rem'
                mx='auto'
                opacity='0.7'
                fontSize={{ lg: '14px', sm: '12px' }}
              >
                No safes found.
              </Text>
            )}

            {shutdownTime > 0 &&
              !safesQueryLoading &&
              selectedSafeId != '0' && (
                <FormControl isRequired color='white'>
                  <FormLabel as='legend' fontSize={{ lg: '14px', sm: '12px' }}>
                    Your safes
                  </FormLabel>
                  <RadioBox
                    stack='horizontal'
                    options={safeIds}
                    updateRadio={setSelectedSafeId}
                    defaultValue={selectedSafeId}
                    value={selectedSafeId}
                    name='selected_safe_id'
                  />
                </FormControl>
              )}

            {shutdownTime > 0 && proxyAddress === safeOwner && (
              <>
                <SimpleGrid columns='3' gap='5' mb='2rem' mt='3rem'>
                  <BalanceDisplay
                    amount={generatedDebtAmount}
                    label='Generated Debt'
                    symbol={tokenTickers[chain?.id]?.systemcoin}
                    borderColor='#41c1d0'
                  />
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
                      <Text mr='1rem'>Withdraw Collateral</Text>
                      <ArrowRightCircle />
                    </Tab>
                    <Tab _selected={{ color: 'black', bg: '#41c1d0' }}>
                      <Text mr='1rem'>Approve System Coins</Text>
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
                      <WithdrawCollateral safeId={selectedSafeId} />
                    </TabPanel>
                    <TabPanel>
                      <PrepareBox />
                    </TabPanel>
                    <TabPanel>
                      <RedeemBox />
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
