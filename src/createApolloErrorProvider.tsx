import * as React from 'react';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink, Observable } from 'apollo-link';
import { ApolloCache } from 'apollo-cache';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { GraphQLError } from 'graphql';
import { ApolloMockedProviderOptions } from './ApolloMockedProviderOptions';

export const createApolloErrorProvider = ({
  cache: globalCache,
}: ApolloMockedProviderOptions = {}) => ({
  graphQLErrors,
  cache,
  children,
}: {
  graphQLErrors: GraphQLError[];
  cache?: ApolloCache<any>;
  children: React.ReactNode | JSX.Element;
}) => {
  // This is just a link that swallows all operations and returns the same thing
  // for every request: The specified error.
  const link = new ApolloLink(() => {
    return new Observable(observer => {
      observer.next({
        errors: graphQLErrors || [
          { message: 'Unspecified error from ErrorProvider.' },
        ],
      });
      observer.complete();
    });
  }) as any;

  const client = new ApolloClient({
    link,
    cache: cache || globalCache || new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
