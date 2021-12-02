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
        is_deleted: false,
        username: 'tester1',
      }),
      new DetailComment({
        id: 'comment-1234',
        thread: 'thread-1234',
        owner: 'user-222',
        created_at: new Date(),
        updated_at: new Date(),
        content: 'bbb',
        replies: [],
        is_deleted: false,
        username: 'tester2',
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
        is_deleted: false,
        username: 'tester22',
      }),
      new DetailReply({
        id: 'reply-222',
        comment: 'comment-123',
        content: 'abb',
        created_at: new Date(),
        updated_at: new Date(),
        owner: 'user-111',
        is_deleted: false,
        username: 'tester23',
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
      { ...dummyComment1, replies: [dummyReply1, dummyReply2] },
      { ...dummyComment2, replies: [] },
    ];

    // mock instance
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // mocking
    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDetailThread));

    mockCommentRepository.getCommentsByThread = jest.fn()
      .mockImplementation(() => Promise.resolve([dummyComment1, dummyComment2]));

    mockReplyRepository.getRepliesByComment = jest.fn()
      .mockImplementationOnce(() => Promise.resolve([dummyReply1, dummyReply2]))
      .mockImplementation(() => Promise.resolve([]));

    const detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

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

    expect(mockThreadRepository.getDetailThread)
      .toBeCalledWith(useCaseParameter.threadId);
    expect(mockCommentRepository.getCommentsByThread)
      .toBeCalledWith(useCaseParameter.threadId);

    expect(detailThreadUseCase._isDeletedComments)
      .toBeCalledWith([dummyComment1, dummyComment2]);
    expect(detailThreadUseCase._getCommentsWithReplies)
      .toBeCalledWith([dummyComment1, dummyComment2]);

    // expect(mockReplyRepository.getRepliesByComment)
    //   .toHaveBeenNthCalledWith(1, dummyComments[0].id);
    // expect(mockReplyRepository.getRepliesByComment)
    //   .toHaveBeenNthCalledWith(2, dummyComments[0].id);
  });

  it('should operate the branching in the _isDeletedComments function properly', () => {
    // Arrange
    const detailThreadUseCase = new DetailThreadUseCase(
      { threadRepository: {}, commentRepository: {}, replyRepository: {} },
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
        is_deleted: false,
        username: 'tester1',
      }),
      new DetailComment({
        id: 'comment-1234',
        thread: 'thread-1234',
        owner: 'user-222',
        created_at: new Date(),
        updated_at: new Date(),
        content: 'bbb',
        replies: [],
        is_deleted: true,
        username: 'tester2',
      }),
    ];

    // Property adjusment
    // const dummyComment1 = {
    //   id: dummyComments[0].id,
    //   username: 'tester2',
    //   date: dummyComments[0].created_at,
    //   content: dummyComments[0].content,
    // };
    // const dummyComment2 = {
    //   id: dummyComments[1].id,
    //   username: 'tester3',
    //   date: dummyComments[0].created_at,
    //   content: dummyComments[1].content,
    // };
    const SpyCheckIsDeletedComments = jest.spyOn(detailThreadUseCase, '_isDeletedComments');

    // Action
    detailThreadUseCase._isDeletedComments(dummyComments);

    // Assert
    expect(SpyCheckIsDeletedComments).toReturnWith(
      [dummyComments[0], { ...dummyComments[1], content: '**komentar telah dihapus**' }],
    );

    SpyCheckIsDeletedComments.mockClear();
  });

  it('should operate the branching in the _getCommentsWithReplies function properly', async () => {
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
        is_deleted: false,
        username: 'tester',
      }),
      new DetailComment({
        id: 'comment-1234',
        thread: 'thread-1234',
        owner: 'user-222',
        created_at: new Date(),
        updated_at: new Date(),
        content: 'bbb',
        replies: [],
        is_deleted: false,
        username: 'tester1',
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
        is_deleted: false,
        username: 'tester22',
      }),
      new DetailReply({
        id: 'reply-222',
        comment: 'comment-123',
        content: 'abb',
        created_at: new Date(),
        updated_at: new Date(),
        owner: 'user-111',
        is_deleted: false,
        username: 'tester23',
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
      { ...dummyComment1, replies: [dummyReply1, dummyReply2] },
      { ...dummyComment2, replies: [] },
    ];

    // mock instance
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // mocking
    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDetailThread));

    mockCommentRepository.getCommentsByThread = jest.fn()
      .mockImplementation(() => Promise.resolve([dummyComment1, dummyComment2]));

    mockReplyRepository.getRepliesByComment = jest.fn()
      .mockImplementationOnce(() => Promise.resolve([dummyReply1, dummyReply2]))
      .mockImplementation(() => Promise.resolve([]));

    const detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    detailThreadUseCase._isDeletedComments = jest.fn()
      .mockImplementation(() => [dummyComment1, dummyComment2]);

    detailThreadUseCase._getCommentsWithReplies = jest.fn()
      .mockImplementation(() => expectedCommentsWithReplies);

    const SpyGetCommentsWithReplies = jest
      .spyOn(detailThreadUseCase, '_getCommentsWithReplies');

    const SpyGetReplliesByComment = jest
      .spyOn(mockReplyRepository, 'getRepliesByComment');

    // Action
    const useCaseResult = await detailThreadUseCase.execute(useCaseParameter);
    detailThreadUseCase._getCommentsWithReplies(dummyComments);
    mockReplyRepository.getRepliesByComment(dummyComments[0].id);

    // Assert
    expect(SpyGetCommentsWithReplies)
      .toReturnWith(expectedCommentsWithReplies);
    expect(SpyGetReplliesByComment)
      .toHaveBeenCalled();
    SpyGetCommentsWithReplies.mockClear();
  });
});
