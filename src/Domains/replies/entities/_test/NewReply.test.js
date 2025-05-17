const NewReply = require('../NewReply');

describe('NewReply entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
      commentId: 'comment-123',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'reply comment',
      commentId: 'comment-123',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    // Action
    const newReply = new NewReply(payload);

    // Assert
    expect(newReply.content).toEqual(payload.content);
    expect(newReply.commentId).toEqual(payload.commentId);
    expect(newReply.owner).toEqual(payload.owner);
    expect(newReply.threadId).toEqual(payload.threadId);
  });
});
