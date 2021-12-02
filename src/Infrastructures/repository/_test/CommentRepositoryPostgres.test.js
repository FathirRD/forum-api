const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

const pool = require('../../database/postgres/pool');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();

      const addComment = new AddComment({
        content: 'some content',
        thread: 'thread-1234',
        owner: 'user-1111',
      });
      const fakeIdGenerator = () => '111';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // assert
      const comments = await CommentsTableTestHelper.findCommentById(addedComment.id);
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();

      const addCommentPayload = {
        content: 'aaaaaaaaaaaaaa',
        thread: 'thread-1234',
        owner: 'user-1111',
      };
      const addComment = new AddComment(addCommentPayload);

      const fakeIdGenerator = () => '111';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-111',
        content: addCommentPayload.content,
        owner: addCommentPayload.owner,
      }));
    });
  });

  describe('getCommentsByThread function', () => {
    it('should return empty array when thread has no comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      // Assert
      const result = await commentRepositoryPostgres.getCommentsByThread('thread-1234');
      expect(result).toStrictEqual([]);
    });

    it('should return all comments from selected thread when its found', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      // Assert
      const result = await commentRepositoryPostgres.getCommentsByThread('thread-1234');
      expect(result).toHaveLength(2);
    });
  });

  describe('getCommentById function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      // Assert
      await expect(commentRepositoryPostgres.getCommentById('comment-ayeayeadsfjapisdfjaslk', 'thread-asdf'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return selected comment if its found', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      // Assert
      const result = await commentRepositoryPostgres.getCommentById('comment-111', 'thread-1234');
      expect(result).toHaveLength(1);
    });
  });

  describe('verifyCommentAccess function', () => {
    it('should throw AuthorizationError if user not the resource owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      // Assert
      await expect(commentRepositoryPostgres.verifyCommentAccess({
        commentId: 'comment-111', ownerId: 'user-2222',
      })).rejects.toThrowError(AuthorizationError);
    });

    it('should pass the action if user is the resource owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      // Assert
      await expect(commentRepositoryPostgres.verifyCommentAccess({
        commentId: 'comment-111', ownerId: 'user-1111',
      })).resolves.not.toThrowError();
    });
  });

  describe('deleteComment function', () => {
    it('should throw NotFoundError when selected comment not exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      // Assert
      await expect(commentRepositoryPostgres.deleteComment('comment-sfdjshafhjlhudfshcjkzhluoeaf'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should soft delete comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      // Assert
      const deletedComment = await commentRepositoryPostgres.deleteComment('comment-111');
      const comment = await CommentsTableTestHelper.findCommentById('comment-111');

      expect(deletedComment).toHaveLength(1);
      expect(comment[0].is_deleted).toEqual(true);
    });
  });
});
