const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentLikeRepository = require('../../../Domains/likes/CommentLikeRepository');
const Thread = require('../../../Domains/threads/entities/Thread');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate the get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockThreadRepositoryReturn = {
      id: threadId,
      title: 'thread abc',
      body: 'body thread abc',
      date: '2025-05-01T03:59:56.666Z',
      username: 'dicoding',
    };

    const mockCommentsRepositoryReturn = [{
      id: 'comment-123',
      content: 'sebuah comment',
      threadId,
      owner: 'user-johndoe',
      date: '2025-05-01T04:59:56.666Z',
      username: 'johndoe',
      isDeleted: false,
    },
    {
      id: 'comment-456',
      content: 'sebuah comment yang telah dihapus',
      threadId,
      owner: 'user-dicoding',
      date: '2025-05-01T05:59:56.666Z',
      username: 'dicoding',
      isDeleted: true,
    },
    ];

    const mockRepliesRepositoryReturn = [
      {
        id: 'reply-123',
        content: 'balasan comment',
        commentId: 'comment-123',
        owner: 'user-johndoe',
        date: '2025-05-01T06:59:56.666Z',
        username: 'johndoe',
        isDeleted: false,
      },
      {
        id: 'reply-456',
        content: 'balasan comment yang telah dihapus',
        commentId: 'comment-123',
        owner: 'user-dicoding',
        date: '2025-05-01T07:59:56.666Z',
        username: 'dicoding',
        isDeleted: true,
      },
    ];

    const mockLikeCountsReturn = [
      {
        commentId: 'comment-123',
        likeCount: 2,
      },
      {
        commentId: 'comment-456',
        likeCount: 0,
      },
    ];

    const comments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2025-05-01T04:59:56.666Z',
        content: 'sebuah comment',
        likeCount: 2,
        replies: [
          {
            id: 'reply-123',
            content: 'balasan comment',
            date: '2025-05-01T06:59:56.666Z',
            username: 'johndoe',
          },
          {
            id: 'reply-456',
            content: '**balasan telah dihapus**',
            date: '2025-05-01T07:59:56.666Z',
            username: 'dicoding',
          },
        ],
      },
      {
        id: 'comment-456',
        username: 'dicoding',
        date: '2025-05-01T05:59:56.666Z',
        content: '**komentar telah dihapus**',
        likeCount: 0,
        replies: [],
      },
    ];

    const expectedThreadDetail = new Thread({
      id: threadId,
      title: 'thread abc',
      body: 'body thread abc',
      date: '2025-05-01T03:59:56.666Z',
      username: 'dicoding',
      comments,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockResolvedValue(mockThreadRepositoryReturn);
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockResolvedValue(mockCommentsRepositoryReturn);
    mockReplyRepository.getRepliesByCommentIds = jest.fn()
      .mockResolvedValue(mockRepliesRepositoryReturn);
    mockCommentLikeRepository.getLikeCountsByCommentIds = jest.fn()
      .mockResolvedValue(mockLikeCountsReturn);

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail).toStrictEqual(expectedThreadDetail);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith(['comment-123', 'comment-456']);
    expect(mockCommentLikeRepository.getLikeCountsByCommentIds).toBeCalledWith(['comment-123', 'comment-456']);
  });

  it('should handle comments with no likes correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockThreadRepositoryReturn = {
      id: threadId,
      title: 'thread abc',
      body: 'body thread abc',
      date: '2025-05-01T03:59:56.666Z',
      username: 'dicoding',
    };

    const mockCommentsRepositoryReturn = [{
      id: 'comment-123',
      content: 'sebuah comment',
      threadId,
      owner: 'user-johndoe',
      date: '2025-05-01T04:59:56.666Z',
      username: 'johndoe',
      isDeleted: false,
    }];

    const mockRepliesRepositoryReturn = [];
    const mockLikeCountsReturn = [];

    const expectedComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2025-05-01T04:59:56.666Z',
        content: 'sebuah comment',
        likeCount: 0,
        replies: [],
      },
    ];

    const expectedThreadDetail = new Thread({
      id: threadId,
      title: 'thread abc',
      body: 'body thread abc',
      date: '2025-05-01T03:59:56.666Z',
      username: 'dicoding',
      comments: expectedComments,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockResolvedValue(mockThreadRepositoryReturn);
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockResolvedValue(mockCommentsRepositoryReturn);
    mockReplyRepository.getRepliesByCommentIds = jest.fn()
      .mockResolvedValue(mockRepliesRepositoryReturn);
    mockCommentLikeRepository.getLikeCountsByCommentIds = jest.fn()
      .mockResolvedValue(mockLikeCountsReturn);

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail).toStrictEqual(expectedThreadDetail);
    expect(mockCommentLikeRepository.getLikeCountsByCommentIds).toBeCalledWith(['comment-123']);
  });

  it('should handle empty comments correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockThreadRepositoryReturn = {
      id: threadId,
      title: 'thread abc',
      body: 'body thread abc',
      date: '2025-05-01T03:59:56.666Z',
      username: 'dicoding',
    };

    const mockCommentsRepositoryReturn = [];
    const mockRepliesRepositoryReturn = [];
    const mockLikeCountsReturn = [];

    const expectedThreadDetail = new Thread({
      id: threadId,
      title: 'thread abc',
      body: 'body thread abc',
      date: '2025-05-01T03:59:56.666Z',
      username: 'dicoding',
      comments: [],
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockResolvedValue(mockThreadRepositoryReturn);
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockResolvedValue(mockCommentsRepositoryReturn);
    mockReplyRepository.getRepliesByCommentIds = jest.fn()
      .mockResolvedValue(mockRepliesRepositoryReturn);
    mockCommentLikeRepository.getLikeCountsByCommentIds = jest.fn()
      .mockResolvedValue(mockLikeCountsReturn);

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail).toStrictEqual(expectedThreadDetail);
    expect(mockCommentLikeRepository.getLikeCountsByCommentIds).toBeCalledWith([]);
  });
});
