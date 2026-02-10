// components/LiquidityNet.tsx
"use client";

import { useRef, useEffect } from "react";

interface LiquidityLayer {
  price: number;
  depth: number;
  color: string;
  volume: number;
}

export function LiquidityNet() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Simple SVG visualization without d3 for now
    const svg = svgRef.current;
    svg.innerHTML = "";

    // Generate layers from p=0.4 to p=2
    const layers: LiquidityLayer[] = [];
    const colors = ["#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

    for (let i = 0; i < 16; i++) {
      const price = 0.4 + i * 0.1;
      layers.push({
        price,
        depth: Math.random() * 100 + 50,
        color: colors[i % colors.length],
        volume: Math.random() * 1000000 + 500000,
      });
    }

    // Create simple bars
    layers.forEach((layer, index) => {
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      rect.setAttribute("x", (index * 25).toString());
      rect.setAttribute("y", (200 - layer.depth).toString());
      rect.setAttribute("width", "20");
      rect.setAttribute("height", layer.depth.toString());
      rect.setAttribute("fill", layer.color);
      rect.setAttribute("opacity", "0.7");
      svg.appendChild(rect);
    });

    // Add price line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "200"); // Current price at p=1.2
    line.setAttribute("x2", "200");
    line.setAttribute("y1", "0");
    line.setAttribute("y2", "200");
    line.setAttribute("stroke", "#60a5fa");
    line.setAttribute("stroke-width", "2");
    line.setAttribute("stroke-dasharray", "5,5");
    svg.appendChild(line);
  }, []);

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">🕸️ Liquidity Net</h3>
        <div className="text-sm text-gray-400">
          Layers: <span className="text-green-400">p=0.4</span> →
          <span className="text-purple-400">p=1.0</span> →
          <span className="text-orange-400">p=1.6</span> →
          <span className="text-red-400">p=2.0</span>
        </div>
      </div>
      <svg
        ref={svgRef}
        width="400"
        height="200"
        className="border border-gray-700 rounded-lg w-full"
        viewBox="0 0 400 200"
      />
      <div className="mt-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-green-400 font-bold">Green Layer</div>
          <div className="text-gray-400 text-sm">p=0.4-0.8</div>
        </div>
        <div className="text-center">
          <div className="text-purple-400 font-bold">Violet Layer</div>
          <div className="text-gray-400 text-sm">p=0.8-1.2</div>
        </div>
        <div className="text-center">
          <div className="text-orange-400 font-bold">Orange Layer</div>
          <div className="text-gray-400 text-sm">p=1.2-1.6</div>
        </div>
        <div className="text-center">
          <div className="text-red-400 font-bold">Red Layer</div>
          <div className="text-gray-400 text-sm">p=1.6-2.0</div>
        </div>
      </div>
    </div>
  );
}
