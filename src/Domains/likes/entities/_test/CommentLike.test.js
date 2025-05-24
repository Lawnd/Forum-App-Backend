const CommentLike = require('../CommentLike');

describe('CommentLike entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'like-123',
      commentId: 'comment-123',
    };

    // Action and Assert
    expect(() => new CommentLike(payload)).toThrowError('COMMENT_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new CommentLike(payload)).toThrowError('COMMENT_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create commentLike object correctly', () => {
    // Arrange
    const payload = {
      id: 'like-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // Action
    const commentLike = new CommentLike(payload);

    // Assert
    expect(commentLike.id).toEqual(payload.id);
    expect(commentLike.commentId).toEqual(payload.commentId);
    expect(commentLike.owner).toEqual(payload.owner);
  });
});
