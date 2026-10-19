import React, { useMemo } from "react";
import { PieChartOutlined } from "@ant-design/icons";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { TicketSummaryResponse } from "../../../types";

interface TicketStatusDonutProps {
  summary: TicketSummaryResponse | null;
  loading: boolean;
}

interface StatusSlice {
  key: string;
  name: string;
  count: number;
  color: string;
  bgDot: string;
  percent: number;
}

interface DonutTooltipPayloadItem {
  name?: string;
  value?: number;
  payload?: {
    name: string;
    value: number;
    color: string;
    percent: number;
    isEmpty?: boolean;
  };
}

interface DonutTooltipProps {
  active?: boolean;
  payload?: DonutTooltipPayloadItem[];
}

const DonutTooltip: React.FC<DonutTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    if (!data || data.isEmpty) return null;
    return (
      <div className="bg-gray-900/95 backdrop-blur-xs text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-gray-700/60 pointer-events-none">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium text-gray-200">{data.name}:</span>
          <span className="font-bold text-white tabular-nums">{data.value}</span>
          <span className="text-gray-400 tabular-nums">({data.percent}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

export const TicketStatusDonut: React.FC<TicketStatusDonutProps> = ({
  summary,
  loading,
}) => {
  const total = summary?.total ?? 0;

  const slices: StatusSlice[] = useMemo(() => {
    const raw = [
      {
        key: "OPEN",
        name: "Open",
        count: summary?.open ?? 0,
        color: "#3b82f6",
        bgDot: "bg-blue-500",
      },
      {
        key: "IN_PROGRESS",
        name: "In Progress",
        count: summary?.inProgress ?? 0,
        color: "#f59e0b",
        bgDot: "bg-amber-500",
      },
      {
        key: "RESOLVED",
        name: "Resolved",
        count: summary?.resolved ?? 0,
        color: "#10b981",
        bgDot: "bg-emerald-500",
      },
      {
        key: "CLOSED",
        name: "Closed",
        count: summary?.closed ?? 0,
        color: "#64748b",
        bgDot: "bg-slate-500",
      },
    ];

    return raw.map((item) => ({
      ...item,
      percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
    }));
  }, [summary, total]);

  const activeSlices = useMemo(
    () => slices.filter((s) => s.count > 0),
    [slices],
  );

  const chartData = useMemo(() => {
    if (total === 0) {
      return [{ name: "No Tickets", value: 1, color: "#f1f5f9", percent: 0, isEmpty: true }];
    }
    return activeSlices.map((s) => ({
      name: s.name,
      value: s.count,
      color: s.color,
      percent: s.percent,
      key: s.key,
      isEmpty: false,
    }));
  }, [activeSlices, total]);

  return (
    <div className="flex flex-col h-full justify-between flex-1">
      <div className="flex items-start justify-between pb-3 border-b border-gray-100 min-h-12 gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center text-xs shrink-0 mt-0.5">
            <PieChartOutlined />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-gray-900 m-0 leading-snug">
              Status Distribution
            </h3>
            <span className="text-[11px] text-gray-400 font-normal block leading-tight mt-0.5">
              Active workspace lifecycle breakdown
            </span>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100/80 shrink-0 tabular-nums mt-0.5">
          {total} Total
        </span>
      </div>

      {loading ? (
        <div className="py-6 flex flex-col items-center justify-center gap-2.5 animate-pulse flex-1">
          <div className="w-28 h-28 rounded-full border-8 border-gray-100" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      ) : (
        <div className="py-2.5 flex flex-col sm:flex-row xl:flex-col min-[1400px]:flex-row items-center justify-center gap-3.5 flex-1 w-full min-w-0">
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={62}
                  paddingAngle={total > 0 && chartData.length > 1 ? 3 : 0}
                  stroke="none"
                  isAnimationActive={true}
                  animationDuration={500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`donut-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {total > 0 && (
                  <Tooltip
                    content={<DonutTooltip />}
                    wrapperStyle={{ outline: "none", zIndex: 50 }}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight tabular-nums leading-none">
                {total}
              </span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                Tickets
              </span>
            </div>
          </div>

          <div className="w-full min-w-0 sm:flex-1 xl:w-full min-[1400px]:flex-1 space-y-1.5">
            {slices.map((slice) => (
              <div
                key={slice.key}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-gray-50/80 transition-colors gap-2 min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${slice.bgDot}`}
                  />
                  <span className="font-medium text-gray-700 whitespace-nowrap">
                    {slice.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-gray-900 tabular-nums text-xs">
                    {slice.count}
                  </span>
                  <span className="font-semibold text-gray-500 bg-gray-100/80 border border-gray-200/60 rounded px-1.5 py-0.5 text-[10px] tabular-nums">
                    {slice.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2.5 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between shrink-0">
        <span>Segments represent live workspace totals</span>
        <span className="font-medium text-gray-500">100% synchronized</span>
      </div>
    </div>
  );
};

export default TicketStatusDonut;
