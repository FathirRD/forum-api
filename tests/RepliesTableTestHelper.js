/* istanbul ignore file */
/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */

const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    comment = 'comment-111',
    owner = 'user-222',
    content = 'asdfasdfasdf',
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4)',
      values: [id, comment, owner, content],
    };

    await pool.query(query);
  },

  async addReplyMany() {
    const payload1 = {
      id: 'reply-111',
      comment: 'comment-111',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      owner: 'user-1111',
    };

    const payload2 = {
      id: 'reply-222',
      comment: 'comment-111',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
      owner: 'user-1111',
    };

    const payload3 = {
      id: 'reply-333',
      comment: 'comment-222',
      content: 'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      owner: 'user-2222',
    };

    const insertPayload = [payload1, payload2, payload3];

    let i;
    for (i = 0; i < 3; i += 1) {
      const query = {
        text: `INSERT INTO replies (id, comment, content, owner)
               VALUES($1, $2, $3, $4)`,
        values: [
          insertPayload[i].id,
          insertPayload[i].comment,
          insertPayload[i].content,
          insertPayload[i].owner,
        ],
      };

      await pool.query(query);
    }
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },

  async deleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET is_deleted=TRUE WHERE id=$1',
      values: [id],
    };
    await pool.query(query);
  },

};

module.exports = RepliesTableTestHelper;
