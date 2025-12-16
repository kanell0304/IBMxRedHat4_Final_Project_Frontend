import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategories, getPostDetail, updatePost } from '../../api/communityApi';
import { useAuth } from '../../hooks/useAuth';

export default function CommunityEdit() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 폼 데이터
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    content: '',
  });

  // 원본 데이터 (변경 감지용)
  const [originalData, setOriginalData] = useState(null);

  // 유효성 검사 에러
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // 로그인 체크
    if (!authLoading && !isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 카테고리 및 게시글 정보 조회
    const fetchData = async () => {
      try {
        // 카테고리 조회
        const categoriesResponse = await getCategories();
        setCategories(categoriesResponse.data);

        // 게시글 조회
        const postResponse = await getPostDetail(postId);
        const post = postResponse.data.data.post;

        // 작성자 확인
        if (post.user_id !== user.user_id) {
          alert('수정 권한이 없습니다.');
          navigate(`/community/${postId}`);
          return;
        }

        const data = {
          category_id: post.category_id.toString(),
          title: post.title,
          content: post.content,
        };

        setFormData(data);
        setOriginalData(data);
        setError(null);
      } catch (err) {
        console.error('데이터 조회 실패:', err);
        setError('게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, authLoading, isAuthenticated, navigate]);

  // 입력 값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 해당 필드의 에러 메시지 제거
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // 유효성 검사
  const validate = () => {
    const errors = {};

    if (!formData.category_id) {
      errors.category_id = '카테고리를 선택해주세요.';
    }

    if (!formData.title.trim()) {
      errors.title = '제목을 입력해주세요.';
    } else if (formData.title.length > 200) {
      errors.title = '제목은 200자 이내로 입력해주세요.';
    }

    if (!formData.content.trim()) {
      errors.content = '내용을 입력해주세요.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 변경사항 확인
  const hasChanges = () => {
    if (!originalData) return false;
    return (
      formData.title !== originalData.title ||
      formData.content !== originalData.content ||
      formData.category_id !== originalData.category_id
    );
  };

  // 게시글 수정
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!hasChanges()) {
      alert('변경된 내용이 없습니다.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const postData = {
        user_id: user.user_id,
        title: formData.title.trim(),
        content: formData.content.trim(),
      };

      await updatePost(postId, postData);
      alert('게시글이 수정되었습니다.');
      navigate(`/community/${postId}`);
    } catch (err) {
      console.error('게시글 수정 실패:', err);
      setError(err.response?.data?.detail || '게시글 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 취소
  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm('변경사항이 저장되지 않습니다. 정말 취소하시겠습니까?')) {
        navigate(`/community/${postId}`);
      }
    } else {
      navigate(`/community/${postId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <button
          onClick={() => navigate('/community')}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">게시글 수정</h1>
          <p className="text-gray-600">게시글 내용을 수정할 수 있습니다</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 수정 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {/* 카테고리 선택 (수정 불가) */}
          <div className="mb-6">
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            >
              <option value="">카테고리를 선택해주세요</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">카테고리는 수정할 수 없습니다</p>
          </div>

          {/* 제목 입력 */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={200}
              placeholder="제목을 입력해주세요 (최대 200자)"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="mt-1 flex justify-between items-center">
              {validationErrors.title ? (
                <p className="text-sm text-red-500">{validationErrors.title}</p>
              ) : (
                <p className="text-sm text-gray-500">제목을 입력해주세요</p>
              )}
              <p className="text-sm text-gray-500">{formData.title.length}/200</p>
            </div>
          </div>

          {/* 내용 입력 */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={15}
              placeholder="내용을 입력해주세요"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                validationErrors.content ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.content && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.content}</p>
            )}
          </div>

          {/* 작성자 정보 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              작성자: <span className="font-medium text-gray-900">{user.nickname}</span>
            </p>
          </div>

          {/* 변경사항 표시 */}
          {hasChanges() && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">변경된 내용이 있습니다.</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={submitting || !hasChanges()}
            >
              {submitting ? '수정 중...' : '수정 완료'}
            </button>
          </div>
        </form>

        {/* 안내 메시지 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-900 mb-2">게시글 수정 안내</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 카테고리는 수정할 수 없습니다.</li>
            <li>• 수정된 게시글에는 "(수정됨)" 표시가 추가됩니다.</li>
            <li>• 다른 사람에게 혼란을 주는 내용으로 수정하지 말아주세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
