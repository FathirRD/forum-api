const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({
    threadRepository, commentRepository, authenticationTokenManager,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCaseParameter, useCaseHeader, useCasePayload) {
    const accessToken = await this._authenticationTokenManager
      .getHeaderAuthorization(useCaseHeader.authorization);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(accessToken);
    await this._threadRepository.getThreadById(useCaseParameter.threadId);
    const addComment = new AddComment({
      ...useCasePayload, owner, thread: useCaseParameter.threadId,
    });
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
