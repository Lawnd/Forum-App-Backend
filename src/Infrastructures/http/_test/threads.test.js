const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread abc',
        body: 'body thread abc',
      };
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
      expect(responseJson.data.addedThread.owner).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread abc',
      };
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread abc',
        body: 123,
      };
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread abc',
        body: 'body thread abc',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail with comments and replies', async () => {
      // Arrange
      const server = await createServer(container);
      const threadId = 'thread-123';
      const userId1 = 'user-123';
      const userId2 = 'user-456';
      const commentId1 = 'comment-123';
      const commentId2 = 'comment-456';
      const replyId1 = 'reply-123';
      const replyId2 = 'reply-456';
      const threadDate = '2025-05-04T07:19:09.775Z';
      const commentDate1 = '2025-05-04T07:22:33.555Z';
      const commentDate2 = '2025-05-04T07:26:21.338Z';
      const replyDate1 = '2025-05-04T07:59:48.766Z';
      const replyDate2 = '2025-05-04T08:07:01.522Z';

      await UsersTableTestHelper.addUser({ id: userId1, username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: userId2, username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'thread abc',
        body: 'body thread abc',
        owner: userId1,
        createdAt: threadDate,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId1,
        content: 'comment abc',
        threadId,
        owner: userId2,
        createdAt: commentDate1,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId2,
        content: 'comment abc yang telah dihapus',
        threadId,
        owner: userId1,
        isDeleted: true,
        createdAt: commentDate2,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId1,
        content: 'balasan comment',
        commentId: commentId1,
        owner: userId1,
        createdAt: replyDate1,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId2,
        content: 'balasan comment yang telah dihapus',
        commentId: commentId1,
        owner: userId2,
        isDeleted: true,
        createdAt: replyDate2,
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.title).toEqual('thread abc');
      expect(responseJson.data.thread.body).toEqual('body thread abc');
      expect(responseJson.data.thread.date).toEqual(threadDate);
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);

      // Check first comment
      expect(responseJson.data.thread.comments[0].id).toEqual(commentId1);
      expect(responseJson.data.thread.comments[0].username).toEqual('johndoe');
      expect(responseJson.data.thread.comments[0].date).toEqual(commentDate1);
      expect(responseJson.data.thread.comments[0].content).toEqual('comment abc');

      // Check first comment's replies
      expect(responseJson.data.thread.comments[0].replies).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].replies[0].id).toEqual(replyId1);
      expect(responseJson.data.thread.comments[0].replies[0].username).toEqual('dicoding');
      expect(responseJson.data.thread.comments[0].replies[0].date).toEqual(replyDate1);
      expect(responseJson.data.thread.comments[0].replies[0].content).toEqual('balasan comment');
      expect(responseJson.data.thread.comments[0].replies[1].id).toEqual(replyId2);
      expect(responseJson.data.thread.comments[0].replies[1].username).toEqual('johndoe');
      expect(responseJson.data.thread.comments[0].replies[1].date).toEqual(replyDate2);
      expect(responseJson.data.thread.comments[0].replies[1].content).toEqual('**balasan telah dihapus**');

      // Check second comment (deleted)
      expect(responseJson.data.thread.comments[1].id).toEqual(commentId2);
      expect(responseJson.data.thread.comments[1].username).toEqual('dicoding');
      expect(responseJson.data.thread.comments[1].date).toEqual(commentDate2);
      expect(responseJson.data.thread.comments[1].content).toEqual('**komentar telah dihapus**');
      expect(responseJson.data.thread.comments[1].replies).toBeDefined();
      expect(responseJson.data.thread.comments[1].replies).toHaveLength(0);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-xxx',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
