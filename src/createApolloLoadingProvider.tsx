import * as React from 'react';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink, Observable } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';

export const createApolloLoadingProvider = () => ({
  children,
}: {
  children: React.ReactChild | JSX.Element;
}) => {
  const link = new ApolloLink(() => {
    return new Observable(() => {});
  });

  const cache = new InMemoryCache();

  const client = new ApolloClient({
    link,
    cache,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
