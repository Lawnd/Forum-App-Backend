const Comment = require('../Comment');

describe('Comment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'comment thread abc',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 123,
      threadId: 'thread-123',
      owner: {},
    };

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Comment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'comment thread abc',
      threadId: 'thread-123',
      owner: 'user-123',
      date: '2025-05-01T03:59:56.666Z',
      username: 'johndoe',
      isDeleted: false,
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.content).toEqual(payload.content);
    expect(comment.threadId).toEqual(payload.threadId);
    expect(comment.owner).toEqual(payload.owner);
    expect(comment.date).toEqual(payload.date);
    expect(comment.username).toEqual(payload.username);
    expect(comment.isDeleted).toEqual(payload.isDeleted);
  });

  it('should show actual content when isDeleted is false and format replies correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'comment thread abc',
      threadId: 'thread-123',
      owner: 'user-123',
      date: '2025-05-01T03:59:56.666Z',
      username: 'johndoe',
      isDeleted: false,
    };

    const comment = new Comment(payload);

    const replies = [
      {
        toDetail: () => ({
          id: 'reply-123',
          content: 'first reply',
          date: '2025-05-01T04:00:00.000Z',
          username: 'user1',
        }),
      },
      {
        toDetail: () => ({
          id: 'reply-456',
          content: 'second reply',
          date: '2025-05-01T04:30:00.000Z',
          username: 'user2',
        }),
      },
    ];

    // Action
    const detailedComment = comment.toDetail(replies);

    // Assert
    expect(detailedComment).toEqual({
      id: 'comment-123',
      content: 'comment thread abc',
      date: '2025-05-01T03:59:56.666Z',
      username: 'johndoe',
      replies: [
        {
          id: 'reply-123',
          content: 'first reply',
          date: '2025-05-01T04:00:00.000Z',
          username: 'user1',
        },
        {
          id: 'reply-456',
          content: 'second reply',
          date: '2025-05-01T04:30:00.000Z',
          username: 'user2',
        },
      ],
    });
  });

  it('should show "**komentar telah dihapus**" when isDeleted is true', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'comment thread abc',
      threadId: 'thread-123',
      owner: 'user-123',
      date: '2025-05-01T03:59:56.666Z',
      username: 'johndoe',
      isDeleted: true,
    };

    const comment = new Comment(payload);

    const replies = [
      {
        toDetail: () => ({
          id: 'reply-123',
          content: 'a reply',
          date: '2025-05-01T04:00:00.000Z',
          username: 'user1',
        }),
      },
    ];

    // Action
    const detailedComment = comment.toDetail(replies);

    // Assert
    expect(detailedComment).toEqual({
      id: 'comment-123',
      content: '**komentar telah dihapus**',
      date: '2025-05-01T03:59:56.666Z',
      username: 'johndoe',
      replies: [
        {
          id: 'reply-123',
          content: 'a reply',
          date: '2025-05-01T04:00:00.000Z',
          username: 'user1',
        },
      ],
    });
  });

  it('should handle empty replies array correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'comment thread abc',
      threadId: 'thread-123',
      owner: 'user-123',
      date: '2025-05-01T03:59:56.666Z',
      username: 'johndoe',
      isDeleted: false,
    };

    const comment = new Comment(payload);
    const replies = [];

    // Action
    const detailedComment = comment.toDetail(replies);

    // Assert
    expect(detailedComment).toEqual({
      id: 'comment-123',
      content: 'comment thread abc',
      date: '2025-05-01T03:59:56.666Z',
      username: 'johndoe',
      replies: [],
    });
  });
});
