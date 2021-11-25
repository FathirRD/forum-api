const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment use case properly', async () => {
    // arrange
    const useCasePayload = {
      content: 'test comment',
    };

    const useCaseParameter = {
      threadId: 'thread-123',
    };

    const useCaseHeader = {
      authorization: 'Bearer accessToken',
    };

    const decodedTokenUserId = 'user-123';

    const expectedToken = 'accessToken';

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: decodedTokenUserId,
    });

    /** creating dependancies for use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed functions */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedComment));
    mockAuthenticationTokenManager.getHeaderAuthorization = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedToken));
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: decodedTokenUserId,
        username: 'tester',
      }));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // action
    const addedComment = await addCommentUseCase.execute(
      useCasePayload, useCaseParameter, useCaseHeader,
    );

    // assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockAuthenticationTokenManager.getHeaderAuthorization)
      .toBeCalledWith(useCaseHeader);
    expect(mockAuthenticationTokenManager.verifyAccessToken)
      .toBeCalledWith(expectedToken);
    expect(mockAuthenticationTokenManager.decodePayload)
      .toBeCalledWith(expectedToken);
    expect(mockThreadRepository.getThreadById)
      .toBeCalledWith(useCaseParameter.threadId);
    expect(mockCommentRepository.addComment)
      .toBeCalledWith(new AddComment({
        content: useCasePayload.content,
        threadId: useCaseParameter.threadId,
        owner: decodedTokenUserId,
      }));
  });
});
