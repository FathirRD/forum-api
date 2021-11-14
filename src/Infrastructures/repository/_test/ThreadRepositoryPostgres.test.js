const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const pool = require('../../database/postgres/pool');

const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist create thread and return created thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();

      const createThread = new CreateThread({
        title: 'Test Thread',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        owner: 'user-1111',
      });

      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(createThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-1234');
      expect(threads).toHaveLength(1);
    });

    it('should return created thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();

      const createThreadPayload = {
        title: 'Test Thread',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        owner: 'user-1111',
      };
      const createThread = new CreateThread(createThreadPayload);

      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdThread = await threadRepositoryPostgres.addThread(createThread);

      // Assert
      expect(createdThread).toStrictEqual(new CreatedThread({
        id: 'thread-1234',
        title: createThreadPayload.title,
        owner: createThreadPayload.owner,
      }));
    });
  });

  describe('getAllThread function', () => {
    it('should return NotFoundError when thread not found', () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      // Assert
      return expect(threadRepositoryPostgres.getAllThread())
        .rejects.toThrow(NotFoundError);
    });

    it('should return all threads when its found', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThreadMany();

      // Action
      // Assert
      const results = await threadRepositoryPostgres.getAllThread();
      expect(results).toHaveLength(3);
    });
  });

  describe('getDetailThread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThreadMany();

      // Action
      // Assert
      await expect(threadRepositoryPostgres.getDetailThread('thread-neverBeFound'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return detail thread when its found', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const createThreadPayload = {
        id: 'thread-1234',
        title: 'Test Thread',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        owner: 'user-1111',
      };
      await ThreadsTableTestHelper.addThread(createThreadPayload);

      // Action
      // Assert
      const results = await threadRepositoryPostgres.getDetailThread('thread-1234');
      expect(results.id).toEqual(createThreadPayload.id);
      expect(results.title).toEqual(createThreadPayload.title);
      expect(results.body).toEqual(createThreadPayload.body);
      expect(results.owner).toEqual(createThreadPayload.owner);
      expect(results).toHaveProperty('updated_at');
      expect(results).toHaveProperty('created_at');
    });
  });

  describe('getThreadByOwner function', () => {
    it('should throw NotFoundError when owned thread not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThreadMany();

      // Action
      // Assert
      await expect(threadRepositoryPostgres.getThreadByOwner('user-321'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return owned thread when its found', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Generate thread with user-123(2) ond user-1234(1)
      await ThreadsTableTestHelper.addThreadMany();

      // Action
      // Assert
      const results = await threadRepositoryPostgres.getThreadByOwner('user-1111');
      expect(results).toHaveLength(2);
    });
  });
});
