const DetailComment = require('../DetailComment');

describe('a DetailComment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // arrange
    const payload = {
      id: 'comment-123',
      content: 'aaaaaa',
      thread: 'thread-123',
      created_at: new Date(),
      updated_at: new Date(),
    };

    // action & assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      id: 'comment-123',
      content: 'aaaaaa',
      thread: 'thread-123',
      created_at: {},
      updated_at: new Date(),
      is_deleted: true,
      owner: 'user-1234',
      replies: [],
      username: 'asdf',
    };

    // action & assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailComment object properly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'aaaaaa',
      thread: 'thread-123',
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
      owner: 'user-1234',
      replies: [],
      username: 'asdftester',
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.content).toEqual(payload.content);
    expect(detailComment.thread).toEqual(payload.thread);
    expect(detailComment.created_at).toEqual(payload.created_at);
    expect(detailComment.updated_at).toEqual(payload.updated_at);
    expect(detailComment.is_deleted).toEqual(payload.is_deleted);
    expect(detailComment.owner).toEqual(payload.owner);
    expect(detailComment.replies).toEqual(payload.replies);
    expect(detailComment.username).toEqual(payload.username);
  });
});
