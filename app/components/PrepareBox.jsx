'use client';

import {
  Flex,
  Box,
  Text,
  HStack,
  NumberInput,
  NumberInputField,
  Button,
  SimpleGrid
} from '@chakra-ui/react';
import { useAccount, useNetwork } from 'wagmi';
import { useState } from 'react';

import { BalanceDisplay } from './BalanceDisplay';
import { useGeb } from '../hooks/useGeb';
import { tokenTickers, SYSTEM_COIN_ADDRESS } from '@/app/utils/contracts';

export const PrepareBox = () => {
  const [prepareInput, setPrepareInput] = useState(0);

  const { address } = useAccount();
  const { chain } = useNetwork();

  const {
    systemCoinBalance,
    proxiedPrepareSystemCoins,
    approveSystemCoin,
    approvedSystemCoin,
    txReceiptPending
  } = useGeb();

  const isApproved = Number(approvedSystemCoin) >= Number(prepareInput);

  return (
    <Flex
      direction='column'
      borderRadius='10px'
      color='white'
      alignItems='center'
      w='100%'
    >
      <SimpleGrid w='100%' columns='2' gap='5' mb='2rem'>
        <BalanceDisplay
          amount={systemCoinBalance}
          label='System Coin Balance'
          symbol={tokenTickers[chain?.id]?.systemcoin}
          borderColor='#41c1d0'
        />{' '}
        <BalanceDisplay
          amount={approvedSystemCoin}
          label='Approved System Coin Balance'
          symbol={tokenTickers[chain?.id]?.systemcoin}
          borderColor='#41c1d0'
        />
      </SimpleGrid>

      <Box w='100%' border='2px solid white' borderRadius='5px' p='1rem'>
        <HStack mb='10px' alignItems='flex-end' justifyContent='space-between'>
          <Text fontSize='12px' opacity='0.8' textTransform='uppercase'>
            Prepare System Coins
          </Text>
          <Text fontSize='12px' opacity='0.8' textTransform='uppercase'>
            Balance:{' '}
            {new Intl.NumberFormat('en-US', {
              style: 'decimal',
              minimumFractionDigits: 0
            }).format(Number(systemCoinBalance))}
          </Text>
        </HStack>
        <HStack>
          <NumberInput value={prepareInput} defaultValue={0} min={0}>
            <NumberInputField
              bg='transparent'
              border='none'
              outline='none'
              fontSize='28px'
              onChange={(e) => setPrepareInput(e.target.value)}
            />
          </NumberInput>
          <Text textTransform='uppercase' fontWeight='bold'>
            {tokenTickers[chain?.id]?.systemcoin}
          </Text>
        </HStack>
      </Box>

      {chain?.id in SYSTEM_COIN_ADDRESS ? (
        <Button
          mt='1rem'
          bg='#41c1d0'
          isLoading={txReceiptPending}
          isDisabled={Number(prepareInput) <= 0}
          loadingText={'Transaction pending..'}
          _hover={{
            opacity: 0.7
          }}
          onClick={() => {
            if (isApproved) proxiedPrepareSystemCoins(prepareInput);
            else approveSystemCoin(prepareInput);
          }}
        >
          {isApproved ? 'Prepare' : 'Approve'}
        </Button>
      ) : (
        <Text
          mt='5px'
          mb='10px'
          mx='auto'
          fontSize='12px'
          opacity='0.7'
          fontStyle='italic'
        >
          {address ? 'Unsupported network!' : 'Connect your wallet'}
        </Text>
      )}
    </Flex>
  );
};
