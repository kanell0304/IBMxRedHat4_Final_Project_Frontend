import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategories, getPostDetail, updatePost } from '../../api/communityApi';
import { useAuth } from '../../hooks/useAuth';
import PhoneFrame from '../Layout/PhoneFrame';
import MainLayout from '../Layout/MainLayout';

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
        const postResponse = await getPostDetail(postId, null, false);
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

  if (!user) {
    return null;
  }

  const renderFrame = (node) => (
    <PhoneFrame showTitleRow title="게시글 수정" contentClass="px-0 pt-[2px] pb-4" onBack={() => navigate(-1)}>
      <MainLayout fullWidth showHeader={false} showFooter={false}>
        {node}
      </MainLayout>
    </PhoneFrame>
  );

  const currentCategoryName =
    categories.find((category) => category.category_id.toString() === formData.category_id)?.category_name || '게시판';

  if (loading) {
    return renderFrame(
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-base text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error && !formData.title) {
    return renderFrame(
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="text-base text-red-600">{error}</div>
        <button onClick={() => navigate('/community')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          목록으로
        </button>
      </div>
    );
  }

  const content = (
    <div className="w-full max-w-md mx-auto px-4 py-5 space-y-4">
      {/* 상단 카드 */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-300 mb-1">커뮤니티 · {currentCategoryName}</p>
            <h1 className="text-2xl font-extrabold leading-8">게시글 수정</h1>
            <p className="text-sm text-slate-200 mt-1">내용을 다듬어 다시 공유해 보세요.</p>
          </div>
          <span className="px-3 py-1 text-xs rounded-full bg-white/15 border border-white/10">수정 중</span>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 shadow-sm">
          {error}
        </div>
      )}

      {/* 수정 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-100 p-4 space-y-5">
        {/* 카테고리 선택 (수정 불가) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="category_id" className="text-sm font-semibold text-slate-800">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-slate-500">수정 불가</span>
          </div>
          <div className="relative">
            <select id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} disabled className="w-full appearance-none px-3 py-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 pr-10 cursor-not-allowed">
              <option value="">카테고리를 선택해주세요</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-slate-500">카테고리는 변경할 수 없습니다.</p>
        </div>

        {/* 제목 입력 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="title" className="text-sm font-semibold text-slate-800">
              제목 <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-400">{formData.title.length}/200</span>
          </div>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} maxLength={200} placeholder="제목을 입력해주세요" className={`w-full px-3 py-2 rounded-xl bg-slate-50 border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.title ? 'border-red-400' : 'border-slate-200'}`} />
          {validationErrors.title && <p className="text-xs text-red-500">{validationErrors.title}</p>}
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
          {validationErrors.content && <p className="text-xs text-red-500">{validationErrors.content}</p>}
        </div>

        {/* 작성자 정보 & 변경사항 */}
        <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600 border border-slate-100 space-y-2">
          <p>
            작성자: <span className="font-semibold text-slate-900">{user.nickname}</span>
          </p>
          {hasChanges() && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm">변경된 내용이 있습니다.</span>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
            disabled={submitting}
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={submitting || !hasChanges()}
          >
            {submitting ? '수정 중...' : '수정 완료'}
          </button>
        </div>
      </form>

      {/* 안내 메시지 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <h3 className="font-semibold text-blue-900 mb-1">게시글 수정 안내</h3>
        <ul className="space-y-1">
          <li>• 카테고리는 수정할 수 없습니다.</li>
          <li>• 수정된 게시글에는 "(수정됨)" 표시가 추가됩니다.</li>
          <li>• 다른 사람에게 혼란을 주는 내용으로 수정하지 말아주세요.</li>
        </ul>
      </div>
    </div>
  );

  return renderFrame(content);
}