const AddComment = require('../AddComment');

describe('a AddComment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'Test Comment',
      thread: 'thread-123,',
    };

    // Action
    // Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: {},
      thread: 'thread-123',
      owner: 'user-1234',
    };

    // Action
    // Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddComment entities correctly', () => {
    // Arrange
    const payload = {
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      thread: 'thread-123',
      owner: 'user-123',
    };

    // Action
    const comment = new AddComment(payload);

    // Assert
    expect(comment).toBeInstanceOf(AddComment);
    expect(comment.content).toEqual(payload.content);
    expect(comment.thread).toEqual(payload.thread);
    expect(comment.owner).toEqual(payload.owner);
  });
});
