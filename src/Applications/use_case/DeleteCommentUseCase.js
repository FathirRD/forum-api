class DeleteCommentUseCase {
  constructor({
    commentRepository, authenticationTokenManager,
  }) {
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCaseParameter, useCaseHeader) {
    const { threadId, commentId } = useCaseParameter;
    const accessToken = await this._authenticationTokenManager
      .getHeaderAuthorization(useCaseHeader.authorization);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: ownerId } = await this._authenticationTokenManager.decodePayload(accessToken);

    await this._commentRepository.getCommentById(commentId);
    await this._commentRepository.verifyCommentAccess({ commentId, ownerId });
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
