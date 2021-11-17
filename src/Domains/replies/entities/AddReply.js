class AddReply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.comment = payload.comment;
    this.content = payload.content;
    this.owner = payload.owner;
  }

  _verifyPayload(payload) {
    const { comment, content, owner } = payload;

    if (!comment || !content || !owner) {
      throw new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof comment !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddReply;
