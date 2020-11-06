import React from 'react';
import { createApolloMockedProvider } from '../src';
import { readFileSync } from 'fs';
import { render, waitForDomChange, fireEvent } from '@testing-library/react';

import { TodoApp, TodoItem, TodoList } from './fixtures/Todo';
import path from 'path';
import { ApolloLink } from 'apollo-link';

const typeDefs = readFileSync(
  path.join(__dirname, 'fixtures/simpleSchema.graphql'),
  'utf8'
);

test('works with defaults', async () => {
  const MockedProvider = createApolloMockedProvider(typeDefs);
  const { getByTestId } = render(
    <MockedProvider>
      <TodoApp />
    </MockedProvider>
  );

  await waitForDomChange();
  const todoList = getByTestId('todolist');
  expect(todoList).toBeTruthy();
  expect(todoList.children.length).toBeGreaterThanOrEqual(1);
});

test('works with custom resolvers', async () => {
  const MockedProvider = createApolloMockedProvider(typeDefs);
  const { getByText } = render(
    <MockedProvider
      customResolvers={{
        Query: () => ({
          todos: () => [
            {
              text: 'First Todo',
            },
            {
              text: 'Second Todo',
            },
          ],
        }),
      }}
    >
      <TodoApp />
    </MockedProvider>
  );

  await waitForDomChange();

  expect(getByText('First Todo')).toBeTruthy();
  expect(getByText('Second Todo')).toBeTruthy();
});

test('works with custom global mocks', async () => {
  const globalMocks = {
    Query: () => ({
      todos: () => [
        {
          text: 'First Todo',
        },
        {
          text: 'Second Todo',
        },
      ],
    }),
  };

  const MockedProvider = createApolloMockedProvider(typeDefs, { globalMocks });
  const { getByText } = render(
    <MockedProvider>
      <TodoApp />
    </MockedProvider>
  );

  await waitForDomChange();

  expect(getByText('First Todo')).toBeTruthy();
  expect(getByText('Second Todo')).toBeTruthy();
});

test('works with custom links', async () => {
  const linkAction = jest.fn();

  const MockedProvider = createApolloMockedProvider(typeDefs, {
    links: ({ cache, schema }) => [
      new ApolloLink((operation, forward) => {
        linkAction(cache, schema);
        return forward(operation);
      }),
    ],
  });

  render(
    <MockedProvider
      customResolvers={{
        Query: () => ({
          todos: () => [],
        }),
      }}
    >
      <TodoApp />
    </MockedProvider>
  );

  await waitForDomChange();
  expect(linkAction).toHaveBeenCalledWith(
    expect.objectContaining({ addTypename: true }), // assert that the cache is passed
    expect.objectContaining({ astNode: undefined }) // assert that the schema is passed
  );
});

test('allows throwing errors within resolvers to mock Query API errors', async () => {
  const MockedProvider = createApolloMockedProvider(typeDefs);
  const { container } = render(
    <MockedProvider
      customResolvers={{
        Query: () => ({
          todo: () => {
            throw new Error('Boom');
          },
          todos: () => [
            {
              text: 'Success',
            },
          ],
        }),
      }}
    >
      <>
        <TodoList />
        <TodoItem id="fake" />
      </>
    </MockedProvider>
  );

  await waitForDomChange();
  expect(container.textContent).toMatch(/Success/);
  expect(container.textContent).toMatch(/Boom/);
});

test('allows throwing errors within resolvers to mock Mutation API errors', async () => {
  const MockedProvider = createApolloMockedProvider(typeDefs);
  const { container, getByText } = render(
    <MockedProvider
      customResolvers={{
        Query: () => ({
          todos: () => [
            {
              text: 'First Todo',
            },
            {
              text: 'Second Todo',
            },
          ],
        }),
        Mutation: () => ({
          addTodo: () => {
            throw new Error('Boom');
          },
        }),
      }}
    >
      <TodoApp />
    </MockedProvider>
  );

  await waitForDomChange();
  fireEvent.click(getByText('Add todo'));
  await waitForDomChange();
  expect(container.textContent).toMatch(/Boom/);
});
