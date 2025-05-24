class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, threadId, owner, date, username, isDeleted,
    } = payload;

    this.id = id;
    this.content = content;
    this.threadId = threadId;
    this.owner = owner;
    this.date = date;
    this.username = username;
    this.isDeleted = isDeleted;
  }

  _verifyPayload({
    id, content, threadId, owner,
  }) {
    if (!id || !content || !threadId || !owner) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string'
      || typeof threadId !== 'string' || typeof owner !== 'string') {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  toDetail(replies, likeCount = 0) {
    const formattedReplies = replies.map((reply) => reply.toDetail());
    return {
      id: this.id,
      username: this.username,
      date: this.date,
      content: this.isDeleted ? '**komentar telah dihapus**' : this.content,
      likeCount,
      replies: formattedReplies,
    };
  }
}

module.exports = Comment;
