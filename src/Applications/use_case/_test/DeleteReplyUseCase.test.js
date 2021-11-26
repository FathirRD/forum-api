const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply use case properly', async () => {
    // Arrange
    const useCaseParameter = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    const useCaseHeader = {
      authorization: 'Bearer accessToken',
    };

    const decodedTokenUserId = 'user-123';
    const expectedToken = 'accessToken';

    // mock instance
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

    mockReplyRepository.getReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyAccess = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // delete reply use case instance
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    await deleteReplyUseCase.execute(useCaseParameter, useCaseHeader);

    // Assert
    expect(mockAuthenticationTokenManager.getHeaderAuthorization)
      .toBeCalledWith(useCaseHeader.authorization);
    expect(mockAuthenticationTokenManager.verifyAccessToken)
      .toBeCalledWith(expectedToken);
    expect(mockAuthenticationTokenManager.decodePayload)
      .toBeCalledWith(expectedToken);

    expect(mockReplyRepository.getReplyById)
      .toBeCalledWith(useCaseParameter.replyId);
    expect(mockReplyRepository.verifyReplyAccess).toBeCalledWith({
      owner: decodedTokenUserId,
      id: useCaseParameter.replyId,
    });
    expect(mockReplyRepository.deleteReply)
      .toBeCalledWith(useCaseParameter.replyId);
  });
});
