import { ApolloLink } from 'apollo-link';
import { ApolloCache } from 'apollo-cache';
import { GraphQLSchema } from 'graphql';
import { IntrospectionResultData } from 'apollo-cache-inmemory';

export interface LinksArgs {
  cache: ApolloCache<any>;
  schema: GraphQLSchema;
}

export interface ApolloMockedProviderOptions {
  links?: (args: LinksArgs) => Array<ApolloLink>;
  globalMocks?: any;
  fragmentTypes?: IntrospectionResultData;
}
