const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const DetailThreadUseCase = require('../DetailThreadUseCase');

describe('DetailThreadUseCase', () => {
  it('should orchestrate the detail thread action correctly', async () => {
    // Arrange
    const useCaseParameter = {
      threadId: 'thread-123',
    };

    const expectedDetailThread = new DetailThread({
      id: 'thread-1234',
      title: 'test thread',
      body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      date: new Date(),
      username: 'tester',
      comments: [],
    });

    const dummyComments = [
      new DetailComment({
        id: 'comment-123',
        thread: 'thread-1234',
        owner: 'user-111',
        created_at: new Date(),
        updated_at: new Date(),
        content: 'aaa',
        replies: [],
        isDeleted: false,
      }),
      new DetailComment({
        id: 'comment-1234',
        thread: 'thread-1234',
        owner: 'user-222',
        created_at: new Date(),
        updated_at: new Date(),
        content: 'bbb',
        replies: [],
        isDeleted: false,
      }),
    ];

    const dummyReplies = [
      new DetailReply({
        id: 'reply-111',
        comment: 'comment-123',
        content: 'baa',
        created_at: new Date(),
        updated_at: new Date(),
        owner: 'user-222',
        isDeleted: false,
      }),
      new DetailReply({
        id: 'reply-222',
        comment: 'comment-123',
        content: 'abb',
        created_at: new Date(),
        updated_at: new Date(),
        owner: 'user-111',
        isDeleted: false,
      }),
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDetailThread));

    mockCommentRepository.getCommentsByThread = jest.fn()
      .mockImplementation(() => Promise.resolve(dummyComments));

    mockReplyRepository.getRepliesByComment = jest.fn()
      .mockImplementation(() => Promise.resolve(dummyReplies));

    const detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Property adjusment
    const dummyComment1 = {
      id: dummyComments[0].id,
      username: 'tester2',
      date: dummyComments[0].created_at,
      content: dummyComments[0].content,
    };
    const dummyComment2 = {
      id: dummyComments[1].id,
      username: 'tester3',
      date: dummyComments[0].created_at,
      content: dummyComments[1].content,
    };

    const dummyReply1 = {
      id: dummyReplies[0].id,
      content: dummyReplies[0].content,
      date: dummyReplies[0].created_at,
      username: 'tester3',
    };
    const dummyReply2 = {
      id: dummyReplies[1].id,
      content: dummyReplies[1].content,
      date: dummyReplies[1].created_at,
      username: 'tester2',
    };

    // Completing dummy comments instance
    const expectedCommentsWithReplies = [
      { ...dummyComment1, replies: [dummyReply1, dummyReply2] },
      { ...dummyComment2, replies: [] },
    ];

    detailThreadUseCase._isDeletedComments = jest.fn()
      .mockImplementation(() => [dummyComment1, dummyComment2]);

    detailThreadUseCase._getCommentsWithReplies = jest.fn()
      .mockImplementation(() => expectedCommentsWithReplies);

    // Action
    const useCaseResult = await detailThreadUseCase.execute(useCaseParameter);

    // Assert
    expect(useCaseResult).toEqual(new DetailThread({
      ...expectedDetailThread, comments: expectedCommentsWithReplies,
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParameter.threadId);
    expect(mockCommentRepository.getCommentsByThread).toBeCalledWith(useCaseParameter.threadId);

    expect(detailThreadUseCase._IsDeletedComments).toBeCalledWith(dummyComments);
    expect(detailThreadUseCase._getRepliesForComments)
      .toBeCalledWith(dummyComments);

    expect(mockReplyRepository.getRepliesByComment).toBeCalledWith(
      [dummyComments[0].comment, dummyComments[1].comment],
    );
  });

  it('should operate the branching in the _isDeletedComments function properly', () => {
    // Arrange
    const detailThreadUseCase = new DetailThreadUseCase(
      { threadRepository: {}, commentRepository: {} },
    );

    const dummyComments = [
      new DetailComment({
        id: 'comment-123',
        thread: 'thread-1234',
        owner: 'user-111',
        created_at: new Date(),
        updated_at: new Date(),
        content: 'aaa',
        replies: [],
        isDeleted: false,
      }),
      new DetailComment({
        id: 'comment-1234',
        thread: 'thread-1234',
        owner: 'user-222',
        created_at: new Date(),
        updated_at: new Date(),
        content: 'bbb',
        replies: [],
        isDeleted: true,
      }),
    ];

    // Property adjusment
    const dummyComment1 = {
      id: dummyComments[0].id,
      username: 'tester2',
      date: dummyComments[0].created_at,
      content: dummyComments[0].content,
    };
    const dummyComment2 = {
      id: dummyComments[1].id,
      username: 'tester3',
      date: dummyComments[0].created_at,
      content: dummyComments[1].content,
    };
    const SpyCheckIsDeletedComments = jest.spyOn(detailThreadUseCase, '_checkIsDeletedComments');

    // action
    detailThreadUseCase._checkIsDeletedComments(dummyComments);

    // assert
    expect(SpyCheckIsDeletedComments).toReturnWith(
      [dummyComment1, { ...dummyComment2, content: '**Komentar telah dihapus**' }]
    );

    SpyCheckIsDeletedComments.mockClear();
  });

  it('should operate the branching in the _getCommentsWithReplies function properly', () => {
    // Arrange
    const detailThreadUseCase = new DetailThreadUseCase(
      { threadRepository: {}, commentRepository: {} },
    );
    const dummyComments = [
      new DetailComment({
        id: 'comment-123',
        thread: 'thread-1234',
        owner: 'user-111',
        created_at: new Date(),
        updated_at: new Date(),
        content: 'aaa',
        replies: [],
        isDeleted: false,
      }),
      new DetailComment({
        id: 'comment-1234',
        thread: 'thread-1234',
        owner: 'user-222',
        created_at: new Date(),
        updated_at: new Date(),
        content: 'bbb',
        replies: [],
        isDeleted: false,
      }),
    ];

    const dummyReplies = [
      new DetailReply({
        id: 'reply-111',
        comment: 'comment-123',
        content: 'baa',
        created_at: new Date(),
        updated_at: new Date(),
        owner: 'user-222',
        isDeleted: false,
      }),
      new DetailReply({
        id: 'reply-222',
        comment: 'comment-123',
        content: 'abb',
        created_at: new Date(),
        updated_at: new Date(),
        owner: 'user-111',
        isDeleted: true,
      }),
    ];

    // Property adjusment
    const dummyComment1 = {
      id: dummyComments[0].id,
      username: 'tester2',
      date: dummyComments[0].created_at,
      content: dummyComments[0].content,
    };
    const dummyComment2 = {
      id: dummyComments[1].id,
      username: 'tester3',
      date: dummyComments[0].created_at,
      content: dummyComments[1].content,
    };

    const dummyReply1 = {
      id: dummyReplies[0].id,
      content: dummyReplies[0].content,
      date: dummyReplies[0].created_at,
      username: 'tester3',
    };
    const dummyReply2 = {
      id: dummyReplies[1].id,
      content: dummyReplies[1].content,
      date: dummyReplies[1].created_at,
      username: 'tester2',
    };

    // Completing dummy comments instance
    const expectedCommentsWithReplies = [
      { ...dummyComment1, replies: [dummyReply1, { ...dummyReply2, content: '**balasan telah dihapus**' }] },
      { ...dummyComment2, replies: [] },
    ];

    const SpyGetRepliesForComments = jest.spyOn(detailThreadUseCase, '_getRepliesWithComments');

    // Action
    detailThreadUseCase._getRepliesWithComments(dummyComments);

    // assert
    expect(SpyGetRepliesForComments).toReturnWith(expectedCommentsWithReplies);

    SpyGetRepliesForComments.mockClear();
  });
});
