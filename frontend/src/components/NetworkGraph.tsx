import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { COLORS } from "../lib/colors";
import type { GraphNode, Subgraph } from "../lib/types";

type ForceNode = GraphNode & { x?: number; y?: number };

function nodeColor(node: GraphNode) {
  if (node.type === "competitor") return COLORS.navy;
  if (node.type === "initiative") return COLORS.ai;
  if (node.type === "capability") return COLORS.amber;
  if (node.type === "signal" && node.source_type) return COLORS.src[node.source_type]?.text ?? COLORS.navy2;
  if (node.type === "recommendation") return COLORS.teal;
  return COLORS.ink3;
}

function nodeRadius(node: GraphNode) {
  if (node.type === "competitor") return 8;
  if (node.type === "initiative") return 7;
  if (node.type === "capability") return 5;
  if (node.type === "recommendation") return 6;
  return 4;
}

export function NetworkGraph({
  graph,
  selectedNodeId,
  hitNodeIds,
  onNodeSelect,
}: {
  graph: Subgraph;
  selectedNodeId?: string | null;
  hitNodeIds?: Set<string>;
  onNodeSelect?: (id: string) => void;
}) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const hits = hitNodeIds ?? new Set<string>();

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const data = useMemo(
    () => ({
      nodes: graph.nodes.map((n) => ({ ...n })),
      links: graph.edges.map((e) => ({ ...e, source: e.src, target: e.dst })),
    }),
    [graph.edges, graph.nodes]
  );

  useEffect(() => {
    if (fgRef.current) {
      // Improve physics to prevent clumping
      fgRef.current.d3Force("charge")?.strength(-250);
      fgRef.current.d3ReheatSimulation?.();
      // Ensure the graph centers on the visible data after 500ms
      setTimeout(() => fgRef.current?.zoomToFit?.(400, 200), 500);
    }
  }, [data.nodes.length, data.links.length]);

  return (
    <div ref={containerRef} className="h-full w-full bg-white/50">
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeRelSize={5}
      cooldownTicks={90}
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      nodeLabel={(node) => `${(node as GraphNode).type}: ${(node as GraphNode).label}`}
      linkLabel={(link) => `${(link as any).edge_type}`}
      linkWidth={(link) => Math.max(1, Number((link as any).weight ?? (link as any).confidence ?? (link as any).exposure_score ?? 0.45) * 2.5)}
      linkColor={() => COLORS.border}
      onNodeClick={(node) => onNodeSelect?.(String((node as GraphNode).id))}
      nodeCanvasObject={(node, ctx, globalScale) => {
        const n = node as ForceNode;
        const r = nodeRadius(n);
        const isSelected = selectedNodeId === n.id;
        const isHit = hits.has(n.id);
        ctx.beginPath();
        ctx.arc(n.x ?? 0, n.y ?? 0, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = nodeColor(n);
        ctx.fill();
        if (isSelected || isHit) {
          ctx.lineWidth = (isSelected ? 3 : 2) / globalScale;
          ctx.strokeStyle = isSelected ? COLORS.ai : COLORS.teal;
          ctx.stroke();
        }

        const label = n.label.length > 22 ? `${n.label.slice(0, 20)}…` : n.label;
        const fontSize = Math.max(9, 11 / globalScale);
        ctx.font = `${fontSize}px Inter, system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = COLORS.ink;
        ctx.fillText(label, n.x ?? 0, (n.y ?? 0) + r + 3);
      }}
    />
    </div>
  );
}

