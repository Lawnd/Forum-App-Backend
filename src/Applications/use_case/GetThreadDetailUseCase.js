const Thread = require('../../Domains/threads/entities/Thread');
const Comment = require('../../Domains/comments/entities/Comment');
const Reply = require('../../Domains/replies/entities/Reply');

class GetThreadDetailUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    commentLikeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);

    const rawComments = await this._commentRepository.getCommentsByThreadId(threadId);
    const comments = rawComments.map((comment) => new Comment(comment));

    const commentIds = comments.map((comment) => comment.id);
    const rawReplies = await this._replyRepository.getRepliesByCommentIds(commentIds);
    const replies = rawReplies.map((reply) => new Reply(reply));

    const likeCounts = await this._commentLikeRepository.getLikeCountsByCommentIds(commentIds);

    const formattedComments = comments.map((comment) => {
      const relatedReplies = replies.filter((reply) => reply.commentId === comment.id);
      const likeCountData = likeCounts.find((lc) => lc.commentId === comment.id);
      const likeCount = likeCountData ? likeCountData.likeCount : 0;

      return comment.toDetail(relatedReplies, likeCount);
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
