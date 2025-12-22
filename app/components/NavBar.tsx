"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

// HEADER_BG: chỉnh giá trị này thành đường dẫn ảnh hoặc URL của bạn.
// Khuyến nghị: lưu ảnh vào `public/header-bg.jpg` và đặt HEADER_BG = '/header-bg.jpg'
// URL ảnh bạn cung cấp:
// https://img2.thuthuat123.com/uploads/2020/04/07/anh-bau-troi-may-dep-nhat_094801736.jpg
// Hiện đang dùng URL bên ngoài dưới đây. Nếu muốn dùng file local, hãy tải ảnh vào `public/` và đổi HEADER_BG tương ứng.
const HEADER_BG = 'https://img2.thuthuat123.com/uploads/2020/04/07/anh-bau-troi-may-dep-nhat_094801736.jpg'

export default function NavBar(): JSX.Element {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const { user, logout } = useAuth()

  // Nút Đăng Nhập/Đăng Ký dùng gradient hộ phách -> tối dần (không có UI thay đổi cho người dùng)

  const navItems = [
    { label: 'Trang Chủ', href: '/' },
    { label: 'Danh mục', href: '/admin/categories' },
    { label: 'Giao dịch', href: '/admin/transactions' },
    { label: 'Tài khoản', href: '/admin/accounts' },
    { label: 'Báo cáo', href: '/admin/reports' },
  ]

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  function handleLogout() {
    logout()
    router.push('/')
  }

  return (
    <header className="relative h-36 md:h-28 lg:h-40">
        {/* Phần nền trang trí phía sau header (toàn bộ khối)
          ĐIỂM THAY ẢNH: chỉnh `HEADER_BG` ở đầu file này
        */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <img src={HEADER_BG} alt="bg" className="w-full h-full object-cover" />
      </div>

      {/* Lớp phủ (overlay) mờ nhẹ để chữ dễ đọc trên nền ảnh */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-transparent to-black/8" />

      <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between px-4 h-full">
        {/* Bên trái: Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img className="w-8 h-8 object-contain rounded-sm bg-white/80 p-0.5" src="https://www.ndahome.com/_next/image?url=%2Flogo.png&w=384&q=75" alt="Logo" />
            <div className="text-sm font-semibold text-white">Quản lý thu chi</div>
          </Link>
        </div>      

        {/* Ở giữa: menu điều hướng (chỉ hiện khi đã đăng nhập) */}
        {user ? (
          <nav className="flex-1">
            <ul className="flex justify-center gap-6 list-none m-0 p-0">
              {navItems.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={`inline-block px-4 py-2 rounded-md font-semibold ${isActive(it.href) ? 'bg-white/30 text-white' : 'text-white hover:bg-white/10'}`}
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <div className="flex-1" />
        )}

        {/* Phía phải: nút/ hành động */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="text-sm font-medium text-white text-right hover:underline">
                <div>Xin chào, {user.name}</div>
                <div className="text-xs text-white/70">{(user.role ?? 'user').toString()}</div>
              </Link>
              <button onClick={handleLogout} className="px-3 py-1 rounded-md bg-red-600/90 text-white text-sm">Đăng xuất</button>
            </div>
          ) : (
            <div className="flex items-center">
              <Link href="/login" className="px-4 py-2 rounded-md font-bold text-white bg-gradient-to-r from-amber-400 to-amber-800 shadow">Đăng Nhập</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
