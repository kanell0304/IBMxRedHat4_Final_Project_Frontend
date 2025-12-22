import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPosts, getCategories } from '../../api/communityApi';
import { useAuth } from '../../hooks/useAuth';

const CommunityList = ({ onCategorySelected = () => {}, resetSignal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryPreviews, setCategoryPreviews] = useState({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOrder, setSortOrder] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedNavCategory, setAppliedNavCategory] = useState(false);
  const pageSize = 20;
  useEffect(() => {
    if (resetSignal) {
      setSelectedCategory(null);
      setCurrentPage(1);
      onCategorySelected(null, '커뮤니티');
    }
  }, [resetSignal]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
        await fetchCategoryPreviews(response.data);
      } catch (err) {
        console.error('카테고리 조회 실패:', err);
      }
    };
    fetchCategories();
  }, []);

  // 작성 완료 등 외부에서 선택 카테고리를 전달했을 때 적용
  useEffect(() => {
    const navCategoryId = location.state?.selectedCategoryId;
    if (!appliedNavCategory && navCategoryId && categories.length > 0) {
      setSelectedCategory(navCategoryId);
      setCurrentPage(1);
      setSearchTerm('');
      const name = getCategoryName(navCategoryId);
      onCategorySelected(navCategoryId, name);
      setAppliedNavCategory(true);
      // history state 제거
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.state, categories, appliedNavCategory]);

  const fetchCategoryPreviews = async (categoryList) => {
    if (!categoryList?.length) return;
    setPreviewLoading(true);
    try {
      const previewResults = await Promise.all(
        categoryList.map(async (category) => {
          try {
            const response = await getPosts({
              page: 1,
              page_size: 1,
              order_by: 'latest',
              category_id: category.category_id,
            });
            const latestPost = response.data?.data?.[0] || null;
            return { categoryId: category.category_id, post: latestPost };
          } catch (err) {
            console.error(`카테고리 ${category.category_id} 미리보기 조회 실패:`, err);
            return { categoryId: category.category_id, post: null };
          }
        })
      );

      const previewMap = previewResults.reduce((acc, { categoryId, post }) => {
        acc[categoryId] = post;
        return acc;
      }, {});

      setCategoryPreviews(previewMap);
      setPreviewError(null);
    } catch (err) {
      setPreviewError('카테고리 미리보기를 불러오는데 실패했습니다.');
      console.error('카테고리 미리보기 조회 실패:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      if (!selectedCategory) {
        setPosts([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }

      setLoading(true);
      try {
        const params = {
          page: currentPage,
          page_size: pageSize,
          order_by: sortOrder,
          category_id: selectedCategory,
        };

        const response = await getPosts(params);
        setPosts(response.data.data);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.total_pages);
        setError(null);
      } catch (err) {
        setError('게시글을 불러오는데 실패했습니다.');
        console.error('게시글 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, selectedCategory, sortOrder]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    const name = getCategoryName(categoryId);
    onCategorySelected(categoryId, name);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handlePostClick = (postId) => {
    navigate(`/community/${postId}`);
  };

  const handleWriteClick = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    navigate('/community/write');
  };

  const isPostRecent = (dateString) => {
    if (!dateString) return false;
    const createdAt = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - createdAt) / 3600000);
    return diffHours < 48;
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return '커뮤니티';
    const matched = categories.find((category) => category.category_id === categoryId);
    return matched ? matched.category_name : '커뮤니티';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const diffMinutes = Math.floor(diff / 60000);
    const diffHours = Math.floor(diff / 3600000);
    const diffDays = Math.floor(diff / 86400000);

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString('ko-KR');
  };

  const renderPagination = () => {
    const pages = [];
    const maxPages = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          이전
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 rounded-md ${
            currentPage === i
              ? 'bg-blue-500 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          다음
        </button>
      );
    }

    return pages;
  };

  const filteredPosts = searchTerm
    ? posts.filter((post) => {
        const keyword = searchTerm.trim().toLowerCase();
        return (
          post.title.toLowerCase().includes(keyword) ||
          (post.content && post.content.toLowerCase().includes(keyword)) ||
          (post.author_nickname && post.author_nickname.toLowerCase().includes(keyword))
        );
      })
    : posts;

  const isListMode = !!selectedCategory;

  return (
    <div
      className={`w-full max-w-full mx-auto px-0 pt-4 pb-2 ${
        isListMode ? 'bg-gradient-to-b from-[#fff5ec] via-white to-[#eef2ff]' : 'bg-white'
      }`}
    >
      <div className="px-4">
        {!isListMode && (
          <div className="mb-6">
            <div className="rounded-[28px] bg-gradient-to-br from-[#e6efff] via-white to-[#dff3ff] text-slate-900 shadow-[0_18px_38px_rgba(59,130,246,0.16)] border border-[#dbe9ff] overflow-hidden">
              <div className="px-5 pt-5 pb-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-blue-700">커뮤니티 게시판</p>
                  <h2 className="text-xl font-extrabold leading-tight text-slate-950">게시판 바로가기</h2>
                </div>
              </div>
              {previewLoading ? (
                <div className="px-5 py-6 text-sm text-slate-500">게시판 정보를 불러오는 중입니다...</div>
              ) : categories.length === 0 ? (
                <div className="px-5 py-6 text-sm text-slate-500">등록된 카테고리가 없습니다.</div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {categories.map((category) => {
                    const latestPost = categoryPreviews[category.category_id];

                    return (
                      <button
                        type="button"
                        key={category.category_id}
                        onClick={() => handleCategoryChange(category.category_id)}
                        className="w-full flex items-center gap-3 px-5 py-4 text-left transition hover:bg-white/70"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-slate-900">{category.category_name}</span>
                            {latestPost && isPostRecent(latestPost.created_at) && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-500 text-white rounded-full leading-none">
                                N
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 truncate">
                            {latestPost ? latestPost.title : '첫 글을 남겨보세요.'}
                          </p>
                        </div>
                        <span className="text-slate-400 text-lg">›</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {previewError && (
                <div className="px-5 py-3 text-sm text-red-500 bg-white/70">{previewError}</div>
              )}
            </div>
          </div>
        )}

        {isListMode && (
          <>
            <div className="mb-3 bg-gradient-to-r from-[#fff2e8] via-white to-[#e6f1ff] rounded-3xl p-5 shadow-[0_10px_26px_rgba(15,23,42,0.07)] border border-white/60">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">카테고리</p>
                  <p className="text-xl font-extrabold text-slate-900">{getCategoryName(selectedCategory)}</p>
                  <p className="text-sm text-slate-600">따뜻한 이야기와 정보를 나눠보세요</p>
                </div>
                <button
                  onClick={handleWriteClick}
                  className="px-4 py-2 bg-white text-slate-900 rounded-xl font-semibold border border-slate-200 shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:bg-slate-50 transition"
                >
                  ✍️ 글쓰기
                </button>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-3 justify-between items-center sticky top-[6px] z-10 bg-white/90 backdrop-blur rounded-2xl px-3 py-2 shadow-[0_10px_22px_rgba(15,23,42,0.05)] border border-slate-100/80">
              <div className="flex gap-2">
                <button
                  onClick={() => handleSortChange('latest')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                    sortOrder === 'latest'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.28)]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  최신순
                </button>
                <button
                  onClick={() => handleSortChange('popular')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                    sortOrder === 'popular'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.28)]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  인기순
                </button>
                <button
                  onClick={() => handleSortChange('views')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                    sortOrder === 'views'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.28)]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  조회순
                </button>
              </div>
              <div className="flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 shadow-[0_6px_18px_rgba(15,23,42,0.08)] w-full max-w-[240px]">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
                <input
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="게시글 검색"
                  className="ml-2 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400 w-full"
                />
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_18px_40px_rgba(15,23,42,0.12)] overflow-hidden">
              {filteredPosts.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 text-lg">
                    {searchTerm ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleWriteClick}
                      className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      첫 게시글 작성하기
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.post_id}
                      onClick={() => handlePostClick(post.post_id)}
                      className="p-6 hover:bg-slate-50 cursor-pointer transition-colors bg-white/95"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full shadow-[0_6px_12px_rgba(37,99,235,0.15)]">
                              {post.category_name}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="font-semibold text-gray-700">{post.author_nickname}</span>
                            <span className="text-gray-300">•</span>
                            <span>{formatDate(post.created_at)}</span>
                            <span className="text-gray-300">•</span>
                            <span>조회 {post.view_count}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          {post.like_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          {post.comment_count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {totalPages > 1 && !searchTerm && (
              <div className="mt-8 flex justify-center items-center gap-2">
                {renderPagination()}
              </div>
            )}

            <div className="mt-4 text-center text-sm text-gray-500">
              {searchTerm
                ? `검색 결과 ${filteredPosts.length}개`
                : `전체 ${total}개의 게시글`}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityList;
