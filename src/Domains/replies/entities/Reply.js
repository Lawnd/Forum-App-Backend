class Reply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, commentId, owner, date, username, isDeleted,
    } = payload;

    this.id = id;
    this.content = content;
    this.commentId = commentId;
    this.owner = owner;
    this.date = date;
    this.username = username;
    this.isDeleted = isDeleted;
  }

  _verifyPayload({
    id, content, commentId, owner,
  }) {
    if (!id || !content || !commentId || !owner) {
      throw new Error('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string'
      || typeof commentId !== 'string' || typeof owner !== 'string') {
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  toDetail() {
    return {
      id: this.id,
      content: this.isDeleted ? '**balasan telah dihapus**' : this.content,
      date: this.date,
      username: this.username,
    };
  }
}

module.exports = Reply;
