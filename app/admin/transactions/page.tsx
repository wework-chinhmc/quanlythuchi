"use client"

import { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { getTransactions, addTransaction, deleteTransaction, updateTransaction, getCategories, getCustomers, addCustomer, deleteCustomer, updateCustomer, type Transaction, type Category, type Customer } from "../../../lib/mockService";

export default function TransactionsPage() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<"thu" | "chi">("thu");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [actorName, setActorName] = useState("");
  const [activeTab, setActiveTab] = useState<"transactions" | "customers" | "received">("customers");

  // customers
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custDateType, setCustDateType] = useState<"deposit" | "contract">("deposit");
  const [custDate, setCustDate] = useState("");
  const [custDepositAmount, setCustDepositAmount] = useState("");
  const [custContractAmount, setCustContractAmount] = useState("");
  const [custCommission, setCustCommission] = useState("");
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editTransactionData, setEditTransactionData] = useState<Partial<Transaction>>({});

  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editCustomerData, setEditCustomerData] = useState<Partial<Customer>>({});

  useEffect(() => {
    getTransactions().then(setItems);
    getCategories().then((c) => {
      setCategories(c);
      if (c.length) setCategoryId(c[0].id);
    });
    getCustomers().then(setCustomers);
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    const created = await addTransaction({
      date: new Date().toISOString(),
      amount,
      type,
      categoryId,
      description: "-",
      accountId: undefined,
      performedBy: user?.name ?? "-",
      actorName: actorName || "-",
    });
    setItems((s) => [created, ...s]);
    setAmount(0);
    setActorName("");
  }

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!custName) return;
    const created = await addCustomer({
      name: custName,
      phone: custPhone || undefined,
      depositDate: custDateType === "deposit" && custDate ? new Date(custDate).toISOString() : undefined,
      depositAmount: custDateType === "deposit" && custDepositAmount ? Number(custDepositAmount) : undefined,
      contractDate: custDateType === "contract" && custDate ? new Date(custDate).toISOString() : undefined,
      contractAmount: custDateType === "contract" && custContractAmount ? Number(custContractAmount) : undefined,
      // clamp commission to 0-100
      commission: custDateType === "contract" && custCommission ? Math.max(0, Math.min(100, Number(custCommission))) : undefined,
      createdAt: new Date().toISOString(),
      performedBy: user?.name ?? "-",
    });
    setCustomers((s) => [created, ...s]);
    setCustName("");
    setCustPhone("");
    setCustDate("");
    setCustDateType("deposit");
    setCustDepositAmount("");
    setCustContractAmount("");
    setCustCommission("");
  }

  async function handleDeleteCustomer(id: string) {
    try {
      await deleteCustomer(id);
      setCustomers((s) => s.filter((c) => String(c.id) !== String(id)));
    } catch (err) {
      console.error('Failed to delete customer', err);
      alert('Xóa khách hàng thất bại: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function toggleCustomerReceived(id: string, val: boolean) {
    const updated = await updateCustomer(id, { received: val });
    if (updated) setCustomers((s) => s.map((c) => String(c.id) === String(updated.id) ? updated : c));
  }

  function startEditTransaction(t: Transaction) {
    setEditingTransactionId(String(t.id));
    setEditTransactionData({ amount: t.amount, type: t.type, categoryId: t.categoryId, actorName: t.actorName, description: t.description, received: t.received });
  }

  function cancelEditTransaction() {
    setEditingTransactionId(null);
    setEditTransactionData({});
  }

  async function saveEditTransaction() {
    if (!editingTransactionId) return;
    const payload: Partial<Transaction> = { ...editTransactionData };
    if (payload.amount === undefined || payload.amount === null || payload.amount === '') delete payload.amount;
    if (payload.actorName === '') delete payload.actorName;
    if (payload.categoryId === '') delete payload.categoryId;
    const updated = await updateTransaction(editingTransactionId, payload);
    if (updated) {
      setItems((s) => s.map((it) => String(it.id) === String(updated.id) ? updated : it));
    }
    setEditingTransactionId(null);
    setEditTransactionData({});
  }

  async function toggleTransactionReceived(id: string, val: boolean) {
    const updated = await updateTransaction(id, { received: val });
    if (updated) setItems((s) => s.map((t) => String(t.id) === String(updated.id) ? updated : t));
  }

  function startEditCustomer(c: Customer) {
    setEditingCustomerId(String(c.id));
    setEditCustomerData({ name: c.name, phone: c.phone, depositDate: c.depositDate, contractDate: c.contractDate, note: c.note, received: c.received });
  }

  function cancelEditCustomer() {
    setEditingCustomerId(null);
    setEditCustomerData({});
  }

  async function saveEditCustomer() {
    if (!editingCustomerId) return;
    // normalize dates (if empty string => undefined)
    const payload: Partial<Customer> = { ...editCustomerData };
    if (payload.depositDate === '') delete payload.depositDate;
    if (payload.contractDate === '') delete payload.contractDate;
    if ((payload.depositAmount === undefined) || payload.depositAmount === null) delete payload.depositAmount;
    if ((payload.contractAmount === undefined) || payload.contractAmount === null) delete payload.contractAmount;
    if ((payload.commission === undefined) || payload.commission === null) delete payload.commission;
    // clamp commission to 0-100 if present
    if (payload.commission != null) payload.commission = Math.max(0, Math.min(100, payload.commission));
    const updated = await updateCustomer(editingCustomerId, payload);
    if (updated) {
      setCustomers((s) => s.map((it) => String(it.id) === String(updated.id) ? updated : it));
    }
    setEditingCustomerId(null);
    setEditCustomerData({});
  }

  async function handleExportExcel() {
    if (!customers || customers.length === 0) {
      alert('Không có khách hàng để xuất');
      return;
    }
    const rows = customers.map((c) => ({
      ID: c.id,
      Tên: c.name,
      SĐT: c.phone ?? '',
      Ngày_Cọc: c.depositDate ? new Date(c.depositDate).toLocaleDateString() : '',
      Tiền_Cọc: c.depositAmount != null ? `${c.depositAmount.toLocaleString('vi-VN')} ₫` : '',
      Ngày_Ký_Hợp_Đồng: c.contractDate ? new Date(c.contractDate).toLocaleDateString() : '',
      Tiền_Hợp_Đồng: c.contractAmount != null ? `${c.contractAmount.toLocaleString('vi-VN')} ₫` : '',
      Hoa_hồng: c.commission != null ? `${c.commission}%` : '',
      Ngày_Giờ_Tạo: c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
      Người_Thực_Hiện: c.performedBy ?? '',
    }));

    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleDelete(id: string) {
    if (!user || user.role !== 'admin') {
      alert('Chỉ admin mới có quyền xóa');
      return;
    }
    try {
      await deleteTransaction(id);
      setItems((s) => s.filter((t) => String(t.id) !== String(id)));
    } catch (err) {
      console.error('Failed to delete transaction', err);
      alert('Xóa giao dịch thất bại: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Giao dịch Thu/Chi</h2>

      <div className="mb-4 flex gap-2 items-center">
        <button type="button" onClick={() => setActiveTab("transactions")} className={`px-3 py-1 rounded-t ${activeTab === "transactions" ? "bg-white border-t border-l border-r" : "bg-gray-100"}`}>Giao dịch</button>
        <button type="button" onClick={() => setActiveTab("customers")} className={`px-3 py-1 rounded-t ${activeTab === "customers" ? "bg-white border-t border-l border-r" : "bg-gray-100"}`}>Khách hàng</button>
        <button type="button" onClick={() => setActiveTab("received")} className={`px-3 py-1 rounded-t ${activeTab === "received" ? "bg-white border-t border-l border-r" : "bg-gray-100"}`}>Đã thu</button>
      </div>

      { activeTab === "transactions" && (
        <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-4 items-center">
          <input type="number" className="border rounded px-3 py-2" placeholder="Số tiền" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} />
          <select className="border rounded px-3 py-2" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="thu">Thu</option>
            <option value="chi">Chi</option>
          </select>
          <select className="border rounded px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="text" className="border rounded px-3 py-2" placeholder="Người thu/chi" value={actorName} onChange={(e) => setActorName(e.target.value)} />
          <button className="bg-slate-800 text-white px-4 py-2 rounded">Thêm</button>
        </form>
      )}

      { activeTab === "received" && (
        <div className="bg-white border rounded p-4">
          <h3 className="font-semibold mb-3">Đã thu</h3>

          <div className="mb-4">
            <h4 className="font-medium mb-2">Giao dịch đã thu</h4>
            <div className="overflow-x-auto bg-white border rounded">
              <table className="w-full table-fixed">
                <colgroup>
                  <col style={{ width: 180 }} />
                  <col style={{ width: 160 }} />
                  <col style={{ width: 160 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 160 }} />
                  <col style={{ width: 180 }} />
                  <col style={{ width: 100 }} />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Ngày giờ</th>
                    <th className="text-left p-3">Người thực hiện</th>
                    <th className="text-left p-3">Người thu/chi</th>
                    <th className="text-left p-3">Số tiền</th>
                    <th className="text-left p-3">Loại</th>
                    <th className="text-left p-3">Danh mục</th>
                    <th className="p-3">Hành động</th>
                    <th className="p-3">Đã thu</th>
                  </tr>
                </thead>
                <tbody>
                  {items.filter((it) => it.received).map((it, i) => (
                    <tr key={String(it.id ?? `it-received-${i}`)} className="border-t">
                      <td className="p-3">{it.date ? new Date(it.date).toLocaleString() : "-"}</td>
                      <td className="p-3">{it.performedBy ?? user?.name ?? "-"}</td>
                      <td className="p-3">{it.actorName ?? "-"}</td>
                      <td className="p-3">{it.amount != null ? it.amount.toLocaleString() : "-"}</td>
                      <td className="p-3">{(it.type === 'INCOME' || it.type === 'thu') ? 'Thu' : (it.type === 'EXPENSE' || it.type === 'chi') ? 'Chi' : it.type}</td>
                      <td className="p-3">{categories.find((c) => String(c.id) === String(it.categoryId))?.name ?? "-"}</td>
                      <td className="p-3 text-center">
                        <button className="text-blue-600 mr-2" onClick={() => startEditTransaction(it)}>Sửa</button>
                        {user?.role === 'admin' ? <button className="text-red-600" onClick={() => handleDelete(it.id)}>Xóa</button> : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <input type="checkbox" checked={Boolean(it.received)} onChange={(e) => toggleTransactionReceived(it.id, e.target.checked)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Khách hàng đã thu</h4>
            <div className="overflow-x-auto bg-white border rounded">
              <table className="w-full table-fixed">
                <colgroup>
                  <col style={{ width: 220 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 160 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 100 }} />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 truncate">Tên</th>
                    <th className="text-left p-3 truncate">SĐT</th>
                    <th className="text-left p-3 truncate">Ngày</th>
                    <th className="text-left p-3 truncate">Tiền cọc</th>
                    <th className="text-left p-3 truncate">Tiền hợp đồng</th>
                    <th className="text-left p-3 truncate">Hoa hồng</th>
                    <th className="text-left p-3 truncate">Ngày giờ</th>
                    <th className="text-left p-3 truncate">Thực hiện</th>
                    <th className="p-3">Đã thu</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.filter((c) => c.received).map((c, i) => (
                    <tr key={String(c.id ?? `cust-received-${i}`)} className="border-t">
                      <td className="p-3">{c.name}</td>
                      <td className="p-3">{c.phone ?? "-"}</td>
                      <td className="p-3">{(c.depositDate || c.contractDate) ? (c.depositDate ? new Date(c.depositDate).toLocaleDateString() : new Date(c.contractDate).toLocaleDateString()) : "-"}</td>
                      <td className="p-3">{c.depositAmount != null ? `${c.depositAmount.toLocaleString('vi-VN')} ₫` : '-'}</td>
                      <td className="p-3">{c.contractAmount != null ? `${c.contractAmount.toLocaleString('vi-VN')} ₫` : '-'}</td>
                      <td className="p-3">{c.commission != null ? `${c.commission}%` : '-'}</td>
                      <td className="p-3">{c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}</td>
                      <td className="p-3">{c.performedBy ?? "-"}</td>
                      <td className="p-3 text-center"><input type="checkbox" checked={Boolean(c.received)} onChange={(e) => toggleCustomerReceived(c.id, e.target.checked)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      { activeTab === "customers" && (
        <div className="bg-white border rounded p-4">
          <h3 className="font-semibold mb-3">Thêm khách hàng</h3>
              <form onSubmit={handleAddCustomer} className="flex flex-wrap gap-2 mb-4">
                <input type="text" className="border rounded px-3 py-2 flex-1" placeholder="Tên khách hàng" value={custName} onChange={(e) => setCustName(e.target.value)} />
                <input type="text" className="border rounded px-3 py-2" placeholder="SĐT" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} />
                <select className="border rounded px-3 py-2" value={custDateType} onChange={(e) => setCustDateType(e.target.value as any)}>
                  <option value="deposit">Ngày Cọc</option>
                  <option value="contract">Ngày ký hợp đồng</option>
                </select>
                <input type="date" className="border rounded px-3 py-2" value={custDate} onChange={(e) => setCustDate(e.target.value)} />
                {custDateType === 'deposit' && (
                  <input type="number" min={0} step={1000} className="border rounded px-3 py-2" placeholder="Tiền cọc (VND)" value={custDepositAmount} onChange={(e) => setCustDepositAmount(e.target.value)} />
                )}
                {custDateType === 'contract' && (
                  <>
                    <input type="number" min={0} step={1000} className="border rounded px-3 py-2" placeholder="Tiền hợp đồng (VND)" value={custContractAmount} onChange={(e) => setCustContractAmount(e.target.value)} />
                    <input type="number" min={0} max={100} step={0.01} className="border rounded px-3 py-2" placeholder="Hoa hồng (%)" value={custCommission} onChange={(e) => setCustCommission(e.target.value)} />
                  </>
                )}
                <button className="bg-slate-800 text-white px-4 py-2 rounded">Thêm</button>
              </form>

              <div className="flex justify-end mb-2">
                <button type="button" onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded">Xuất Excel</button>
              </div>

              <div className="bg-white border rounded">
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col style={{ width: 220 }} />
                      <col style={{ width: 140 }} />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 160 }} />
                        <col style={{ width: 140 }} />
                        <col style={{ width: 160 }} />
                        <col style={{ width: 100 }} />
                    </colgroup>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 truncate">Tên</th>
                      <th className="text-left p-3 truncate">SĐT</th>
                      <th className="text-left p-3 truncate">Ngày</th>
                      <th className="text-left p-3 truncate">Tiền cọc</th>
                      <th className="text-left p-3 truncate">Tiền hợp đồng</th>
                      <th className="text-left p-3 truncate">Hoa hồng</th>
                      <th className="text-left p-3 truncate">Ngày giờ</th>
                      <th className="text-left p-3 truncate">Thực hiện</th>
                      <th className="p-3" style={{ width: 160 }}>Hành động</th>
                      <th className="p-3">Đã thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <tr key={String(c.id ?? `cust-${i}`)} className="border-t">
                          {String(c.id) === editingCustomerId ? (
                            <>
                              <td className="p-3"><input className="border px-2 py-1 w-48" value={String(editCustomerData.name ?? '')} onChange={(e) => setEditCustomerData((p) => ({ ...(p || {}), name: e.target.value }))} /></td>
                              <td className="p-3"><input className="border px-2 py-1 w-40" value={String(editCustomerData.phone ?? '')} onChange={(e) => setEditCustomerData((p) => ({ ...(p || {}), phone: e.target.value }))} /></td>
                              <td className="p-3"><input type="date" className="border px-2 py-1 w-40" value={editCustomerData.depositDate ? new Date(editCustomerData.depositDate).toISOString().slice(0,10) : (editCustomerData.contractDate ? new Date(editCustomerData.contractDate).toISOString().slice(0,10) : '')} onChange={(e) => setEditCustomerData((p) => ({ ...(p || {}), depositDate: e.target.value ? new Date(e.target.value).toISOString() : '' }))} /></td>
                              <td className="p-3"><input type="number" min={0} step={1000} className="border px-2 py-1 w-32" placeholder="Tiền cọc (VND)" value={editCustomerData.depositAmount ?? ''} onChange={(e) => setEditCustomerData((p) => ({ ...(p || {}), depositAmount: e.target.value === '' ? undefined : Number(e.target.value) }))} /></td>
                              <td className="p-3"><input type="number" min={0} step={1000} className="border px-2 py-1 w-32" placeholder="Tiền hợp đồng (VND)" value={editCustomerData.contractAmount ?? ''} onChange={(e) => setEditCustomerData((p) => ({ ...(p || {}), contractAmount: e.target.value === '' ? undefined : Number(e.target.value) }))} /></td>
                              <td className="p-3"><input type="number" min={0} max={100} step={0.01} className="border px-2 py-1 w-32" placeholder="Hoa hồng (%)" value={editCustomerData.commission ?? ''} onChange={(e) => setEditCustomerData((p) => ({ ...(p || {}), commission: e.target.value === '' ? undefined : Number(e.target.value) }))} /></td>
                              <td className="p-3">{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</td>
                              <td className="p-3">{c.performedBy ?? '-'}</td>
                              <td className="p-3 text-center">
                                <button className="text-green-600 mr-2" onClick={saveEditCustomer}>Lưu</button>
                                <button className="text-gray-600" onClick={cancelEditCustomer}>Hủy</button>
                              </td>
                              <td className="p-3 text-center">
                                <input type="checkbox" checked={Boolean(editCustomerData.received ?? c.received)} onChange={(e) => setEditCustomerData((p) => ({ ...(p || {}), received: e.target.checked }))} />
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-3">{c.name}</td>
                              <td className="p-3">{c.phone ?? "-"}</td>
                              <td className="p-3">{(c.depositDate ? new Date(c.depositDate) : c.contractDate ? new Date(c.contractDate) : null) ? ((c.depositDate ? new Date(c.depositDate) : new Date(c.contractDate)).toLocaleDateString()) : "-"}</td>
                              <td className="p-3">{c.depositAmount != null ? `${c.depositAmount.toLocaleString('vi-VN')} ₫` : '-'}</td>
                              <td className="p-3">{c.contractAmount != null ? `${c.contractAmount.toLocaleString('vi-VN')} ₫` : '-'}</td>
                              <td className="p-3">{c.commission != null ? `${c.commission}%` : '-'}</td>
                              <td className="p-3">{c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}</td>
                              <td className="p-3">{c.performedBy ?? "-"}</td>
                              <td className="p-3 text-center">
                                <button className="text-blue-600 mr-2" onClick={() => startEditCustomer(c)}>Sửa</button>
                                {user?.role !== 'user' ? <button className="text-red-600" onClick={() => handleDeleteCustomer(c.id)}>Xóa</button> : null}
                              </td>
                              <td className="p-3 text-center">
                                <input type="checkbox" checked={Boolean(c.received)} onChange={(e) => toggleCustomerReceived(c.id, e.target.checked)} />
                              </td>
                            </>
                          )}
                        </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              </div>
        </div>
      )}

      

      { activeTab === "transactions" && (
        <div className="bg-white border rounded">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
                  <colgroup>
                    <col style={{ width: 180 }} />
                    <col style={{ width: 160 }} />
                    <col style={{ width: 160 }} />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 100 }} />
                    <col style={{ width: 160 }} />
                    <col style={{ width: 180 }} />
                    <col style={{ width: 100 }} />
                  </colgroup>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3">Ngày giờ</th>
                      <th className="text-left p-3">Người thực hiện</th>
                      <th className="text-left p-3">Người thu/chi</th>
                      <th className="text-left p-3">Số tiền</th>
                      <th className="text-left p-3">Loại</th>
                      <th className="text-left p-3">Danh mục</th>
                      <th className="p-3">Hành động</th>
                      <th className="p-3">Đã thu</th>
                    </tr>
                  </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={String(it.id ?? `it-${i}`)} className="border-t">
                  {String(it.id) === editingTransactionId ? (
                    <>
                      <td className="p-3">{it.date ? new Date(it.date).toLocaleString() : "-"}</td>
                      <td className="p-3">{it.performedBy ?? user?.name ?? "-"}</td>
                      <td className="p-3"><input className="border px-2 py-1 w-40" value={String(editTransactionData.actorName ?? '')} onChange={(e) => setEditTransactionData((p) => ({ ...(p || {}), actorName: e.target.value }))} /></td>
                      <td className="p-3"><input type="number" className="border px-2 py-1 w-32" value={editTransactionData.amount ?? ''} onChange={(e) => setEditTransactionData((p) => ({ ...(p || {}), amount: e.target.value === '' ? undefined : Number(e.target.value) }))} /></td>
                      <td className="p-3">
                        <select className="border px-2 py-1 w-32" value={String(editTransactionData.type ?? it.type)} onChange={(e) => setEditTransactionData((p) => ({ ...(p || {}), type: e.target.value as any }))}>
                          <option value="thu">Thu</option>
                          <option value="chi">Chi</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <select className="border px-2 py-1 w-44" value={String(editTransactionData.categoryId ?? it.categoryId ?? '')} onChange={(e) => setEditTransactionData((p) => ({ ...(p || {}), categoryId: e.target.value }))}>
                          <option value="">-</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <button className="text-green-600 mr-2" onClick={saveEditTransaction}>Lưu</button>
                        <button className="text-gray-600" onClick={cancelEditTransaction}>Hủy</button>
                      </td>
                      <td className="p-3 text-center">
                        <input type="checkbox" checked={Boolean(editTransactionData.received ?? it.received)} onChange={(e) => setEditTransactionData((p) => ({ ...(p || {}), received: e.target.checked }))} />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3">{it.date ? new Date(it.date).toLocaleString() : "-"}</td>
                      <td className="p-3">{it.performedBy ?? user?.name ?? "-"}</td>
                      <td className="p-3">{it.actorName ?? "-"}</td>
                      <td className="p-3">{it.amount != null ? it.amount.toLocaleString() : "-"}</td>
                      <td className="p-3">{(it.type === 'INCOME' || it.type === 'thu') ? 'Thu' : (it.type === 'EXPENSE' || it.type === 'chi') ? 'Chi' : it.type}</td>
                      <td className="p-3">{categories.find((c) => String(c.id) === String(it.categoryId))?.name ?? "-"}</td>
                      <td className="p-3 text-center">
                        <button className="text-blue-600 mr-2" onClick={() => startEditTransaction(it)}>Sửa</button>
                        {user?.role === 'admin' ? <button className="text-red-600" onClick={() => handleDelete(it.id)}>Xóa</button> : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <input type="checkbox" checked={Boolean(it.received)} onChange={(e) => toggleTransactionReceived(it.id, e.target.checked)} />
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
