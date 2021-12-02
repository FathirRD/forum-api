/* istanbul ignore file */
/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */

const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    thread = 'thread-1234',
    owner = 'user-111',
    content = 'Comment Helper',
    is_deleted = false,
  }) {
    const query = {
      text: `INSERT INTO comments (id, thread, owner, content, is_deleted)
            VALUES($1, $2, $3, $4, $5)`,
      values: [id, thread, owner, content, is_deleted],
    };

    await pool.query(query);
  },

  async addCommentMany() {
    const payload1 = {
      id: 'comment-111',
      thread: 'thread-1234',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      owner: 'user-1111',
    };

    const payload2 = {
      id: 'comment-222',
      thread: 'thread-1234',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      owner: 'user-2222',
    };

    const payload3 = {
      id: 'comment-333',
      thread: 'thread-12345',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      owner: 'user-2222',
    };

    const insertPayload = [payload1, payload2, payload3];

    let i;
    for (i = 0; i < 3; i += 1) {
      const query = {
        text: `INSERT INTO comments(id, thread, content, owner)
               VALUES($1, $2, $3, $4)`,
        values: [
          insertPayload[i].id,
          insertPayload[i].thread,
          insertPayload[i].content,
          insertPayload[i].owner,
        ],
      };

      await pool.query(query);
    }
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },

};

module.exports = CommentsTableTestHelper;
