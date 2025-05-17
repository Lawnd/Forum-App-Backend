const Reply = require('../Reply');

describe('Reply entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'reply comment',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 123,
      commentId: 'comment-123',
      owner: {},
    };

    // Action and Assert
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Reply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'reply comment',
      commentId: 'comment-123',
      owner: 'user-123',
      date: '2025-05-01T03:59:56.666Z',
      username: 'johndoe',
      isDeleted: false,
    };

    // Action
    const reply = new Reply(payload);

    // Assert
    expect(reply.id).toEqual(payload.id);
    expect(reply.content).toEqual(payload.content);
    expect(reply.commentId).toEqual(payload.commentId);
    expect(reply.owner).toEqual(payload.owner);
    expect(reply.date).toEqual(payload.date);
    expect(reply.username).toEqual(payload.username);
    expect(reply.isDeleted).toEqual(payload.isDeleted);
  });

  it('should show actual content when isDeleted is false', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'reply comment',
      commentId: 'comment-123',
      owner: 'user-123',
      date: '2025-05-01T03:59:56.666Z',
      username: 'johndoe',
      isDeleted: false,
    };
    const reply = new Reply(payload);

    // Action
    const detailedReply = reply.toDetail();

    // Assert
    expect(detailedReply).toEqual({
      id: 'reply-123',
      content: 'reply comment',
      date: '2025-05-01T03:59:56.666Z',
      username: 'johndoe',
    });
  });

  it('should show "**balasan telah dihapus**" when isDeleted is true', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'reply comment',
      commentId: 'comment-123',
      owner: 'user-123',
      date: '2025-05-01T03:59:56.666Z',
      username: 'johndoe',
      isDeleted: true,
    };
    const reply = new Reply(payload);

    // Action
    const detailedReply = reply.toDetail();

    // Assert
    expect(detailedReply).toEqual({
      id: 'reply-123',
      content: '**balasan telah dihapus**',
      date: '2025-05-01T03:59:56.666Z',
      username: 'johndoe',
    });
  });
});
