const AddReply = require('../AddReply');

describe('a AddReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      comment: 'comment-123',
    };

    // Action
    // Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      comment: 'comment-123',
      content: 'aaaaaaaaaaaaaaaaaaaa',
      owner: new Date(),
    };

    // Action
    // Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddReply entities correctly', () => {
    // Arrange
    const payload = {
      comment: 'comment-123',
      content: 'aaaaaaaaaaaaaaaa',
      owner: 'user-1234',
    };

    // Action
    const addReply = new AddReply(payload);

    // Assert
    expect(addReply).toBeInstanceOf(AddReply);
    expect(addReply.thread).toEqual(payload.thread);
    expect(addReply.content).toEqual(payload.content);
    expect(addReply.owner).toEqual(payload.owner);
  });
});
