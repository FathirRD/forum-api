/* eslint-disable camelcase */

class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.content = payload.content;
    this.thread = payload.thread;
    this.created_at = payload.created_at;
    this.updated_at = payload.updated_at;
    this.is_deleted = payload.is_deleted;
    this.owner = payload.owner;
    this.replies = payload.replies;
    this.username = payload.username;
  }

  _verifyPayload(payload) {
    const {
      id, content, thread, created_at, updated_at, owner, is_deleted, replies, username,
    } = payload;

    if (
      !id
      || !content
      || !thread
      || !created_at
      || !updated_at
      || !owner
      || is_deleted === undefined
      || !replies
      || !username
    ) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof thread !== 'string'
      || typeof content !== 'string'
      || !(created_at instanceof Date && !Number.isNaN(created_at))
      || !(updated_at instanceof Date && !Number.isNaN(updated_at))
      || typeof is_deleted !== 'boolean'
      || typeof owner !== 'string'
      || !(Array.isArray(replies))
      || typeof username !== 'string'
    ) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailComment;
