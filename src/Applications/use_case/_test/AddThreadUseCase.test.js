const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Test Thread',
      body: 'test test test',
    };
    const useCaseHeader = { authorization: 'Bearer token' };

    const expectedCreatedThread = new CreatedThread({
      id: 'thread-321',
      title: useCasePayload.title,
      owner: 'user-1234',
    });
    const expectedToken = 'token';

    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedCreatedThread));

    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.getHeaderAuthorization = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedToken));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({
        username: 'tester',
        id: expectedCreatedThread.owner,
      }));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const createdThread = await addThreadUseCase.execute(useCasePayload, useCaseHeader);

    // Assert
    expect(createdThread).toStrictEqual(expectedCreatedThread);
    expect(mockAuthenticationTokenManager.getHeaderAuthorization)
      .toBeCalledWith(useCaseHeader);
    expect(mockAuthenticationTokenManager.verifyAccessToken())
      .resolves.toBeUndefined();
    expect(mockAuthenticationTokenManager.decodePayload)
      .toBeCalledWith(expectedToken);
    expect(mockThreadRepository.addThread)
      .toBeCalledWith(new CreateThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: expectedCreatedThread.owner,
      }));
  });
});
