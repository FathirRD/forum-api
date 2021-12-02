const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply use case properly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'test reply',
    };

    const useCaseParameter = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const useCaseHeader = {
      authorization: 'Bearer accessToken',
    };

    const decodedTokenUserId = 'user-123';
    const expectedToken = 'accessToken';

    const expectedAddedReply = new AddedReply({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: decodedTokenUserId,
    });

    // mock instance
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    // mocking
    mockAuthenticationTokenManager.getHeaderAuthorization = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedToken));
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: decodedTokenUserId,
        username: 'tester',
      }));

    mockCommentRepository.getCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedReply));

    // reply use case instance
    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(
      useCaseParameter, useCaseHeader, useCasePayload,
    );

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockAuthenticationTokenManager.getHeaderAuthorization)
      .toBeCalledWith(useCaseHeader.authorization);
    expect(mockAuthenticationTokenManager.verifyAccessToken)
      .toBeCalledWith(expectedToken);
    expect(mockAuthenticationTokenManager.decodePayload)
      .toBeCalledWith(expectedToken);

    expect(mockCommentRepository.getCommentById)
      .toBeCalledWith(useCaseParameter.commentId, useCaseParameter.threadId);

    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply({
      thread: useCaseParameter.threadId,
      comment: useCaseParameter.commentId,
      owner: decodedTokenUserId,
      content: useCasePayload.content,
    }));
  });
});
