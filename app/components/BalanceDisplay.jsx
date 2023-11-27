'use client';

import { Box, Text, HStack } from '@chakra-ui/react';

import { formatLargeNumber } from '../utils/helpers';

export const BalanceDisplay = ({ amount, label, symbol, borderColor }) => {
  return (
    <Box borderRadius='5px' p='1rem' bg='rgba(255, 255, 255, 0.112)' w='100%'>
      <HStack mb='10px' alignItems='flex-end' justifyContent='space-between'>
        <Text fontSize='12px' opacity='0.8' mb='5px' textTransform='uppercase'>
          {label}
        </Text>
      </HStack>
      <HStack w='100%'>
        <Text
          fontSize='28px'
          flex={1}
          color='#41c1d0'
          cursor='not-allowed'
          pl={4}
        >
          {formatLargeNumber(amount)}
        </Text>
        <Text textTransform='uppercase' fontWeight='bold'>
          {symbol}
        </Text>
      </HStack>
    </Box>
  );
};
