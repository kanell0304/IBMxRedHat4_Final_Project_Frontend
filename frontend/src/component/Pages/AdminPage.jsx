import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { getCategories, createCategory, deleteCategory } from "../../api/communityApi";
import { useAuth } from "../../hooks/useAuth";
import PhoneFrame from "../Layout/PhoneFrame";
import MainLayout from "../Layout/MainLayout";
import Header from "../Layout/Header";

const AdminPageContent = () => {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const [filter, setFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [expandedUserId, setExpandedUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError("");
      try {
        const res = await adminApi.getUsers();
        const list = res.data?.users || res.data || [];
        const toRoleLabel = (u) => {
          const roles = u.roles || u.user_roles || [];
          if (Array.isArray(roles) && roles.some((r) => r?.role_name === "ADMIN" || r === "ADMIN")) {
            return "admin";
          }
          const roleText = u.role ?? u.user_role;
          if (typeof roleText === "string" && roleText.toLowerCase().includes("admin")) {
            return "admin";
          }
          return "user";
        };
        const normalized = list.map((u, idx) => ({
          id: u.id ?? u.userId ?? u.user_id ?? idx,
          name: u.name ?? u.username ?? u.email ?? "이름없음",
          email: u.email ?? "",
          status: u.status ?? u.user_status ?? "active",
          role: toRoleLabel(u),
          raw: u,
        }));
        setUsers(normalized);
      } catch (error) {
        console.error("유저 조회 실패", error);
        setUsersError("유저 목록을 불러오지 못했습니다.");
      } finally {
        setUsersLoading(false);
      }
    };

    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoryError("");
      try {
        const res = await getCategories();
        const list = res.data?.categories || res.data || [];
        const normalized = list.map((c, idx) => ({
          id: c.id ?? c.category_id ?? idx,
          name: c.name ?? c.category_name ?? "",
          description: c.description ?? "",
        }));
        setCategories(normalized);
      } catch (error) {
        console.error("카테고리 조회 실패", error);
        setCategoryError("카테고리를 불러오지 못했습니다.");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchUsers();
    fetchCategories();
  }, []);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name?.includes(filter) ||
          (u.email && u.email.toLowerCase().includes(filter.toLowerCase())) ||
          u.role?.includes(filter)
      ),
    [filter, users]
  );

  const deleteUser = async (user) => {
    const confirmed = window.confirm(`정말 삭제하시겠습니까?\n${user.name} (${user.email})`);
    if (!confirmed) return;

    setUpdatingUserId(user.id);
    setUsersError("");
    try {
      await adminApi.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      console.error("유저 삭제 실패", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "유저를 삭제하지 못했습니다.";
      setUsersError(message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const addCategory = async () => {
    const name = newCategory.trim();
    if (!name || categories.find((c) => c.name === name)) return;
    setCategoryError("");
    try {
      await createCategory(name);
      const res = await getCategories();
      const list = res.data?.categories || res.data || [];
      const normalized = list.map((c, idx) => ({
        id: c.id ?? c.category_id ?? idx,
        name: c.name ?? c.category_name ?? "",
        description: c.description ?? "",
      }));
      setCategories(normalized);
      setNewCategory("");
    } catch (error) {
      console.error("카테고리 추가 실패", error);
      setCategoryError("카테고리를 추가하지 못했습니다.");
    }
  };

  const removeCategory = async (categoryId) => {
    setCategoryError("");
    try {
      await deleteCategory(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (error) {
      console.error("카테고리 삭제 실패", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "카테고리를 삭제하지 못했습니다.";
      setCategoryError(message);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      <div className="rounded-2xl bg-gradient-to-br from-[#eef4ff] via-white to-[#f0fbff] border border-white/70 shadow-sm p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-[0.08em]">Admin</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">관리 콘솔</h1>
            <p className="text-sm text-gray-500 mt-1">유저 관리와 커뮤니티 카테고리를 설정하세요.</p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100">
            Internal
          </div>
        </div>
      </div>

      <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">유저 관리</h2>
            <p className="text-sm text-gray-500">이메일·이름으로 검색하고 상태를 변경할 수 있습니다.</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[13px] text-gray-500">총 사용자</span>
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {usersLoading ? "..." : `${filteredUsers.length}명`}
            </span>
          </div>
        </header>

        <div className="flex items-center gap-3">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="이름, 이메일, 역할로 검색"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-200 focus:border-sky-400 outline-none"
          />
        </div>

        <div className="space-y-3">
          {usersError && <div className="text-sm text-rose-600">{usersError}</div>}
          {usersLoading && (
            <div className="text-sm text-gray-500 py-4">유저 목록을 불러오는 중...</div>
          )}
          {!usersLoading && filteredUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-gray-100 bg-slate-50/40 px-4 py-3 flex flex-col gap-3 cursor-pointer"
              onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
            >
              <div className="flex items-center justify-between gap-3 w-full">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {user.role}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteUser(user);
                    }}
                    disabled={updatingUserId === user.id}
                    className="text-xs font-semibold px-3 py-2 rounded-lg bg-white border border-rose-200 text-rose-600 hover:border-rose-300 hover:text-rose-700 transition disabled:opacity-60"
                  >
                    {updatingUserId === user.id ? "삭제중..." : "삭제"}
                  </button>
                </div>
              </div>
              {expandedUserId === user.id && (
                <div className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs text-gray-700 space-y-1">
                  {[
                    ["이름", user.name],
                    ["이메일", user.email],
                    ["닉네임", user.raw?.nickname],
                    ["전화번호", user.raw?.phone_number],
                    ["가입일", user.raw?.created_at],
                  ].filter(([, v]) => v !== undefined && v !== null && v !== "").map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-800 break-all">{String(value)}</span>
                    </div>
                  ))}
                  {!user.raw && <div className="text-gray-500">추가 정보가 없습니다.</div>}
                </div>
              )}
            </div>
          ))}
          {!usersLoading && filteredUsers.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-6">검색 결과가 없습니다.</div>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">커뮤니티 카테고리</h2>
            <p className="text-sm text-gray-500">새 카테고리를 추가하거나 삭제할 수 있습니다.</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {categories.length}개
          </span>
        </header>

        <div className="flex items-center gap-3">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="예: 취업 준비, 스터디 모집"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
          />
          <button
            onClick={addCategory}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-sm hover:from-sky-600 hover:to-indigo-600 transition disabled:opacity-50"
            disabled={!newCategory.trim() || categories.find((c) => c.name === newCategory.trim())}
          >
            추가
          </button>
        </div>

        {categoryError && <div className="text-sm text-rose-600">{categoryError}</div>}
        {categoriesLoading && (
          <div className="text-sm text-gray-500 py-2">카테고리를 불러오는 중...</div>
        )}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 border border-slate-100 text-sm text-gray-700"
            >
              <span>{cat.name}</span>
              <button
                onClick={() => removeCategory(cat.id)}
                className="text-xs text-rose-500 hover:text-rose-600"
                aria-label={`${cat.name} 삭제`}
              >
                ✕
              </button>
            </div>
          ))}
          {!categoriesLoading && categories.length === 0 && (
            <div className="text-sm text-gray-500">카테고리가 없습니다.</div>
          )}
        </div>
      </section>
    </div>
  );
};

const AdminPage = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    const roles = user?.roles || [];
    const isAdmin = roles.some((role) => role?.role_name === "ADMIN" || role === "ADMIN");
    if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  const roles = user?.roles || [];
  const isAdmin = roles.some((role) => role?.role_name === "ADMIN" || role === "ADMIN");

  if (loading || !isAdmin) {
    return (
      <PhoneFrame title="Admin" contentClass="px-4 pt-4 pb-10 bg-slate-50">
        <MainLayout fullWidth showHeader={false}>
          <div className="text-center text-sm text-gray-500 py-10">접근 권한을 확인하는 중...</div>
        </MainLayout>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame
      title="Admin"
      contentClass="px-0 pt-3 pb-10 bg-slate-50"
      headerContent={<Header fullWidth dense />}
    >
      <MainLayout fullWidth showHeader={false}>
        <AdminPageContent />
      </MainLayout>
    </PhoneFrame>
  );
};

export default AdminPage;
