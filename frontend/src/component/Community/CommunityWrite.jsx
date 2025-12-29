import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCategories, createPost } from '../../api/communityApi';
import { useAuth } from '../../hooks/useAuth';
import PhoneFrame from '../Layout/PhoneFrame';
import MainLayout from '../Layout/MainLayout';

export default function CommunityWrite() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const preselectedCategoryId = location.state?.selectedCategoryId;
  const preselectedCategoryName = location.state?.selectedCategoryName;

  // 폼 데이터
  const [formData, setFormData] = useState({
    category_id: preselectedCategoryId ? String(preselectedCategoryId) : '',
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
        // 작성된 카테고리 리스트 화면으로 이동 (선택 상태 유지)
        navigate('/community', { state: { selectedCategoryId: postData.category_id } });
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

  const activeCategoryName =
    categories.find((category) => String(category.category_id) === String(formData.category_id))
      ?.category_name || preselectedCategoryName;
  const headerTitle = activeCategoryName || '게시글 작성';

  const content = (
    <div className="w-full max-w-md mx-auto px-4 py-5 space-y-4">
      {/* 헤더 */}
      <div className="space-y-1">
        <h1 className="text-xl font-extrabold text-slate-900">{headerTitle}</h1>
        <p className="text-sm text-slate-600">여러분의 경험과 후기를 공유해주세요</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 작성 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-[0_12px_32px_rgba(15,23,42,0.1)] border border-slate-100 p-4 space-y-5">
        {/* 카테고리 선택 */}
        <div className="space-y-2">
          <label htmlFor="category_id" className="block text-sm font-semibold text-slate-800">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-xl bg-slate-50 border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.category_id ? 'border-red-400' : 'border-slate-200'
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
            <p className="text-xs text-red-500">{validationErrors.category_id}</p>
          )}
        </div>

        {/* 제목 입력 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="title" className="text-sm font-semibold text-slate-800">
              제목 <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-400">{formData.title.length}/200</span>
          </div>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            maxLength={200}
            placeholder="제목을 입력해주세요"
            className={`w-full px-3 py-2 rounded-xl bg-slate-50 border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.title ? 'border-red-400' : 'border-slate-200'
            }`}
          />
          {validationErrors.title && (
            <p className="text-xs text-red-500">{validationErrors.title}</p>
          )}
        </div>

        {/* 내용 입력 */}
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-semibold text-slate-800">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={10}
            placeholder="내용을 입력해주세요"
            className={`w-full px-3 py-3 rounded-xl bg-slate-50 border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              validationErrors.content ? 'border-red-400' : 'border-slate-200'
            }`}
          />
          {validationErrors.content && (
            <p className="text-xs text-red-500">{validationErrors.content}</p>
          )}
        </div>

        {/* 작성자 정보 */}
        <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600 border border-slate-100">
          작성자: <span className="font-semibold text-slate-900">{user.nickname}</span>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? '작성 중...' : '작성 완료'}
          </button>
        </div>
      </form>

      {/* 안내 메시지 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <h3 className="font-semibold text-blue-900 mb-1">게시글 작성 안내</h3>
        <ul className="space-y-1">
          <li>• 다른 사람에게 도움이 되는 내용을 작성해주세요.</li>
          <li>• 욕설, 비방, 광고성 게시글은 삭제될 수 있습니다.</li>
          <li>• 저작권을 침해하는 내용은 게시하지 말아주세요.</li>
        </ul>
      </div>
    </div>
  );

  return (
    <PhoneFrame showTitleRow title={headerTitle} contentClass="px-0 pt-[2px] pb-4">
      <MainLayout fullWidth showHeader={false} showFooter={false}>
        {content}
      </MainLayout>
    </PhoneFrame>
  );
}
