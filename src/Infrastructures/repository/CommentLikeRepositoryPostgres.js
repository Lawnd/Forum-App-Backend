const CommentLikeRepository = require('../../Domains/likes/CommentLikeRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(commentId, owner) {
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comment_likes (id, comment_id, owner) VALUES($1, $2, $3) RETURNING id',
      values: [id, commentId, owner],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async verifyLikeExists(commentId, owner) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);
    return result.rows.length > 0;
  }

  async deleteLike(commentId, owner) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('like tidak ditemukan');
    }
  }

  async getLikeCountsByCommentIds(commentIds) {
    if (commentIds.length === 0) {
      return [];
    }

    const placeholders = commentIds.map((_, index) => `$${index + 1}`).join(', ');
    const query = {
      text: `
        SELECT 
          comment_id as "commentId", 
          COUNT(*)::int as "likeCount"
        FROM comment_likes 
        WHERE comment_id IN (${placeholders})
        GROUP BY comment_id
      `,
      values: commentIds,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = CommentLikeRepositoryPostgres;
