const Thread = require('../Thread');

describe('ThreadDetail entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'thread abc',
      body: 'body thread abc',
      date: '2025-05-01T03:59:56.666Z',
      username: 'dicoding',
      // comments is missing
    };

    // Action and Assert
    expect(() => new Thread(payload)).toThrowError('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 123,
      body: 'body thread abc',
      date: '2025-05-01T03:59:56.666Z',
      username: 'dicoding',
      comments: {},
    };

    // Action and Assert
    expect(() => new Thread(payload)).toThrowError('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ThreadDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'thread abc',
      body: 'body thread abc',
      date: '2025-05-01T03:59:56.666Z',
      username: 'dicoding',
      comments: [],
    };

    // Action
    const threadDetail = new Thread(payload);

    // Assert
    expect(threadDetail.id).toEqual(payload.id);
    expect(threadDetail.title).toEqual(payload.title);
    expect(threadDetail.body).toEqual(payload.body);
    expect(threadDetail.date).toEqual(payload.date);
    expect(threadDetail.username).toEqual(payload.username);
    expect(threadDetail.comments).toEqual(payload.comments);
  });

  it('should create ThreadDetail object with comments correctly', () => {
    // Arrange
    const comments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2025-05-01T04:59:56.666Z',
        content: 'sebuah comment',
        replies: [],
      },
    ];

    const payload = {
      id: 'thread-123',
      title: 'thread abc',
      body: 'body thread abc',
      date: '2025-05-01T03:59:56.666Z',
      username: 'dicoding',
      comments,
    };

    // Action
    const threadDetail = new Thread(payload);

    // Assert
    expect(threadDetail.id).toEqual(payload.id);
    expect(threadDetail.title).toEqual(payload.title);
    expect(threadDetail.body).toEqual(payload.body);
    expect(threadDetail.date).toEqual(payload.date);
    expect(threadDetail.username).toEqual(payload.username);
    expect(threadDetail.comments).toEqual(comments);
  });
});
