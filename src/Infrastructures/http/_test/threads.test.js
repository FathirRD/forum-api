const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

describe('/thrads endpoint', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Test Thread',
        body: 'POST Thread',
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
        payload: requestPayload,
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
      expect(responseJSON.data.addedThread.id).toBeDefined();
      expect(responseJSON.data.addedThread.title).toEqual(requestPayload.title);
      expect(responseJSON.data.addedThread.owner).toEqual(testUser.id);
    });

    it('should response 401 when authorization not provided', async () => {
      // Arrange
      const requestPayload = {
        title: 'Test Thread',
        body: 'Anonymous POST',
        owner: 'Anonymous',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Incomplete Payload',
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
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      /* add thread payload */
      const requestPayload = {
        title: {},
        body: 'Bad payload',
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
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return detail thread', async () => {
      // Arrange
      // add 2 user with id 1111 and 2222 for tester1 and tester2
      await UsersTableTestHelper.addUserMany();
      // add 3 thread with id 1234, 12345, 123456 for Test Thread, (2), (3) - 2 user-1111
      await ThreadsTableTestHelper.addThreadMany();
      // add 3 comment with id 111, 222, 333 for 2 thread-1234 and 1 thread-12345 - 1 user-1111
      await CommentsTableTestHelper.addCommentMany();
      // add 3 reply with id 111, 222, 333 for 2 comment-111 and 1 coment-222 - 2 user-1111
      await RepliesTableTestHelper.addReplyMany();

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-1234',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(2);
      expect(responseJson.data.thread.comments[1].replies).toHaveLength(1);
    });

    it('should response 404 if thread not found', async () => {
      // Assert
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/adsjfhocvxpofsd-thread',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });
});
