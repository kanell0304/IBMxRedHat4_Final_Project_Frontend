import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostDetail, deletePost, createComment, updateComment, deleteComment, toggleLike, getComments } from '../../api/communityApi';
import { useAuth } from '../../hooks/useAuth';

export default function CommunityDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState(null); // 대댓글 작성 중인 댓글 id
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState(null); // 수정 중인 댓글 id
  const [editContent, setEditContent] = useState('');
  const hasFetchedRef = useRef(false); // 조회 여부 추적
  const currentPostIdRef = useRef(null); // 현재 postId 추적

  useEffect(() => {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('post_view_') || key.startsWith('post_viewed_v2_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  }, []);

  // 게시글 및 댓글 조회
  useEffect(() => {
    // postId가 변경되었을 때만 ref 초기화 - 이미 조회한 게시글은 조회수 증가x
    if (currentPostIdRef.current !== postId) {
      currentPostIdRef.current = postId;
      hasFetchedRef.current = false;
      
      sessionStorage.removeItem(`post_view_${postId}`);
      sessionStorage.removeItem(`post_viewed_v2_${postId}`);
    }
    
    if (hasFetchedRef.current) {
      return;
    }
    
    hasFetchedRef.current = true;
    
    const loadPost = async () => {
      setLoading(true);
      try {
        const viewKey = `post_v3_${postId}`;
        const hasViewed = sessionStorage.getItem(viewKey);
        
        const response = await getPostDetail(postId, user?.user_id, !hasViewed);
        
        setPost(response.data.data.post);
        setComments(response.data.data.comments);
        
        // 조회수 증가를 기록
        if (!hasViewed) {
          sessionStorage.setItem(viewKey, 'true');
        }
        setError(null);
      } catch (err) {
        setError('게시글을 불러오는데 실패했습니다.');
        console.error('게시글 조회 실패:', err);
        hasFetchedRef.current = false;
      } finally {
        setLoading(false);
      }
    };
    
    loadPost();
  }, [postId, user?.user_id]);
// 댓글만 새로고침 (조회수 증가 방지)
const refreshComments = async () => {
    try {
      const response = await getComments(postId);
      setComments(response.data);
      // 대댓글을 포함해서 댓글 수 업데이트
      if (post) {
        const totalComments = response.data.reduce((sum, comment) => {
          return sum + 1 + (comment.replies ? comment.replies.length : 0);
        }, 0);
        setPost({ ...post, comment_count: totalComments });
      }
    } catch (err) {
      console.error('댓글 조회 실패:', err);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 좋아요 토글
  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const response = await toggleLike(postId, user.user_id);
      setPost((prev) => ({
        ...prev,
        like_count: response.data.like_count,
        is_liked: response.data.action === 'liked',
      }));
    } catch (err) {
      console.error('좋아요 실패:', err);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  // 게시글 수정
  const handleEdit = () => {
    navigate(`/community/edit/${postId}`);
  };

  // 게시글 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deletePost(postId, user.user_id);
      alert('게시글이 삭제되었습니다.');
      navigate('/community');
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!commentContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      await createComment(postId, {
        user_id: user.user_id,
        content: commentContent.trim(),
      });
      setCommentContent('');
      refreshComments(); // 댓글만 새로고침
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  // 대댓글 작성
  const handleReplySubmit = async (parentCommentId) => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!replyContent.trim()) {
      alert('답글 내용을 입력해주세요.');
      return;
    }

    try {
      await createComment(postId, {
        user_id: user.user_id,
        content: replyContent.trim(),
        parent_comment_id: parentCommentId,
      });
      setReplyTo(null);
      setReplyContent('');
      refreshComments(); // 댓글만 새로고침
    } catch (err) {
      console.error('답글 작성 실패:', err);
      alert('답글 작성에 실패했습니다.');
    }
  };

  // 댓글 수정 시작
  const startEditComment = (comment) => {
    setEditingComment(comment.comment_id);
    setEditContent(comment.content);
  };

  // 댓글 수정 취소
  const cancelEditComment = () => {
    setEditingComment(null);
    setEditContent('');
  };

  // 댓글 수정 제출
  const handleEditCommentSubmit = async (commentId) => {
    if (!editContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      await updateComment(commentId, {
        user_id: user.user_id,
        content: editContent.trim(),
      });
      setEditingComment(null);
      setEditContent('');
      refreshComments(); // 댓글만 새로고침
    } catch (err) {
      console.error('댓글 수정 실패:', err);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteComment(commentId, user.user_id);
      refreshComments(); // 댓글만 새로고침
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // 댓글 렌더링
  const renderComment = (comment, isReply = false) => {
    const isEditing = editingComment === comment.comment_id;
    const isAuthor = user && user.user_id === comment.user_id;

    return (
      <div
        key={comment.comment_id}
        className={`${isReply ? 'ml-12 mt-3' : 'mt-4'} p-4 bg-gray-50 rounded-lg`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="font-medium text-gray-900">{comment.author_nickname}</span>
            <span className="ml-3 text-sm text-gray-500">{formatDate(comment.created_at)}</span>
            {comment.updated_at !== comment.created_at && (
              <span className="ml-2 text-xs text-gray-400">(수정됨)</span>
            )}
          </div>
          {isAuthor && !isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => startEditComment(comment)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                수정
              </button>
              <button
                onClick={() => handleDeleteComment(comment.comment_id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleEditCommentSubmit(comment.comment_id)}
                className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                수정 완료
              </button>
              <button
                onClick={cancelEditComment}
                className="px-4 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            {!isReply && (
              <button
                onClick={() => setReplyTo(comment.comment_id)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                답글
              </button>
            )}
          </>
        )}

        {/* 대댓글 작성 폼 */}
        {replyTo === comment.comment_id && (
          <div className="mt-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답글을 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleReplySubmit(comment.comment_id)}
                className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                답글 작성
              </button>
              <button
                onClick={() => {
                  setReplyTo(null);
                  setReplyContent('');
                }}
                className="px-4 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 대댓글 목록 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-xl text-red-600 mb-4">{error || '게시글을 찾을 수 없습니다.'}</div>
        <button
          onClick={() => navigate('/community')}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          목록으로
        </button>
      </div>
    );
  }

  const isAuthor = user && user.user_id === post.user_id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 목록으로 버튼 */}
        <button
          onClick={() => navigate('/community')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </button>

        {/* 게시글 상세 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* 헤더 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded">
                {post.category_name}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900">{post.author_nickname}</span>
                <span>{formatDate(post.created_at)}</span>
                {post.updated_at !== post.created_at && (
                  <span className="text-xs">(수정됨)</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span>조회 {post.view_count}</span>
                <span>좋아요 {post.like_count}</span>
                <span>댓글 {post.comment_count}</span>
              </div>
            </div>
          </div>

          {/* 내용 */}
          <div className="p-6 min-h-[300px]">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>
          </div>

          {/* 좋아요 버튼 */}
          <div className="p-6 border-t border-gray-200 flex justify-center">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                post.is_liked
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg
                className={`w-6 h-6 ${post.is_liked ? 'fill-current' : ''}`}
                fill={post.is_liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="font-medium">{post.like_count}</span>
            </button>
          </div>

          {/* 작성자 액션 버튼 */}
          {isAuthor && (
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {/* 댓글 섹션 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            댓글 <span className="text-blue-600">{post.comment_count}</span>
          </h2>

          {/* 댓글 작성 폼 */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="댓글을 입력해주세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  댓글 작성
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-md text-center">
              <p className="text-gray-600">
                댓글을 작성하려면{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  로그인
                </button>
                이 필요합니다.
              </p>
            </div>
          )}

          {/* 댓글 목록 */}
          {comments.length === 0 ? (
            <div className="py-12 text-center text-gray-500">첫 댓글을 작성해보세요!</div>
          ) : (
            <div className="space-y-1">
              {comments.map((comment) => renderComment(comment))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
