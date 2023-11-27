'use client';

import { Flex, Text } from '@chakra-ui/react';

export const Footer = () => {
  return (
    <Flex direction='row' py='2rem' mt='auto' justifyContent='space-between'>
      <Text fontSize='12px' my='10px'>
        © GEB Foundation 2023
      </Text>
    </Flex>
  );
};
