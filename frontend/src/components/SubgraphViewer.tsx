import { ChevronRight } from "lucide-react";
import { COLORS } from "../lib/colors";
import type { GraphNode, Subgraph } from "../lib/types";

function nodeColor(node: GraphNode) {
  if (node.type === "signal" && node.source_type) return COLORS.src[node.source_type]?.bg ?? COLORS.surface2;
  if (node.type === "competitor") return COLORS.navy;
  if (node.type === "capability") return COLORS.amberBg;
  if (node.type === "initiative") return COLORS.aiBg;
  return COLORS.surface2;
}

function textColor(node: GraphNode) {
  if (node.type === "competitor") return "#fff";
  if (node.type === "signal" && node.source_type) return COLORS.src[node.source_type]?.text ?? COLORS.ink;
  if (node.type === "capability") return COLORS.amber;
  if (node.type === "initiative") return COLORS.ai;
  return COLORS.ink;
}

export function SubgraphViewer({ subgraph }: { subgraph?: Subgraph; height?: number }) {
  const nodes = (subgraph?.nodes ?? []).filter((n) => n.type !== "recommendation");
  const edges = subgraph?.edges ?? [];
  if (!nodes.length) return <div className="text-sm text-ink-2">No trace data available.</div>;

  const adj = new Map<string, string[]>();
  edges.forEach((e) => {
    if (!adj.has(e.src)) adj.set(e.src, []);
    adj.get(e.src)!.push(e.dst);
  });

  const incoming = new Set(edges.map((e) => e.dst));
  let sources = nodes.filter((n) => !incoming.has(n.id));
  if (sources.length === 0 && nodes.length > 0) {
    sources = [nodes[0]];
  }

  const paths: GraphNode[][] = [];

  function dfs(currentId: string, currentPath: GraphNode[]) {
    const node = nodes.find((n) => n.id === currentId);
    if (!node) return;
    const newPath = [...currentPath, node];

    const neighbors = adj.get(currentId) || [];
    if (neighbors.length === 0 || newPath.length >= 6) {
      paths.push(newPath);
    } else {
      neighbors.forEach((n) => dfs(n, newPath));
    }
  }

  sources.forEach((s) => dfs(s.id, []));

  // De-duplicate paths roughly by ID string, limit to 6 for readability
  const uniquePaths = Array.from(new Map(paths.map(p => [p.map(n => n.id).join('-'), p])).values()).slice(0, 6);

  return (
    <div className="flex flex-col gap-3 rounded border border-border bg-surface-2 p-4 overflow-x-auto">
      {uniquePaths.length === 0 ? (
        <div className="text-sm text-ink-2">No logical paths found in trace.</div>
      ) : (
        uniquePaths.map((path, idx) => (
          <div key={idx} className="flex items-center gap-2 min-w-max">
            {path.map((node, i) => (
              <div key={`${idx}-${node.id}-${i}`} className="flex items-center gap-2">
                <div
                  className="flex h-[48px] w-[180px] flex-col justify-center rounded-lg border px-3 py-1 shadow-sm transition-colors hover:border-ink-3/50"
                  style={{
                    backgroundColor: nodeColor(node),
                    borderColor: node.type === "initiative" ? COLORS.ai : COLORS.border,
                  }}
                >
                  <div
                    className="truncate text-[11px] font-semibold"
                    style={{ color: textColor(node) }}
                    title={node.label}
                  >
                    {node.label}
                  </div>
                  <div
                    className="mt-0.5 text-[9px] font-bold uppercase tracking-widest"
                    style={{ color: node.type === "competitor" ? "rgba(255,255,255,0.7)" : COLORS.ink3 }}
                  >
                    {node.type}
                  </div>
                </div>
                {i < path.length - 1 && <ChevronRight className="h-4 w-4 text-ink-3 shrink-0" />}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

