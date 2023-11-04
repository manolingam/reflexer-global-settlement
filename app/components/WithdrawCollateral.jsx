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

export const WithdrawCollateral = ({
  collateralBalance,
  systemCoinAddress,
  proxiedCollateralWithdraw
}) => {
  const [tokenInput, setTokenInput] = useState(0);

  const { address } = useAccount();
  const { chain } = useNetwork();

  return (
    <Flex
      direction='column'
      borderRadius='10px'
      color='white'
      alignItems='center'
    >
      <Box border='2px solid white' borderRadius='5px' p='1rem'>
        <HStack mb='10px' alignItems='flex-end' justifyContent='space-between'>
          <Text
            fontSize='12px'
            opacity='0.8'
            mb='5px'
            textTransform='uppercase'
          >
            Collateral Balance
          </Text>
          <Text fontSize='12px' opacity='0.8' textTransform='uppercase'>
            Balance:{' '}
            {new Intl.NumberFormat('en-US', {
              style: 'decimal',
              minimumFractionDigits: 0
            }).format(Number(collateralBalance))}
          </Text>
        </HStack>
        <HStack>
          <NumberInput value={tokenInput} defaultValue={0} min={0}>
            <NumberInputField
              bg='transparent'
              border='none'
              outline='none'
              fontSize='28px'
              onChange={(e) => setTokenInput(e.target.value)}
            />
          </NumberInput>
          <Text textTransform='uppercase' fontWeight='bold'>
            {tokenTickers[chain?.id]?.collateral}
          </Text>
        </HStack>
      </Box>

      {chain?.id in systemCoinAddress ? (
        <Button
          mt='1rem'
          bg='white'
          loadingText={'Transaction pending..'}
          // isDisabled={true}
          _hover={{
            opacity: 0.7
          }}
          onClick={() => proxiedCollateralWithdraw(1, 100)}
        >
          Withdraw
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
