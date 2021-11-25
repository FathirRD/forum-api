const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment use case properly', async () => {
    // Arrange
    const useCaseParameter = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const useCaseHeader = {
      authorization: 'Bearer accessToken',
    };

    const decodedTokenUserId = 'user-123';
    const expectedToken = 'accessToken';
    const expectedDeletedComment = {
      id: 'comment-123',
    };

    // mock instances
    const mockCommentRepository = new CommentRepository();
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
    mockCommentRepository.verifyCommentAccess = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // delete comment use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    await deleteCommentUseCase.execute(useCaseParameter, useCaseHeader);

    // Assert
    expect(mockAuthenticationTokenManager.getHeaderAuthorization)
      .toBeCalledWith(useCaseHeader);
    expect(mockAuthenticationTokenManager.verifyAccessToken)
      .toBeCalledWith(expectedToken);
    expect(mockAuthenticationTokenManager.decodePayload)
      .toBeCalledWith(expectedToken);

    expect(mockCommentRepository.checkCommentIsExist)
      .toBeCalledWith(useCaseParameter.commentId);
    expect(mockCommentRepository.verifyCommentAccess).toBeCalledWith({
      ownerId: decodedTokenUserId,
      commentId: useCaseParameter.commentId,
    });
    expect(mockCommentRepository.deleteCommentById)
      .toBeCalledWith(expectedDeletedComment.id);
  });
});
