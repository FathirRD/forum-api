/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ServerTestHelper = {
  async registerTestUser({ server, username = 'tester', password = 'asdf7776' }) {
    const payload = {
      username, password, fullname: 'test test test',
    };
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        ...payload,
      },
    });

    const responseJSON = (JSON.parse(response.payload)).data.addedUser;
    return responseJSON;
  },

  async loginTestUser({ server, username = 'tester', password = 'asdf7776' }) {
    const response = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username, password,
      },
    });

    const responseJSON = (JSON.parse(response.payload)).data;
    return responseJSON;
  },
};

module.exports = ServerTestHelper;
