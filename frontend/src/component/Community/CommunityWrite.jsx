import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createPost } from '../../api/communityApi';
import { useAuth } from '../../hooks/useAuth';

export default function CommunityWrite() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 폼 데이터
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    content: '',
  });

  // 유효성 검사 에러
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // 로그인 체크
    if (!authLoading && !isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 카테고리 목록 조회
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (err) {
        console.error('카테고리 조회 실패:', err);
        setError('카테고리를 불러오는데 실패했습니다.');
      }
    };
    fetchCategories();
  }, [authLoading, isAuthenticated, navigate]);

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

  // 게시글 작성
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const postData = {
        user_id: user.user_id,
        category_id: parseInt(formData.category_id),
        title: formData.title.trim(),
        content: formData.content.trim(),
      };

      const response = await createPost(postData);
      
      if (response.data.post_id) {
        // 작성된 게시글 상세 페이지로 이동
        navigate(`/community/${response.data.post_id}`);
      } else {
        setError('게시글 작성에 실패했습니다.');
      }
    } catch (err) {
      console.error('게시글 작성 실패:', err);
      setError(err.response?.data?.detail || '게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 취소
  const handleCancel = () => {
    if (formData.title || formData.content) {
      if (window.confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        navigate('/community');
      }
    } else {
      navigate('/community');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">게시글 작성</h1>
          <p className="text-gray-600">여러분의 경험과 후기를 공유해주세요</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 작성 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {/* 카테고리 선택 */}
          <div className="mb-6">
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.category_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">카테고리를 선택해주세요</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
            {validationErrors.category_id && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.category_id}</p>
            )}
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

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? '작성 중...' : '작성 완료'}
            </button>
          </div>
        </form>

        {/* 안내 메시지 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-900 mb-2">게시글 작성 안내</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 다른 사람에게 도움이 되는 내용을 작성해주세요.</li>
            <li>• 욕설, 비방, 광고성 게시글은 삭제될 수 있습니다.</li>
            <li>• 저작권을 침해하는 내용은 게시하지 말아주세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
