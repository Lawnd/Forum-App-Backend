class ToggleCommentLikeUseCase {
  constructor({ threadRepository, commentRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { threadId, commentId, owner } = useCasePayload;

    await this._threadRepository.getThreadById(threadId);

    await this._commentRepository.verifyCommentAvailability(commentId);

    const isLiked = await this._commentLikeRepository.verifyLikeExists(commentId, owner);

    if (isLiked) {
      await this._commentLikeRepository.deleteLike(commentId, owner);
    } else {
      await this._commentLikeRepository.addLike(commentId, owner);
    }
  }

  _validatePayload(payload) {
    const { threadId, commentId, owner } = payload;

    if (!threadId || !commentId || !owner) {
      throw new Error('TOGGLE_COMMENT_LIKE_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof owner !== 'string') {
      throw new Error('TOGGLE_COMMENT_LIKE_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ToggleCommentLikeUseCase;
