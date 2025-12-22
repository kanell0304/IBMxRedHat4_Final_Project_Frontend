import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8081',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 모든 카테고리 조회
export const getCategories = () => {
  return apiClient.get('/community/categories');
};

// 카테고리 생성 (관리자용)
export const createCategory = (categoryName, description) => {
  const formData = new URLSearchParams();
  formData.append('category_name', categoryName);
  if (description) {
    formData.append('description', description);
  }
  
  return apiClient.post('/community/categories', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

// 카테고리 삭제 (관리자용)
export const deleteCategory = (categoryId) => {
  const formData = new URLSearchParams();
  formData.append('category_id', categoryId);

  return apiClient.delete(`/community/categories/${categoryId}`, {
    params: { category_id: categoryId },
    data: formData.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

// 게시글 목록 조회
export const getPosts = (params = {}) => {
  return apiClient.get('/community/posts', { params });
};

// 게시글 상세 조회
export const getPostDetail = (postId, userId = null) => {
  const params = {};
  if (userId) params.user_id = userId;
  
  return apiClient.get(`/community/posts/${postId}`, { params });
};

// 게시글 작성
export const createPost = (postData) => {
  const formData = new URLSearchParams();
  formData.append('user_id', postData.user_id);
  formData.append('category_id', postData.category_id);
  formData.append('title', postData.title);
  formData.append('content', postData.content);
  
  return apiClient.post('/community/posts', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

// 게시글 수정
export const updatePost = (postId, postData) => {
  const formData = new URLSearchParams();
  formData.append('user_id', postData.user_id);
  if (postData.title) {
    formData.append('title', postData.title);
  }
  if (postData.content) {
    formData.append('content', postData.content);
  }
  
  return apiClient.put(`/community/posts/${postId}`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

// 게시글 삭제
export const deletePost = (postId, userId) => {
  return apiClient.delete(`/community/posts/${postId}`, {
    params: { user_id: userId }
  });
};

// 특정 사용자의 게시글 조회
export const getUserPosts = (userId, page = 1, pageSize = 20) => {
  return apiClient.get(`/community/posts/user/${userId}`, {
    params: { page, page_size: pageSize }
  });
};

// 댓글 목록 조회
export const getComments = (postId) => {
  return apiClient.get(`/community/posts/${postId}/comments`);
};

// 댓글과 대댓글 작성
export const createComment = (postId, commentData) => {
  const formData = new URLSearchParams();
  formData.append('user_id', commentData.user_id);
  formData.append('content', commentData.content);
  if (commentData.parent_comment_id) {
    formData.append('parent_comment_id', commentData.parent_comment_id);
  }
  
  return apiClient.post(`/community/posts/${postId}/comments`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

// 댓글 수정
export const updateComment = (commentId, commentData) => {
  const formData = new URLSearchParams();
  formData.append('user_id', commentData.user_id);
  formData.append('content', commentData.content);
  
  return apiClient.put(`/community/comments/${commentId}`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

// 댓글 삭제
export const deleteComment = (commentId, userId) => {
  return apiClient.delete(`/community/comments/${commentId}`, {
    params: { user_id: userId }
  });
};

// 좋아요 토글 (누르기/취소)
export const toggleLike = (postId, userId) => {
  const formData = new URLSearchParams();
  formData.append('user_id', userId);
  
  return apiClient.post(`/community/posts/${postId}/like`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

// 내가 좋아요한 게시글 목록
export const getLikedPosts = (userId, page = 1, pageSize = 20) => {
  return apiClient.get('/community/posts/liked', {
    params: { user_id: userId, page, page_size: pageSize }
  });
};

export default apiClient;
