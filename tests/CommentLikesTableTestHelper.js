/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
  async addLike({
    id = 'like-123',
    commentId = 'comment-123',
    owner = 'user-123',
    createdAt = new Date().toISOString(),
  }) {
    const query = {
      text: 'INSERT INTO comment_likes (id, comment_id, owner, created_at) VALUES($1, $2, $3, $4)',
      values: [id, commentId, owner, createdAt],
    };

    await pool.query(query);
  },

  async findLikeByCommentIdAndOwner(commentId, owner) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findLikesById(id) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*)::int as like_count FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);
    return result.rows[0].like_count;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentLikesTableTestHelper;
