/* eslint-disable camelcase */

class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.comment = payload.comment;
    this.content = payload.content;
    this.created_at = payload.created_at;
    this.updated_at = payload.updated_at;
    this.owner = payload.owner;
    this.is_deleted = payload.is_deleted;
  }

  _verifyPayload(payload) {
    const {
      id, comment, content, created_at, updated_at, owner, is_deleted,
    } = payload;

    if (
      !id
      || !comment
      || !content
      || !created_at
      || !updated_at
      || !owner
      || is_deleted === undefined
    ) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (
      typeof id !== 'string'
      || typeof comment !== 'string'
      || typeof content !== 'string'
      || !(created_at instanceof Date && !Number.isNaN(created_at))
      || !(updated_at instanceof Date && !Number.isNaN(updated_at))
      || typeof owner !== 'string'
      || typeof is_deleted !== 'boolean'
    ) {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailReply;
