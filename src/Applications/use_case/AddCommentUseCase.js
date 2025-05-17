const NewComment = require('../../Domains/comments/entities/NewComment');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, threadId, owner) {
    await this._threadRepository.verifyThreadAvailability(threadId);

    const newComment = new NewComment({
      content: useCasePayload.content,
      threadId,
      owner,
    });

    const result = await this._commentRepository.addComment(newComment);

    return new AddedComment(result);
  }
}

module.exports = AddCommentUseCase;
