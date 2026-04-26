import { Card } from "../components/Card";

export function Settings() {
  return (
    <Card title="Settings" subtitle="Prototype-only settings.">
      <div className="text-sm text-ink-2">
        Runtime configuration (AI provider keys, RSS feeds) lives in the backend <span className="font-medium text-ink">`.env`</span>.
      </div>
    </Card>
  );
}

