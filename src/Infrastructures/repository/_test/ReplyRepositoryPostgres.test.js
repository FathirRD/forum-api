const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

const pool = require('../../database/postgres/pool');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();

      const addReply = new AddReply({
        comment: 'comment-111',
        owner: 'user-2222',
        content: 'Rereapidsjflaksjfpw',
      });

      const fakeIdGenerator = () => '1234';

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(addReply);

      // Assert
      await expect(RepliesTableTestHelper.findReplyById('reply-1234'));
    });

    it('should return added reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();

      const addReply = new AddReply({
        comment: 'comment-111',
        owner: 'user-2222',
        content: 'Rereapidsjflaksjfpw',
      });

      const fakeIdGenerator = () => '1234';

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(addReply);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-1234',
        content: addReply.content,
        owner: addReply.owner,
      }));
    });
  });

  describe('getRepliesByComment function', () => {
    it('should return empty array when comment has no reply', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      // Assert
      const result = await replyRepositoryPostgres.getRepliesByComment('comment-111');
      expect(result).toStrictEqual([]);
    });

    it('should return all replies from selected comment when its found', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();
      await RepliesTableTestHelper.addReplyMany();

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      // Assert
      const result = await replyRepositoryPostgres.getRepliesByComment('comment-111');
      expect(result).toHaveLength(2);
    });
  });

  describe('getReplyById function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();
      await RepliesTableTestHelper.addReplyMany();

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      // Assert
      await expect(replyRepositoryPostgres.getReplyById('reply-aldshfcvmnxv-cnv-coewp'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return selected reply if its found', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();
      await RepliesTableTestHelper.addReplyMany();

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      // Assert
      const result = await replyRepositoryPostgres.getReplyById('reply-111');
      expect(result).toHaveLength(1);
    });
  });

  describe('verifyReplyAccess function', () => {
    it('should throw AuthorizationError if user not the resource owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();
      await RepliesTableTestHelper.addReplyMany();

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      // Assert
      await expect(replyRepositoryPostgres.verifyReplyAccess({
        replyId: 'reply-111',
        ownerId: 'user-2222',
      })).rejects.toThrowError(AuthorizationError);
    });

    it('should pass the action if user is the resource owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();
      await RepliesTableTestHelper.addReplyMany();

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      // Assert
      await expect(replyRepositoryPostgres.verifyReplyAccess({
        replyId: 'reply-111', ownerId: 'user-1111',
      })).resolves.not.toThrowError();
    });
  });

  describe('deleteReply function', () => {
    it('should throw NotFoundError when selected reply not exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();
      await RepliesTableTestHelper.addReplyMany();

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      // Assert
      await expect(replyRepositoryPostgres.deleteReply('reply-ajdsfh0zcvof0sd9uasdf'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should soft delete reply', async () => {
      // Arrange
      await UsersTableTestHelper.addUserMany();
      await ThreadsTableTestHelper.addThreadMany();
      await CommentsTableTestHelper.addCommentMany();
      await RepliesTableTestHelper.addReplyMany();

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      // Assert
      const deletedReply = await replyRepositoryPostgres.deleteReply('reply-111');
      const reply = await RepliesTableTestHelper.findReplyById('reply-111');

      expect(deletedReply).toHaveLength(1);
      expect(reply.is_deleted).toEqual(true);
    });
  });
});
