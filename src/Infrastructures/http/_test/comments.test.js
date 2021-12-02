const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
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

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'POST Comment',
      };

      const server = await createServer(container);

      // create test user (default username, pw with tester and asdf7776)
      const testUser = await ServerTestHelper.registerTestUser({ server });
      // get accessToken with testUser credential
      const token = await ServerTestHelper.loginTestUser({ server });
      const { id: userId } = testUser;
      const { accessToken } = token;
      const threadId = 'thread-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content);
      expect(responseJson.data.addedComment.owner).toEqual(userId);
    });

    it('should response 401 when authorization not provieded', async () => {
      // Arrange
      const requestPayload = {
        content: 'Anonymous POST',
      };

      const server = await createServer(container);

      // create test user (default username, pw with tester and asdf7776)
      const testUser = await ServerTestHelper.registerTestUser({ server });
      const { id: userId } = testUser;
      const threadId = 'thread-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
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
      const requestPayload = {};

      const server = await createServer(container);

      // create test user (default username, pw with tester and asdf7776)
      const testUser = await ServerTestHelper.registerTestUser({ server });
      // get accessToken with testUser credential
      const token = await ServerTestHelper.loginTestUser({ server });
      const { id: userId } = testUser;
      const { accessToken } = token;
      const threadId = 'thread-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 400 when request payload not meet data type specifications', async () => {
      // Arrange
      const requestPayload = {
        content: 99989,
      };

      const server = await createServer(container);

      // create test user (default username, pw with tester and asdf7776)
      const testUser = await ServerTestHelper.registerTestUser({ server });
      // get accessToken with testUser credential
      const token = await ServerTestHelper.loginTestUser({ server });
      const { id: userId } = testUser;
      const { accessToken } = token;
      const threadId = 'thread-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
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

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and return success status', async () => {
      // Arrange
      const server = await createServer(container);

      // create test user (default username, pw with tester and asdf7776)
      const testUser = await ServerTestHelper.registerTestUser({ server });
      // get accessToken with testUser credential
      const token = await ServerTestHelper.loginTestUser({ server });
      const { id: userId } = testUser;
      const { accessToken } = token;
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment(
        { id: commentId, thread: threadId, owner: userId },
      );

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when someone tries an action to resource that they dont own', async () => {
      // Arrange
      const server = await createServer(container);

      // create test user (default username, pw with tester and asdf7776)
      const testUser = await ServerTestHelper.registerTestUser({ server });
      // get accessToken with testUser credential
      const token = await ServerTestHelper.loginTestUser({ server });
      const { id: userId } = testUser;
      const { accessToken } = token;
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment(
        { id: commentId, thread: threadId, owner: userId },
      );

      // 2nd user
      // create test user (default username, pw with tester and asdf7776)
      const testUser2 = await ServerTestHelper.registerTestUser(
        { server, username: 'tester2' },
      );
      // get accessToken with testUser c  redential
      const token2 = await ServerTestHelper.loginTestUser(
        { server, username: 'tester2' },
      );

      const { id: userId2 } = testUser2;
      const { accessToken: accessToken2 } = token2;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });
});
