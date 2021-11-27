const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

const AddedComment = require('../../Domains/comments/entities/AddedComment');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const {
      content, thread, owner,
    } = addComment;
    const id = `comment-${this._idGenerator(10)}`;

    const query = {
      text: `INSERT INTO comments (id, thread, content, owner)
             VALUES($1, $2, $3, $4) RETURNING id, content, owner`,
      values: [id, thread, content, owner],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async getCommentsByThread(threadId) {
    const query = {
      text: `SELECT comments.*, users.username
             FROM comments INNER JOIN users
             ON comments.owner = users.id
             WHERE comments.thread = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((data) => new DetailComment({
      ...data, replies: [],
    }));
  }

  async getCommentById(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    return result.rows;
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted=true WHERE id=$1 RETURNING id',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    return result.rows;
  }

  async verifyCommentAccess({ commentId, ownerId }) {
    const query = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, ownerId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('aksi dibatasi');
    }
  }
}

module.exports = CommentRepositoryPostgres;
