'use client';

import { Flex, Image as ChakraImage, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { Web3Button } from '@web3modal/react';

export const Header = () => {
  const router = useRouter();

  return (
    <Flex
      direction={{ lg: 'row', sm: 'column' }}
      alignItems='center'
      justifyContent='space-between'
      mb='2rem'
    >
      <ChakraImage
        src='/brand-color.webp'
        alt='Reflexer Finance'
        w={{ lg: '200px', sm: '100px' }}
        cursor='pointer'
        onClick={() => router.push('/')}
      />
      <HStack mt={{ lg: 0, sm: '2rem' }}>
        <Web3Button />
      </HStack>
    </Flex>
  );
};
