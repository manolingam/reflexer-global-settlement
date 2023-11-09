'use client';

import {
  Flex,
  Text,
  Button,
  Box,
  HStack,
  NumberInput,
  NumberInputField
} from '@chakra-ui/react';
import { useAccount, useNetwork } from 'wagmi';
import { useState } from 'react';

import { tokenTickers, COLLATERAL_ADDRESS } from '@/app/utils/contracts';

export const WithdrawCollateral = ({
  lockedCollateralAmount,
  proxiedCollateralWithdraw,
  txReceiptPending
}) => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [withdrawInput, setWithdrawInput] = useState(0);

  return (
    <Flex
      direction='column'
      borderRadius='10px'
      color='white'
      alignItems='center'
      w='100%'
    >
      <Box mt='1rem' w='100%'>
        <Box
          border='2px solid'
          borderColor='white'
          borderRadius='5px'
          p='1rem'
          bg='whiteAlpha.100'
          w='100%'
        >
          <HStack
            mb='10px'
            alignItems='flex-end'
            justifyContent='space-between'
          >
            <Text
              fontSize='12px'
              opacity='0.8'
              mb='5px'
              textTransform='uppercase'
            >
              Locked Collateral
            </Text>
            <Text fontSize='12px' opacity='0.8' textTransform='uppercase'>
              Balance:{' '}
              {new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 0
              }).format(Number(lockedCollateralAmount))}
            </Text>
          </HStack>

          <HStack w='100%'>
            <NumberInput value={withdrawInput} defaultValue={0} min={0}>
              <NumberInputField
                bg='transparent'
                border='none'
                outline='none'
                fontSize='28px'
                onChange={(e) => setWithdrawInput(e.target.value)}
              />
            </NumberInput>
            <Text textTransform='uppercase' fontWeight='bold' ml='auto'>
              {tokenTickers[chain?.id]?.collateral}
            </Text>
          </HStack>
        </Box>
      </Box>

      {chain?.id in COLLATERAL_ADDRESS ? (
        <Button
          mt='1rem'
          bg='#41c1d0'
          loadingText={'Transaction pending..'}
          isLoading={txReceiptPending}
          isDisabled={
            lockedCollateralAmount < withdrawInput || withdrawInput <= 0
          }
          _hover={{
            opacity: 0.7
          }}
          onClick={() => proxiedCollateralWithdraw()}
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
