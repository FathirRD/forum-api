const CreateThread = require('../../Domains/threads/entities/CreateThread');

class AddThreadUseCase {
  constructor({ threadRepository, authenticationTokenManager }) {
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload, useCaseHeader) {
    const accessToken = await this._authenticationTokenManager
      .getHeaderAuthorization(useCaseHeader.authorization);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(accessToken);
    const addThread = new CreateThread({ ...useCasePayload, owner });
    return this._threadRepository.addThread(addThread);
  }
}

module.exports = AddThreadUseCase;
