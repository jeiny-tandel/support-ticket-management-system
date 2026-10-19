import React, { useMemo } from "react";
import { Tag } from "antd";
import { FlagOutlined } from "@ant-design/icons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  LabelList,
} from "recharts";
import type { TicketSummaryResponse } from "../../../types";

interface TicketPriorityChartProps {
  summary: TicketSummaryResponse | null;
  loading: boolean;
}

interface PriorityChartItem {
  priority: string;
  name: string;
  count: number;
  percent: number;
  color: string;
  pillClass: string;
  dotClass: string;
}

interface PriorityTooltipPayloadItem {
  name?: string;
  value?: number;
  payload?: PriorityChartItem;
}

interface PriorityTooltipProps {
  active?: boolean;
  payload?: PriorityTooltipPayloadItem[];
}

const PriorityTooltip: React.FC<PriorityTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    if (!data) return null;
    return (
      <div className="bg-gray-900/95 backdrop-blur-xs text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-gray-700/60 pointer-events-none">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-semibold text-white">{data.name} Priority:</span>
          <span className="font-bold text-white tabular-nums">{data.count}</span>
          <span className="text-gray-400 tabular-nums">({data.percent}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

export const TicketPriorityChart: React.FC<TicketPriorityChartProps> = ({
  summary,
  loading,
}) => {
  const total = summary?.total ?? 0;
  const priorities = summary?.priorities;

  const lowCount = priorities?.low ?? 0;
  const mediumCount = priorities?.medium ?? 0;
  const highCount = priorities?.high ?? 0;

  const chartData: PriorityChartItem[] = useMemo(() => {
    const calcPercent = (count: number) =>
      total > 0 ? Math.round((count / total) * 100) : 0;

    return [
      {
        priority: "HIGH",
        name: "High",
        count: highCount,
        percent: calcPercent(highCount),
        color: "#f43f5e",
        pillClass: "bg-rose-50 text-rose-700 border-rose-200/80",
        dotClass: "bg-rose-500",
      },
      {
        priority: "MEDIUM",
        name: "Medium",
        count: mediumCount,
        percent: calcPercent(mediumCount),
        color: "#f59e0b",
        pillClass: "bg-amber-50 text-amber-700 border-amber-200/80",
        dotClass: "bg-amber-500",
      },
      {
        priority: "LOW",
        name: "Low",
        count: lowCount,
        percent: calcPercent(lowCount),
        color: "#14b8a6",
        pillClass: "bg-teal-50 text-teal-700 border-teal-200/80",
        dotClass: "bg-teal-500",
      },
    ];
  }, [highCount, mediumCount, lowCount, total]);

  const maxCount = Math.max(highCount, mediumCount, lowCount);

  return (
    <div className="flex flex-col h-full justify-between flex-1">
      <div className="flex items-start justify-between pb-3 border-b border-gray-100 min-h-12 gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100/80 text-purple-600 flex items-center justify-center text-xs shrink-0 mt-0.5">
            <FlagOutlined />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-gray-900 m-0 leading-snug">
              Priority Distribution
            </h3>
            <span className="text-[11px] text-gray-400 font-normal block leading-tight mt-0.5">
              Workload segmented by urgency level
            </span>
          </div>
        </div>

        <Tag
          color="purple"
          className="m-0 text-xs font-semibold px-2 py-0.5 rounded-full border border-purple-200/80 bg-purple-50 text-purple-700 shrink-0 mt-0.5"
        >
          {highCount > 0 ? `${highCount} Urgent` : "Normal Load"}
        </Tag>
      </div>

      {loading ? (
        <div className="py-6 space-y-3 animate-pulse flex-1 flex flex-col justify-center">
          <div className="h-24 w-full bg-gray-50 rounded-lg" />
          <div className="h-6 w-full bg-gray-100 rounded" />
        </div>
      ) : (
        <div className="py-2.5 flex flex-col justify-between flex-1 gap-2">
          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 16, right: 12, left: -22, bottom: 0 }}
                barSize={34}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  domain={[
                    0,
                    maxCount > 0 ? Math.ceil(maxCount * 1.25) : 3,
                  ]}
                />
                <Tooltip
                  content={<PriorityTooltip />}
                  cursor={{ fill: "rgba(248, 250, 252, 0.75)" }}
                  wrapperStyle={{ outline: "none", zIndex: 50 }}
                />
                <Bar
                  dataKey="count"
                  radius={[5, 5, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`priority-cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    formatter={(val: unknown) =>
                      typeof val === "number" && val > 0 ? val : ""
                    }
                    style={{
                      fill: "#475569",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            {chartData.map((item) => (
              <div
                key={item.priority}
                className={`flex items-center justify-between px-2 py-1 rounded-lg border text-xs min-w-0 ${item.pillClass}`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.dotClass}`}
                  />
                  <span className="font-semibold truncate text-[11px]">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 font-bold tabular-nums text-xs">
                  <span>{item.count}</span>
                  <span className="text-[10px] font-normal opacity-75">
                    ({item.percent}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2.5 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between shrink-0">
        <span>Urgency triage breakdown</span>
        <span className="font-medium text-gray-500">
          {highCount} high • {mediumCount} med • {lowCount} low
        </span>
      </div>
    </div>
  );
};

export default TicketPriorityChart;
