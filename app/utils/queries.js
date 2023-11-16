import { gql } from '@apollo/client';

export const GET_SAFES_QUERY = gql`
  query GetSafes($address: String) {
    users(where: { address: $address }) {
      safes {
        safeId
      }
    }
  }
`;
