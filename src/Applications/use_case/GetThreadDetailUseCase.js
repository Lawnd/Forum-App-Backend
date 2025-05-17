const Thread = require('../../Domains/threads/entities/Thread');
const Comment = require('../../Domains/comments/entities/Comment');
const Reply = require('../../Domains/replies/entities/Reply');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);

    const rawComments = await this._commentRepository.getCommentsByThreadId(threadId);
    const comments = rawComments.map((comment) => new Comment(comment));

    const commentIds = comments.map((comment) => comment.id);
    const rawReplies = await this._replyRepository.getRepliesByCommentIds(commentIds);
    const replies = rawReplies.map((reply) => new Reply(reply));

    const formattedComments = comments.map((comment) => {
      const relatedReplies = replies.filter((reply) => reply.commentId === comment.id);
      return comment.toDetail(relatedReplies);
    });

    return new Thread({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: formattedComments,
    });
  }
}

module.exports = GetThreadDetailUseCase;
