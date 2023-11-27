'use client';

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link as ChakraLink
} from '@chakra-ui/react';

export const TransactionAlert = ({ status, title, href }) => {
  return (
    <Alert status={status}>
      <AlertIcon />
      <AlertTitle>{title}</AlertTitle>
      {status === 'info' && (
        <AlertDescription>
          View{' '}
          <ChakraLink textDecoration='underline' href={href} isExternal>
            status
          </ChakraLink>
        </AlertDescription>
      )}
    </Alert>
  );
};
