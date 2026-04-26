import { useAccount } from "../lib/accounts";
import { CsoDashboard } from "./CsoDashboard";

export function Dashboard() {
  useAccount(); // keep provider wiring intact; only one active account for now
  return <CsoDashboard />;
}

