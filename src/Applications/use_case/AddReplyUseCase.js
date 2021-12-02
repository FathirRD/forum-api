const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ commentRepository, replyRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCaseParameter, useCaseHeader, useCasePayload) {
    const accessToken = await this._authenticationTokenManager
      .getHeaderAuthorization(useCaseHeader.authorization);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(accessToken);

    await this._commentRepository.getCommentById(
      useCaseParameter.commentId, useCaseParameter.threadId,
    );
    const addReply = new AddReply({
      ...useCasePayload, ...useCaseParameter, comment: useCaseParameter.commentId, owner,
    });
    return this._replyRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;
