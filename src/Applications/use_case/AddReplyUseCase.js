const NewReply = require('../../Domains/replies/entities/NewReply');
const AddedReply = require('../../Domains/replies/entities/AddedReply');

class AddReplyUseCase {
  constructor({ commentRepository, threadRepository, replyRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload, threadId, commentId, owner) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);

    const newReply = new NewReply({
      content: useCasePayload.content,
      commentId,
      owner,
      threadId,
    });

    const result = await this._replyRepository.addReply(newReply);

    return new AddedReply(result);
  }
}

module.exports = AddReplyUseCase;
