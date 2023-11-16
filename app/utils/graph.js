import { ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/manolingam/reflexer-finance-safes-sepolia',
  cache: new InMemoryCache()
});
