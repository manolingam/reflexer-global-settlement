'use client';

import { Box, Text, HStack } from '@chakra-ui/react';

const formatLargeNumber = (number) => {
  const numberOfDigits = number.length;
  if (numberOfDigits > 5) {
    const firstPart = number.slice(0, 3);
    const firstPartFormatted = (Number(firstPart) / 100).toFixed(2);
    return `${firstPartFormatted} * 10^${numberOfDigits - 1}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0
  }).format(Number(number));
};

export const BalanceDisplay = ({ amount, label, symbol, borderColor }) => {
  return (
    <Box
      border='2px solid'
      borderColor={borderColor ?? 'white'}
      borderRadius='5px'
      p='1rem'
      bg='whiteAlpha.100'
      w='100%'
    >
      <HStack mb='10px' alignItems='flex-end' justifyContent='space-between'>
        <Text fontSize='12px' opacity='0.8' mb='5px' textTransform='uppercase'>
          {label}
        </Text>
      </HStack>
      <HStack w='100%'>
        <Text fontSize='28px' flex={1} cursor='not-allowed' pl={4}>
          {formatLargeNumber(amount)}
        </Text>
        <Text textTransform='uppercase' fontWeight='bold'>
          {symbol}
        </Text>
      </HStack>
    </Box>
  );
};