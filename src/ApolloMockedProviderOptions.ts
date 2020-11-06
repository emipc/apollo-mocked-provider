import { ApolloLink } from 'apollo-link';
import { ApolloCache } from 'apollo-cache';
import { GraphQLSchema } from 'graphql';

export interface LinksArgs {
  cache: ApolloCache<any>;
  schema: GraphQLSchema;
}

export interface ApolloMockedProviderOptions {
  cache?: ApolloCache<any>;
  links?: (args: LinksArgs) => Array<ApolloLink>;
  globalMocks?: any;
}
