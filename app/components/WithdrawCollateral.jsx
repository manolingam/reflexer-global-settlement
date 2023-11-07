'use client';

import { Flex, Text, Button } from '@chakra-ui/react';
import { useAccount, useNetwork } from 'wagmi';

import { tokenTickers } from '@/app/utils/contracts';
import { BalanceDisplay } from './BalanceDisplay';

export const WithdrawCollateral = ({
  lockedCollateralAmount,
  systemCoinAddress,
  proxiedCollateralWithdraw
}) => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  return (
    <Flex
      direction='column'
      borderRadius='10px'
      color='white'
      alignItems='center'
      w='100%'
    >
      <BalanceDisplay
        amount={lockedCollateralAmount}
        label='Locked Collateral'
        symbol={tokenTickers[chain?.id]?.collateral}
      />

      {chain?.id in systemCoinAddress ? (
        <Button
          mt='1rem'
          bg='white'
          loadingText={'Transaction pending..'}
          // isDisabled={true}
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
