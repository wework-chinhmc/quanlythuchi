"use client"

import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';

const AdminPage = () => {
    const { user, listUsers, setUserRole, deleteUser, setPassword } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function load() {
      setLoading(true);
      try {
        const list = await listUsers();
        setUsers(list);
      } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    async function toggleRole(u: any) {
      const newRole = u.role === 'admin' ? 'user' : 'admin';
      await setUserRole(u.email, newRole);
      await load();
    }

    async function handleResetPassword(u: any) {
      if (!confirm(`Reset mật khẩu của ${u.email} về 'Admin@123'?`)) return;
      await setPassword(u.email, 'Admin@123');
      alert('Mật khẩu đã được đặt lại');
    }

    async function handleDelete(u: any) {
      if (!confirm(`Xác nhận xóa tài khoản ${u.email}?`)) return;
      await deleteUser(u.email);
      await load();
    }

    return (
        <main style={{maxWidth:1200, margin:'24px auto', padding:'0 20px'}}>
          <h1 className="text-2xl font-semibold mb-4">Admin</h1>

          <section className="bg-white border rounded p-4">
            <h2 className="font-medium mb-2">Quản lý người dùng</h2>
            {loading ? <div>Đang tải...</div> : (
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2">Tên</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="p-2">{u.name ?? '-'}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.role ?? 'user'}</td>
                      <td className="p-2">
                        <button className="mr-2 px-2 py-1 bg-slate-800 text-white rounded" onClick={() => toggleRole(u)}>{u.role === 'admin' ? 'Make user' : 'Make admin'}</button>
                        <button className="mr-2 px-2 py-1 bg-yellow-500 text-white rounded" onClick={() => handleResetPassword(u)}>Reset mật khẩu</button>
                        <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDelete(u)} disabled={user?.email?.toLowerCase() === u.email.toLowerCase()}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </main>
    )
}

export default AdminPage;