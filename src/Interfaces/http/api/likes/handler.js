class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putCommentLikeHandler = this.putCommentLikeHandler.bind(this);
  }

  async putCommentLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const toggleCommentLikeUseCase = this._container.getInstance('ToggleCommentLikeUseCase');
    await toggleCommentLikeUseCase.execute({
      threadId,
      commentId,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
