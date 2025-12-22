"use client";

import React from "react";

export default function Footer() {
  const scrollTop = () => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#07263a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          <div>
            <img
              src="https://www.ndahome.com/_next/image?url=%2Flogo.png&w=384&q=75"
              alt="NDA Home"
              className="h-20 w-auto"
            />
            <p className="mt-4 text-gray-200 max-w-xs">
              Cầu nối uy tín giữa người cho thuê và người cần thuê.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-gray-200">
              <li><a href="#" className="hover:underline">Trang chủ</a></li>
              <li><a href="#" className="hover:underline">Về chúng tôi</a></li>
              <li><a href="#" className="hover:underline">Tin tức</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-200">
              <li><a href="#" className="hover:underline">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:underline">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:underline">Điều khoản sử dụng</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1 1 0 01-1.414 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <div>
                  <div className="text-gray-200">Số 37/33 Bình Hưng Hòa B, Bình Tân , TP HCM </div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h2l2 5-2 2-1 4h14l-1-4-2-2 2-5h2"></path></svg>
                <div className="text-gray-200">0909023919</div>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H8m0 0l4-4m-4 4l4 4"></path></svg>
                <div className="text-gray-200">contact@vinh.com</div>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-600 my-6" />

        <div className="text-center text-gray-300 py-4">
          © 2025 Thực chiến CNTT.
        </div>
      </div>

      <button
        onClick={scrollTop}
        aria-label="scroll to top"
        className="fixed right-6 bottom-6 w-12 h-12 rounded-full bg-yellow-500 text-white shadow-lg flex items-center justify-center hover:bg-yellow-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </footer>
  );
}
