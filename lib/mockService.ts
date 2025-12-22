type Category = {
  id: string;
  name: string;
  type: "thu" | "chi";
  description?: string;
};

let categories: Category[] = [];

export function getCategories(): Promise<Category[]> {
  // fetch from API if available
  if (typeof window !== 'undefined') {
    return fetch('/api/categories').then((r) => r.json())
  }
  return Promise.resolve([...categories]);
}

export function addCategory(payload: Omit<Category, "id">): Promise<Category> {
  if (typeof window !== 'undefined') {
    return fetch('/api/categories', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).then((r) => r.json())
  }
  const newCat: Category = { id: `c${Date.now()}`, ...payload };
  categories = [newCat, ...categories];
  return Promise.resolve(newCat);
}

export function updateCategory(id: string, payload: Partial<Category>): Promise<Category | null> {
  // client-side update via API not implemented on server; fall back to in-memory
  if (typeof window !== 'undefined') {
    // no PUT endpoint for categories yet; emulate optimistic update by returning payload
    return fetch('/api/categories', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, ...payload }) }).then((r) => r.json())
  }
  let updated: Category | null = null;
  categories = categories.map((c) => {
    if (c.id === id) {
      updated = { ...c, ...payload };
      return updated;
    }
    return c;
  });
  return Promise.resolve(updated);
}

export function deleteCategory(id: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    return fetch('/api/categories', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) }).then((r) => r.json()).then((r) => Boolean(r.ok))
  }
  const before = categories.length;
  categories = categories.filter((c) => c.id !== id);
  return Promise.resolve(categories.length < before);
}

export type { Category };

// Transactions and Accounts (in-memory)
type Transaction = {
  id: string;
  date: string; // ISO
  amount: number;
  type: "thu" | "chi";
  categoryId?: string;
  description?: string;
  accountId?: string;
  performedBy?: string; // user who entered the transaction
  actorName?: string; // person who received/paid (entered by user)
  received?: boolean; // đã thu
};

let transactions: Transaction[] = [];

export function getTransactions(): Promise<Transaction[]> {
  if (typeof window !== 'undefined') {
    return fetch('/api/transactions').then((r) => r.json())
  }
  return Promise.resolve([...transactions]);
}

export function addTransaction(payload: Omit<Transaction, "id">): Promise<Transaction> {
  if (typeof window !== 'undefined') {
    return fetch('/api/transactions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok) {
          console.error('addTransaction failed', json);
          throw new Error(json?.error || JSON.stringify(json) || `HTTP ${r.status}`);
        }
        return json;
      })
  }
  const t: Transaction = { id: `t${Date.now()}`, ...payload };
  transactions = [t, ...transactions];
  return Promise.resolve(t);
}

export function updateTransaction(id: string, payload: Partial<Transaction>): Promise<Transaction | null> {
  if (typeof window !== 'undefined') {
    return fetch('/api/transactions', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, ...payload }) })
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok) {
          console.error('updateTransaction failed', json);
          throw new Error(json?.error || JSON.stringify(json) || `HTTP ${r.status}`);
        }
        return json;
      })
  }
  let updated: Transaction | null = null;
  transactions = transactions.map((t) => {
    if (t.id === id) {
      updated = { ...t, ...payload };
      return updated;
    }
    return t;
  });
  return Promise.resolve(updated);
}

export function deleteTransaction(id: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    return fetch('/api/transactions', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) })
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok) {
          console.error('deleteTransaction failed', json);
          throw new Error(json?.error || JSON.stringify(json) || `HTTP ${r.status}`);
        }
        return Boolean(json.ok ?? true);
      })
  }
  const before = transactions.length;
  transactions = transactions.filter((t) => t.id !== id);
  return Promise.resolve(transactions.length < before);
}

type Account = {
  id: string;
  name: string;
  balance: number;
};

let accounts: Account[] = [];

export function getAccounts(): Promise<Account[]> {
  return Promise.resolve([...accounts]);
}

export function addAccount(payload: Omit<Account, "id">): Promise<Account> {
  const a: Account = { id: `a${Date.now()}`, ...payload };
  accounts = [a, ...accounts];
  return Promise.resolve(a);
}

export function updateAccount(id: string, payload: Partial<Account>): Promise<Account | null> {
  let updated: Account | null = null;
  accounts = accounts.map((a) => {
    if (a.id === id) {
      updated = { ...a, ...payload };
      return updated;
    }
    return a;
  });
  return Promise.resolve(updated);
}

export function transferBetweenAccounts(fromId: string, toId: string, amount: number): Promise<boolean> {
  const from = accounts.find((a) => a.id === fromId);
  const to = accounts.find((a) => a.id === toId);
  if (!from || !to || from.balance < amount) return Promise.resolve(false);
  from.balance -= amount;
  to.balance += amount;
  return Promise.resolve(true);
}

export type { Transaction, Account };

// Customers (in-memory)
type Customer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  depositDate?: string; // ngày cọc (ISO)
  contractDate?: string; // ngày ký hợp đồng (ISO)
  depositAmount?: number; // tiền cọc
  contractAmount?: number; // tiền hợp đồng
  commission?: number; // hoa hồng
  received?: boolean; // đã thu
  note?: string;
  createdAt?: string;
  performedBy?: string;
};

let customers: Customer[] = [];

export function getCustomers(): Promise<Customer[]> {
  if (typeof window !== 'undefined') {
    return fetch('/api/customers').then((r) => r.json())
  }
  return Promise.resolve([...customers]);
}

export function addCustomer(payload: Omit<Customer, "id">): Promise<Customer> {
  if (typeof window !== 'undefined') {
    return fetch('/api/customers', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).then((r) => r.json())
  }
  const c: Customer = { id: `u${Date.now()}`, ...payload };
  customers = [c, ...customers];
  return Promise.resolve(c);
}

export function updateCustomer(id: string, payload: Partial<Customer>): Promise<Customer | null> {
  if (typeof window !== 'undefined') {
    return fetch('/api/customers', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, ...payload }) }).then((r) => r.json())
  }
  let updated: Customer | null = null;
  customers = customers.map((c) => {
    if (c.id === id) {
      updated = { ...c, ...payload };
      return updated;
    }
    return c;
  });
  return Promise.resolve(updated);
}

export function deleteCustomer(id: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    return fetch('/api/customers', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) }).then((r) => r.json()).then((r) => Boolean(r.ok))
  }
  const before = customers.length;
  customers = customers.filter((c) => c.id !== id);
  return Promise.resolve(customers.length < before);
}

export type { Customer };
