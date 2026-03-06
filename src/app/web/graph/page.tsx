"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/src/components/layout/TopBar";
import { GitBranch, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

// Static demo graph until item router is live
const DEMO_NODES = [
  { id: "1", label: "Encrypted Note A", type: "NOTE", x: 300, y: 200 },
  { id: "2", label: "Encrypted Note B", type: "NOTE", x: 500, y: 150 },
  { id: "3", label: "Link → Article", type: "LINK", x: 200, y: 350 },
  { id: "4", label: "Resource", type: "RESOURCE", x: 450, y: 320 },
  { id: "5", label: "Note C", type: "NOTE", x: 620, y: 280 },
  { id: "6", label: "Link → Research", type: "LINK", x: 350, y: 420 },
];

const DEMO_EDGES = [
  { from: "1", to: "2" },
  { from: "1", to: "3" },
  { from: "2", to: "4" },
  { from: "4", to: "5" },
  { from: "3", to: "6" },
  { from: "4", to: "6" },
];

const TYPE_COLORS: Record<string, string> = {
  NOTE: "#6366f1",
  LINK: "#3b82f6",
  RESOURCE: "#a855f7",
  PASSWORD: "#f59e0b",
};

export default function GraphPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState(DEMO_NODES);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Knowledge Graph" />

      <div className="flex-1 relative overflow-hidden bg-[#080808]">
        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}
            className="w-8 h-8 rounded-lg border border-white/8 bg-white/3 flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-white/15 transition-all"
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.1, 0.4))}
            className="w-8 h-8 rounded-lg border border-white/8 bg-white/3 flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-white/15 transition-all"
          >
            <ZoomOut size={13} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="w-8 h-8 rounded-lg border border-white/8 bg-white/3 flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-white/15 transition-all"
          >
            <Maximize2 size={11} />
          </button>
        </div>

        {/* Graph note */}
        <div className="absolute bottom-4 left-4 z-10 px-3 py-2 rounded-lg bg-white/3 border border-white/6 text-[10px] text-zinc-600">
          Connect your items using links to build a knowledge graph
        </div>

        {/* SVG Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full"
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease",
            }}
          >
            {/* Grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
              </pattern>
              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Edges */}
            {DEMO_EDGES.map((edge, i) => {
              const from = nodes.find((n) => n.id === edge.from);
              const to = nodes.find((n) => n.id === edge.to);
              if (!from || !to) return null;
              return (
                <motion.line
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="rgba(99,102,241,0.2)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node, i) => {
              const color = TYPE_COLORS[node.type] ?? "#6366f1";
              const isSelected = selected === node.id;
              return (
                <motion.g
                  key={node.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelected(isSelected ? null : node.id)}
                >
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={24}
                      fill={color}
                      opacity={0.08}
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 8 : 6}
                    fill={color}
                    opacity={0.9}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 12 : 10}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                    opacity={0.25}
                  />
                  <text
                    x={node.x}
                    y={node.y + 22}
                    textAnchor="middle"
                    fill="rgba(161,161,170,0.8)"
                    fontSize={9}
                    fontFamily="var(--font-sans)"
                  >
                    {node.label}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </motion.div>

        {/* Legend */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 px-3 py-2.5 rounded-lg bg-white/3 border border-white/6">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-zinc-600 capitalize">{type.toLowerCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
