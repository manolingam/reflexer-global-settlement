'use client';

import {
  Flex,
  Box,
  Text,
  HStack,
  NumberInput,
  NumberInputField,
  Button
} from '@chakra-ui/react';
import { useAccount, useNetwork } from 'wagmi';
import { useState } from 'react';

import { tokenTickers } from '@/app/utils/contracts';
import { BalanceDisplay } from './BalanceDisplay';

export const RedeemBox = ({
  systemCoinBalance,
  systemCoinAddress,
  proxiedRedeemSystemCoins,
  proxiedPrepareSystemCoins,
  approveSystemCoin,
  redeemableCoinBalance,
  approvedSystemCoin,
  collateralCashPrice
}) => {
  const [prepareInput, setPrepareInput] = useState(0);
  const [redeeemInput, setRedeemInput] = useState(0);

  const { address } = useAccount();
  const { chain } = useNetwork();

  const isApproved = Number(approvedSystemCoin) >= Number(prepareInput);
  const redeemableCollateralAmount = (
    Number(redeeemInput) * Number(collateralCashPrice)
  ).toString();

  return (
    <Flex
      direction='column'
      borderRadius='10px'
      w={{ lg: '500px', sm: '90%' }}
      color='white'
      alignItems='center'
    >
      <Box border='2px solid white' borderRadius='5px' p='1rem' mb='.5rem'>
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

      {chain?.id in systemCoinAddress ? (
        <Button
          mt='0.5rem'
          mb='2rem'
          bg='white'
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

      <Box border='2px solid white' borderRadius='5px' p='1rem'>
        <HStack mb='10px' alignItems='flex-end' justifyContent='space-between'>
          <Text
            fontSize='12px'
            opacity='0.8'
            mb='5px'
            textTransform='uppercase'
          >
            Redeem System Coins
          </Text>
          <Text fontSize='12px' opacity='0.8' textTransform='uppercase'>
            Redeemable Balance:{' '}
            {new Intl.NumberFormat('en-US', {
              style: 'decimal',
              minimumFractionDigits: 0
            }).format(Number(redeemableCoinBalance))}
          </Text>
        </HStack>
        <HStack>
          <NumberInput value={redeeemInput} defaultValue={0} min={0}>
            <NumberInputField
              bg='transparent'
              border='none'
              outline='none'
              fontSize='28px'
              onChange={(e) => setRedeemInput(e.target.value)}
            />
          </NumberInput>
          <Text textTransform='uppercase' fontWeight='bold'>
            {tokenTickers[chain?.id]?.systemcoin}
          </Text>
        </HStack>
      </Box>

      <Box mt='1rem' w='100%'>
        <BalanceDisplay
          amount={redeemableCollateralAmount}
          label='Redeemable Collateral'
          symbol={tokenTickers[chain?.id]?.collateral}
        />
      </Box>

      {chain?.id in systemCoinAddress ? (
        <Button
          mt='1rem'
          bg='white'
          loadingText={'Transaction pending..'}
          onClick={() => proxiedRedeemSystemCoins(redeeemInput)}
          _hover={{
            opacity: 0.7
          }}
        >
          Redeem
        </Button>
      ) : (
        <Text
          mt='10px'
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
