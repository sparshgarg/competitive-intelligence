import { useAccount } from "../lib/accounts";
import { CeoDashboard } from "./CeoDashboard";
import { CsoDashboard } from "./CsoDashboard";

export function Dashboard() {
  const { account } = useAccount();
  if (account.id === "ceo_vic") return <CeoDashboard />;
  return <CsoDashboard />;
}

