const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const createThreadPayload = {
        title: 'Test Thread',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      };

      const server = await createServer(container);

      // create test user (default username, pw with tester and asdf7776)
      const testUser = await ServerTestHelper.registerTestUser({ server });
      // get accessToken with testUser credential
      const token = await ServerTestHelper.loginTestUser({ server });
      const { accessToken } = token;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: createThreadPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJSON = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJSON.status).toEqual('success');
      expect(responseJSON.data).toBeDefined();
      expect(responseJSON.data.addedThread).toBeDefined();
      expect(responseJSON.data.addedThread.id).toBedefined();
      expect(responseJSON.data.addedThread.title).toEqual(createThreadPayload.title);
      expect(responseJSON.data.addedThread.owner).toEqual(testUser.addedUser.id);
    });

    it('should response 403 when auth header not provided', async () => {
      // Arrange
      const createThreadPayload = {
        title: 'Test Thread',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: createThreadPayload,
      });

      // Assert
      const responseJSON = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJSON.status).toEqual('fail');
      expect(responseJSON.message).toBeDefined();
    });

    it('should resposne 400 when request payload not contain needed property', async () => {
      // Arrange
      const createThreadPayload = {
        title: 'Test Thread',
      };
      const server = await createServer(container);

      // Action
      // create test user (default username, pw is tester, asdf7776)
      const testUser = await ServerTestHelper.registerTestUser({ server });
      // get accessToken with testUser credential
      const token = await ServerTestHelper.loginTestUser({ server });
      const { accessToken } = token;

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: createThreadPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJSON = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJSON.status).toEqual('fail');
      expect(responseJSON.message).toBeDefined();
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const createThreadPayload = {
        title: 'Test Thread',
        body: {},
      };

      const server = await createServer(container);

      // Action
      // create test user (default username, pw is tester, asdf7776)
      const testUser = await ServerTestHelper.registerTestUser({ server });
      // get accessToken with testUser credential
      const token = await ServerTestHelper.loginTestUser({ server });
      const { accessToken } = token;

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: createThreadPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJSON = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJSON.status).toEqual('fail');
      expect(responseJSON.messge).toBeDefined();
    });
  });

  describe('GET /threads', () => {
    it('should response 200 and return available threads', async () => {
      // Arrange
      const server = await createServer(container);

      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();

      // Action
      const response = server.inject({
        method: 'GET',
        url: '/threads',
      });

      // Assert
      const responseJSON = JSON.parse(response.payload);
      const { threads } = responseJSON;
      expect(response.statusCode).toEqual(200);
      expect(responseJSON.status).toEqual('success');
      expect(threads).toHaveLength(3);
      threads.forEach((thread) => {
        expect(thread).toHaveProperty('id');
        expect(thread).toHaveProperty('title');
        expect(thread).toHaveProperty('date');
        expect(thread).toHaveProperty('username');
      });
    });

    it('should response 404 when threads not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = server.inject({
        method: 'GET',
        url: '/threads',
      });

      // Assert
      const responseJSON = JSON.parse(response.payload);
      expect(responseJSON.statusCode).toEqual(404);
      expect(responseJSON.status).toEqual('fail');
      expect(responseJSON.messge).toBeDefined();
    });
  });

  describe('GET /threads/{threadId}', () => {
    it('should response 200 and return available threads', async () => {
      // Arrange
      const server = await createServer(container);

      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();

      // Action
      const response = server.inject({
        method: 'GET',
        url: '/threads/thread1234',
      });

      // Assert
      const responseJSON = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJSON.status).toEqual('success');
      expect(responseJSON.data).toBeDefined();
      expect(responseJSON.data.thread).toBeDefined();
      expect(responseJSON.data.thread).toHaveProperty('id');
      expect(responseJSON.data.thread).toHaveProperty('title');
      expect(responseJSON.data.thread).toHaveProperty('body');
      expect(responseJSON.data.thread).toHaveProperty('date');
      expect(responseJSON.data.thread).toHaveProperty('username');
      // expect(responseJSON.data.thread).toHaveProperty('comments');
    });
  });

  it('should response 404 when thread not found', async () => {
    // Arrange
    const server = await createServer(container);

    // Action
    const response = server.inject({
      method: 'GET',
      url: '/threads/neverBeFound',
    });

    // Assert
    const responseJSON = JSON.parse(response.payload);
    expect(responseJSON.statusCode).toEqual(404);
    expect(responseJSON.status).toEqual('fail');
    expect(responseJSON.messge).toBeDefined();
  });
});
