const DetailReply = require('../DetailReply');

describe('a DetailReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      comment: 'comment-123',
      content: 'aaaaaaaaaaaa',
      owner: 'user-1234',
    };

    // Action
    // Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      comment: 'comment-1234',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      created_at: new Date(),
      updated_at: new Date(),
      owner: 'user-1234',
      is_deleted: 'YES',
      username: 'asdlkfjclvnx,cvnxcv,xncv',
    };

    // Action
    // Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedReply entities correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      comment: 'comment-1234',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      created_at: new Date(),
      updated_at: new Date(),
      owner: 'user-1234',
      is_deleted: false,
      username: 'aiyaiyaiayia',
    };

    // Action
    const addedReply = new DetailReply(payload);

    // Assert
    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.comment).toEqual(payload.comment);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.created_at).toEqual(payload.created_at);
    expect(addedReply.updated_at).toEqual(payload.updated_at);
    expect(addedReply.owner).toEqual(payload.owner);
    expect(addedReply.is_deleted).toEqual(payload.is_deleted);
    expect(addedReply.username).toEqual(payload.username);
  });
});
