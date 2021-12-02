const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

const AddedReply = require('../../Domains/replies/entities/AddedReply');
const DetailReply = require('../../Domains/replies/entities/DetailReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply) {
    const {
      comment, owner, content,
    } = addReply;
    const id = `reply-${this._idGenerator(10)}`;

    const query = {
      text: `INSERT INTO replies (id, comment, content, owner)
             VALUES($1, $2, $3, $4) RETURNING id, content, owner`,
      values: [id, comment, content, owner],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async getRepliesByComment(commentId) {
    const query = {
      text: `SELECT replies.*, users.username
             FROM replies INNER JOIN users
             ON replies.owner = users.id
             WHERE replies.comment = $1
             ORDER BY replies.created_at ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((data) => new DetailReply({
      ...data,
    }));
  }

  async getReplyById(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }

    return result.rows;
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted=true WHERE id=$1 returning id',
      values: [replyId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }

    return result.rows;
  }

  async verifyReplyAccess({ ownerId, replyId }) {
    const query = {
      text: 'SELECT 1 FROM replies WHERE owner = $1 AND id = $2',
      values: [ownerId, replyId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthorizationError('aksi dibatasi');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
