import React, { ReactNode } from 'react';
import { ApolloMockedProviderOptions } from './ApolloMockedProviderOptions';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { ApolloProvider } from 'react-apollo';
import { SchemaLink } from 'apollo-link-schema';
import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  ITypeDefinitions,
} from 'graphql-tools';
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';

export const createApolloMockedProvider = (
  typeDefs: ITypeDefinitions,
  { links, globalMocks, fragmentTypes }: ApolloMockedProviderOptions = {}
) => ({
  customResolvers = {},
  children,
}: {
  customResolvers?: any;
  children: ReactNode;
  cache?: any;
}) => {
  const schema = makeExecutableSchema({
    typeDefs,
    resolverValidationOptions: { requireResolversForResolveType: false },
  });

  addMockFunctionsToSchema({
    schema,
    mocks: { ...globalMocks, ...customResolvers },
  });

  const cache = fragmentTypes
    ? new InMemoryCache({
        fragmentMatcher: new IntrospectionFragmentMatcher({
          introspectionQueryResultData: fragmentTypes,
        }),
      })
    : new InMemoryCache();

  const customLinks = links ? links({ cache, schema }) : [];

  const client = new ApolloClient({
    cache,
    link: ApolloLink.from([...customLinks, new SchemaLink({ schema })]),
    defaultOptions: {
      mutate: { errorPolicy: 'all' },
    },
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
