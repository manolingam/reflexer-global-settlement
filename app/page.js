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
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Button,
  Link as ChakraLink
} from '@chakra-ui/react';

import { ArrowRightCircle, ExternalLink } from 'lucide-react';

import { useNetwork } from 'wagmi';
import { formatEther } from 'viem';

import { SYSTEM_COIN_ADDRESS, blockExplorerBaseUrl } from './utils/contracts';
import { getAccountString } from './utils/helpers';

import { RedeemBox } from './components/RedeemBox';
import { WithdrawCollateral } from './components/WithdrawCollateral';

import { useGeb } from './hooks/useGeb';

export default function Home() {
  const { chain } = useNetwork();

  const [safeId, setSafeId] = useState(0);

  const {
    getSafe,

    safeOwner,
    collateralType,
    safe,
    proxyAddress,
    shutdownTime
  } = useGeb();

  useEffect(() => {});

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
                <HStack w='400px'>
                  <InputGroup>
                    <InputLeftAddon
                      children='SAFE ID'
                      color='white'
                      background='linear-gradient(to right, #41c1d0, #1a6c51)'
                    />
                    <Input
                      onChange={(e) => setSafeId(e.target.value)}
                      placeholder='0'
                    />
                  </InputGroup>
                  <Button
                    background='#3ac1b9'
                    color='black'
                    fontWeight='light'
                    _hover={{ opacity: 0.7 }}
                    onClick={async () => {
                      await getSafe(collateralType, safeId);
                    }}
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
              <Tabs
                variant='unstyled'
                display='flex'
                flexDirection='row'
                alignItems='center'
                justifyContent='center'
                my='2rem'
                isFitted
              >
                <TabList
                  display='flex'
                  flexDirection='column'
                  w='50%'
                  minH='350px'
                >
                  <Tab
                    _selected={{ color: 'white', bg: 'rgb(5, 25, 46)' }}
                    h='150px'
                  >
                    <Text mr='1rem'> Withdraw Collateral from Safe</Text>
                    <ArrowRightCircle />
                  </Tab>
                  <Tab
                    _selected={{ color: 'white', bg: 'rgb(5, 25, 46)' }}
                    h='150px'
                  >
                    <Text mr='1rem'>Redeem System Coins from Safe</Text>
                    <ArrowRightCircle />
                  </Tab>
                </TabList>

                <TabPanels
                  minH='350px'
                  display='flex'
                  flexDirection='column'
                  alignItems='center'
                  justifyContent='center'
                  border='2px solid rgb(5, 25, 46)'
                  bg='rgb(5, 25, 46)'
                >
                  <TabPanel>
                    <WithdrawCollateral
                      systemCoinAddress={SYSTEM_COIN_ADDRESS}
                      collateralBalance={safe && formatEther(safe[0])}
                    />
                  </TabPanel>
                  <TabPanel>
                    <RedeemBox
                      systemCoinAddress={SYSTEM_COIN_ADDRESS}
                      systemCoinBalance={safe && formatEther(safe[1])}
                      collateralBalance={safe && formatEther(safe[0])}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </>
        )}
      </Flex>
    </Flex>
  );
}
