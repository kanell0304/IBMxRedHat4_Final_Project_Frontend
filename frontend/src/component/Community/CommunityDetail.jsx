import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostDetail, deletePost, createComment, updateComment, deleteComment, toggleLike, getComments } from '../../api/communityApi';
import { useAuth } from '../../hooks/useAuth';
import PhoneFrame from '../Layout/PhoneFrame';
import MainLayout from '../Layout/MainLayout';

export default function CommunityDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState(null); // 대댓글 작성 중인 댓글 id
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const hasFetchedRef = useRef(false);

  // 게시글 및 댓글 조회
  useEffect(() => {
    // 인증 로딩 중이면 대기
    if (authLoading) {
      return;
    }
    
    // 이미 호출했으면 리턴
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    
    const loadPost = async () => {
      setLoading(true);
      try {
        // user가 있을 때만 user_id 전달
        const response = await getPostDetail(postId, user?.user_id);
        setPost(response.data.data.post);
        setComments(response.data.data.comments);
        setError(null);
      } catch (err) {
        setError('게시글을 불러오는데 실패했습니다.');
        console.error('게시글 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadPost();
    
    return () => {
      hasFetchedRef.current = false;
    };
  }, [postId, user?.user_id, authLoading]);

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
      // setIsLiked(!isLiked);
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
      const categoryIdForRedirect = post?.category_id;
      await deletePost(postId, user.user_id);
      alert('게시글이 삭제되었습니다.');
      navigate('/community', {
        state: categoryIdForRedirect ? { selectedCategoryId: categoryIdForRedirect } : undefined,
      });
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

  const handleBackToList = () => {
    if (post?.category_id) {
      navigate('/community', { state: { selectedCategoryId: post.category_id } });
    } else {
      navigate(-1);
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
      <PhoneFrame showTitleRow title="게시글 상세" contentClass="px-0 pt-[2px] pb-4" onBack={handleBackToList}>
        <MainLayout fullWidth showHeader={false} showFooter={false}>
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-xl text-gray-600">로딩 중...</div>
          </div>
        </MainLayout>
      </PhoneFrame>
    );
  }

  if (error || !post) {
    return (
      <PhoneFrame showTitleRow title="게시글 상세" contentClass="px-0 pt-[2px] pb-4" onBack={handleBackToList}>
        <MainLayout fullWidth showHeader={false} showFooter={false}>
          <div className="flex flex-col justify-center items-center min-h-[60vh]">
            <div className="text-xl text-red-600 mb-4">{error || '게시글을 찾을 수 없습니다.'}</div>
            <button
              onClick={() => navigate('/community')}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              목록으로
            </button>
          </div>
        </MainLayout>
      </PhoneFrame>
    );
  }

  const isAuthor = user && user.user_id === post.user_id;

  return (
    <PhoneFrame
      showTitleRow
      title="게시글 상세"
      contentClass="px-0 pt-[2px] pb-4"
      onBack={handleBackToList}
    >
      <MainLayout fullWidth showHeader={false} showFooter={false}>
        <div className="w-full max-w-xl mx-auto px-4 py-4 space-y-6">
          {/* 게시글 카드 */}
          <div className="bg-white rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.12)] border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">
                  {post.category_name}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-snug mb-3">{post.title}</h1>
              <div className="flex items-center justify-between text-sm text-slate-500 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800">{post.author_nickname}</span>
                  <span className="text-slate-300">•</span>
                  <span>{formatDate(post.created_at)}</span>
                  {post.updated_at !== post.created_at && (
                    <span className="text-xs text-slate-400">(수정됨)</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span>조회 {post.view_count}</span>
                  <span>좋아요 {post.like_count}</span>
                  <span>댓글 {post.comment_count}</span>
                </div>
              </div>
            </div>

            <div className="p-5">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  post.is_liked
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <svg
                  className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`}
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
                <span className="font-semibold">{post.like_count}</span>
              </button>

              {isAuthor && (
                <div className="flex gap-2">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200"
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
          </div>

          {/* 댓글 섹션 */}
          <div className="bg-white rounded-2xl shadow-[0_10px_26px_rgba(15,23,42,0.1)] border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                댓글 <span className="text-blue-600">{post.comment_count}</span>
              </h2>
            </div>

            {/* 댓글 작성 폼 */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-5 space-y-3">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="댓글을 입력해주세요"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    댓글 작성
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl text-center text-sm text-slate-600">
                댓글을 작성하려면{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  로그인
                </button>
                이 필요합니다.
              </div>
            )}

            {/* 댓글 목록 */}
            {comments.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">첫 댓글을 작성해보세요!</div>
            ) : (
              <div className="space-y-2">
                {comments.map((comment) => renderComment(comment))}
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </PhoneFrame>
  );
}
