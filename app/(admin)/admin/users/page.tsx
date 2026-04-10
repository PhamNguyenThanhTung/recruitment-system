'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) setUsers(await res.json());
    setIsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // HÀM XÓA (Giữ nguyên)
  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`CẢNH BÁO: Bạn có chắc muốn XÓA VĨNH VIỄN người dùng "${name}"?`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success("Đã xóa người dùng thành công!");
      fetchUsers();
    } else {
      toast.error("Có lỗi xảy ra khi xóa!");
    }
  };

  // 🔥 HÀM MỚI: CẢNH BÁO NGƯỜI DÙNG
  const handleWarnUser = async (id: string, role: string, currentCount: number) => {
    // Đưa ra gợi ý lý do tùy theo Role
    const defaultReason = role === 'HR' 
      ? "Đăng tin tuyển dụng giả mạo, lừa đảo ứng viên." 
      : "Spam rải CV, điền thông tin hồ sơ thiếu nghiêm túc.";
      
    const reason = window.prompt(`Nhập lý do cảnh báo (Người này đã bị cảnh báo ${currentCount || 0} lần):`, defaultReason);
    
    if (!reason) return; // Nếu sếp bấm Cancel thì thôi

    const res = await fetch(`/api/admin/users/${id}/warn`, { 
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });

    if (res.ok) {
      toast.success("Đã gửi cảnh cáo thành công!");
      fetchUsers();
    } else {
      toast.error("Lỗi hệ thống!");
    }
  };

  if (isLoading) return <div className="animate-pulse p-8">Đang tải danh sách...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-800">Quản lý người dùng ({users.length})</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user: any) => (
          <div key={user.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 group">
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-full bg-slate-100 flex items-center justify-center font-black text-xl text-slate-400 relative">
                {(user.name || "U").charAt(0).toUpperCase()}
                
                {/* Hiện badge đếm số lần cảnh báo nếu > 0 */}
                {user.warningCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {user.warningCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate">{user.name || "Chưa cập nhật tên"}</h3>
                <p className="text-xs text-slate-500 truncate mb-2">{user.email}</p>
                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  user.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 
                  user.role === 'HR' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>

            {/* Hiển thị lý do cảnh báo gần nhất */}
            {user.warningCount > 0 && (
              <div className="text-xs bg-amber-50 p-2 rounded-lg border border-amber-100 text-amber-700 italic">
                <span className="font-bold">Lý do phạt:</span> {user.warningReason}
              </div>
            )}

            {/* Hàng nút thao tác (Nằm phía dưới) */}
            {user.role !== 'ADMIN' && (
              <div className="flex gap-2 mt-2 pt-4 border-t border-slate-100 opacity-50 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleWarnUser(user.id, user.role, user.warningCount)}
                  className="flex-1 bg-amber-100 hover:bg-amber-500 hover:text-white text-amber-700 font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">warning</span> Cảnh cáo
                </button>
                <button 
                  onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                  className="flex-1 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span> Xóa
                </button>
              </div>
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
}