import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AccountId = "cso_sarah" | "ceo_vic";

export type Account = {
  id: AccountId;
  name: string;
  title: string;
  initials: string;
};

export const ACCOUNTS: Account[] = [
  { id: "cso_sarah", name: "Sarah Chen", title: "Chief Strategy Officer", initials: "SC" },
  { id: "ceo_vic", name: "Vic Chynoweth", title: "Chief Executive Officer", initials: "VC" },
];

type AccountContextValue = {
  account: Account;
  setAccountId: (id: AccountId) => void;
};

const AccountContext = createContext<AccountContextValue | null>(null);
const STORAGE_KEY = "tempo_ci_active_account";

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [accountId, setAccountId] = useState<AccountId>("cso_sarah");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as AccountId | null;
      if (stored === "cso_sarah" || stored === "ceo_vic") setAccountId(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, accountId);
    } catch {
      // ignore
    }
  }, [accountId]);

  const account = useMemo(() => ACCOUNTS.find((a) => a.id === accountId) ?? ACCOUNTS[0], [accountId]);

  return <AccountContext.Provider value={{ account, setAccountId }}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}

