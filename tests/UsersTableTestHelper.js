/* istanbul ignore file */
/* eslint no-await-in-loop: "off" */

const pool = require('../src/Infrastructures/database/postgres/pool');

const UsersTableTestHelper = {
  async addUser({
    id = 'user-123', username = 'dicoding', password = 'secret', fullname = 'Dicoding Indonesia',
  }) {
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4)',
      values: [id, username, password, fullname],
    };

    await pool.query(query);
  },

  async addUserMany() {
    const payload1 = {
      id: 'user-1111',
      username: 'tester1',
      password: 'asdf7776',
      fullname: 'test test test',
    };

    const payload2 = {
      id: 'user-2222',
      username: 'tester2',
      password: 'asdf7776',
      fullname: 'test test test',
    };

    const insertPayload = [payload1, payload2];

    let i;
    for (i = 0; i < 2; i += 1) {
      const query = {
        text: 'INSERT INTO users VALUES($1, $2, $3, $4)',
        values: [
          insertPayload[i].id,
          insertPayload[i].username,
          insertPayload[i].password,
          insertPayload[i].fullname,
        ],
      };

      await pool.query(query);
    }
  },

  async findUsersById(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM users WHERE 1=1');
  },
};

module.exports = UsersTableTestHelper;
