const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'thread abc',
        body: 'body thread abc',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment abc',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const newReply = new NewReply({
        content: 'balasan comment',
        commentId: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'balasan comment',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteReply function', () => {
    it('should update is_deleted to true in the database', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'thread abc',
        body: 'body thread abc',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment abc',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'balasan comment',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].is_deleted).toEqual(true);
    });
  });

  describe('getRepliesByCommentIds function', () => {
    it('should return all replies from the given comment IDs correctly', async () => {
      // Arrange
      const commentId1 = 'comment-123';
      const commentId2 = 'comment-456';
      const replyId1 = 'reply-123';
      const replyId2 = 'reply-456';
      const date1 = '2021-08-08T07:59:48.766Z';
      const date2 = '2021-08-08T08:07:01.522Z';

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'thread abc',
        body: 'body thread abc',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: commentId1,
        content: 'comment abc',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: commentId2,
        content: 'comment abc lain',
        threadId: 'thread-123',
        owner: 'user-456',
      });
      await RepliesTableTestHelper.addReply({
        id: replyId1,
        content: 'balasan comment',
        commentId: commentId1,
        owner: 'user-456',
        createdAt: date1,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId2,
        content: 'balasan comment lain',
        commentId: commentId1,
        owner: 'user-123',
        createdAt: date2,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      // eslint-disable-next-line max-len
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds([commentId1, commentId2]);

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toEqual(replyId1);
      expect(replies[0].username).toEqual('johndoe');
      expect(replies[0].date).toEqual(date1);
      expect(replies[0].content).toEqual('balasan comment');
      expect(replies[0].isDeleted).toEqual(false);
      expect(replies[0].commentId).toEqual(commentId1);
      expect(replies[1].id).toEqual(replyId2);
      expect(replies[1].username).toEqual('dicoding');
      expect(replies[1].date).toEqual(date2);
      expect(replies[1].content).toEqual('balasan comment lain');
      expect(replies[1].isDeleted).toEqual(false);
      expect(replies[1].commentId).toEqual(commentId1);
    });

    it('should return empty array when no replies are found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'thread abc',
        body: 'body thread abc',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment abc',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds(['comment-123']);

      // Assert
      expect(replies).toHaveLength(0);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when owner is not the reply creator', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'thread abc',
        body: 'body thread abc',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment abc',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'balasan comment',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456'))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should not throw error when owner is the reply creator', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'thread abc',
        body: 'body thread abc',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment abc',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'balasan comment',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
        .resolves
        .not.toThrowError(AuthorizationError);
    });
  });

  describe('verifyReplyAvailability function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw error when reply exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'thread abc',
        body: 'body thread abc',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment abc',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'balasan comment',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-123'))
        .resolves
        .not.toThrowError(NotFoundError);
    });
  });
});
