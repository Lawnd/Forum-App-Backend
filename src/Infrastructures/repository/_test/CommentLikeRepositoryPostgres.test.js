const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');
const pool = require('../../database/postgres/pool');

describe('CommentLikeRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist new like and return like id', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const fakeIdGenerator = () => '123';
      // eslint-disable-next-line max-len
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const likeId = await commentLikeRepositoryPostgres.addLike('comment-123', 'user-123');

      // Assert
      expect(likeId).toEqual('like-123');

      const likes = await CommentLikesTableTestHelper.findLikeByCommentIdAndOwner('comment-123', 'user-123');
      expect(likes).toHaveLength(1);
      expect(likes[0].id).toEqual('like-123');
    });
  });

  describe('verifyLikeExists function', () => {
    it('should return true if like exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await CommentLikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentLikeRepositoryPostgres.verifyLikeExists('comment-123', 'user-123'))
        .resolves.toEqual(true);
    });

    it('should return false if like does not exist', async () => {
      // Arrange
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentLikeRepositoryPostgres.verifyLikeExists('comment-123', 'user-123'))
        .resolves.toEqual(false);
    });
  });

  describe('deleteLike function', () => {
    it('should delete like correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await CommentLikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      await commentLikeRepositoryPostgres.deleteLike('comment-123', 'user-123');

      // Assert
      const likes = await CommentLikesTableTestHelper.findLikeByCommentIdAndOwner('comment-123', 'user-123');
      expect(likes).toHaveLength(0);
    });

    it('should throw NotFoundError when like not found', async () => {
      // Arrange
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentLikeRepositoryPostgres.deleteLike('comment-123', 'user-123'))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('getLikeCountsByCommentIds function', () => {
    it('should return like counts correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId: 'thread-123', owner: 'user-123' });

      // Add likes
      await CommentLikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      await CommentLikesTableTestHelper.addLike({
        id: 'like-456',
        commentId: 'comment-123',
        owner: 'user-456',
      });
      await CommentLikesTableTestHelper.addLike({
        id: 'like-789',
        commentId: 'comment-456',
        owner: 'user-123',
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const likeCounts = await commentLikeRepositoryPostgres.getLikeCountsByCommentIds(['comment-123', 'comment-456']);

      // Assert
      expect(likeCounts).toHaveLength(2);
      expect(likeCounts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            commentId: 'comment-123',
            likeCount: 2,
          }),
          expect.objectContaining({
            commentId: 'comment-456',
            likeCount: 1,
          }),
        ]),
      );
    });

    it('should return empty array when no comment ids provided', async () => {
      // Arrange
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action
      const likeCounts = await commentLikeRepositoryPostgres.getLikeCountsByCommentIds([]);

      // Assert
      expect(likeCounts).toEqual([]);
    });
  });
});
