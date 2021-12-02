/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */

class detailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParameter) {
    const { threadId } = useCaseParameter;
    const threadDetail = await this._threadRepository.getDetailThread(threadId);
    threadDetail.comments = await this._commentRepository.getCommentsByThread(threadId);

    threadDetail.comments = this._isDeletedComments(threadDetail.comments);
    threadDetail.comments = await this._getCommentsWithReplies(threadDetail.comments);

    return threadDetail;
  }

  _isDeletedComments(comments) {
    for (let i = 0; i < comments.length; i += 1) {
      if (comments[i].is_deleted) comments[i].content = '**komentar telah dihapus**';
      comments[i].date = String(comments[i].created_at);
      delete comments[i].created_at;
      delete comments[i].is_deleted;
    }
    return comments;
  }

  async _getCommentsWithReplies(comments) {
    for (let i = 0; i < comments.length; i += 1) {
      const commentReplies = await this._replyRepository.getRepliesByComment(comments[i].id);
      comments[i].replies = commentReplies.map((reply) => {
        if (reply.is_deleted) reply.content = '**balasan telah dihapus**';
        reply.date = String(reply.created_at);
        delete reply.created_at;
        delete reply.is_deleted;
        return reply;
      });
    }
    return comments;
  }
}

module.exports = detailThreadUseCase;
