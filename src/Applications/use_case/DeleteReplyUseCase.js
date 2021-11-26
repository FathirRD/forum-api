class DeleteReplyUseCase {
  constructor({ replyRepository, authenticationTokenManager }) {
    this._replyRepository = replyRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCaseParameter, useCaseHeader) {
    const accessToken = await this._authenticationTokenManager
      .getHeaderAuthorization(useCaseHeader.authorization);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(accessToken);

    await this._replyRepository.getReplyById(useCaseParameter.replyId);
    await this._replyRepository.verifyReplyAccess({
      owner, id: useCaseParameter.replyId,
    });
    await this._replyRepository.deleteReply(useCaseParameter.replyId);
  }
}

module.exports = DeleteReplyUseCase;
