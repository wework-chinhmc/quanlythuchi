"use client"

import { useEffect, useState } from "react";
import { getAccounts, addAccount, transferBetweenAccounts, type Account } from "../../../lib/mockService";

export default function AccountsPage() {
  const [items, setItems] = useState<Account[]>([]);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState(0);
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    getAccounts().then((a) => {
      setItems(a);
      if (a.length >= 2) {
        setFrom(a[0].id);
        setTo(a[1].id);
      }
    });
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    const created = await addAccount({ name, balance });
    setItems((s) => [created, ...s]);
    setName("");
    setBalance(0);
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!from || !to || from === to || amount <= 0) return;
    const ok = await transferBetweenAccounts(from, to, amount);
    if (ok) {
      const refreshed = await getAccounts();
      setItems(refreshed);
    }
    setAmount(0);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Quản lý Tài khoản</h2>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input className="border rounded px-3 py-2 flex-1" placeholder="Tên tài khoản" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" className="border rounded px-3 py-2" placeholder="Số dư" value={balance || ""} onChange={(e) => setBalance(Number(e.target.value))} />
        <button className="bg-slate-800 text-white px-4 py-2 rounded">Thêm</button>
      </form>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {items.map((a) => (
          <div key={a.id} className="border rounded p-3">
            <div className="font-semibold">{a.name}</div>
            <div className="text-sm text-gray-600">{a.balance.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleTransfer} className="flex gap-2 items-center">
        <select className="border rounded px-3 py-2" value={from ?? ""} onChange={(e) => setFrom(e.target.value)}>
          <option value="">From</option>
          {items.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select className="border rounded px-3 py-2" value={to ?? ""} onChange={(e) => setTo(e.target.value)}>
          <option value="">To</option>
          {items.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input type="number" className="border rounded px-3 py-2" placeholder="Số tiền" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} />
        <button className="bg-amber-500 px-4 py-2 rounded text-white">Chuyển</button>
      </form>
    </div>
  );
}
