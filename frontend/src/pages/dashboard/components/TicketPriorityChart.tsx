import React from "react";
import { Tag } from "antd";
import { FlagOutlined } from "@ant-design/icons";
import type { TicketSummaryResponse } from "../../../types";

interface TicketPriorityChartProps {
  summary: TicketSummaryResponse | null;
  loading: boolean;
}

interface PriorityBarItem {
  key: string;
  label: string;
  count: number;
  percent: number;
  barColor: string;
  pillClass: string;
  dotColor: string;
}

export const TicketPriorityChart: React.FC<TicketPriorityChartProps> = ({
  summary,
  loading,
}) => {
  const total = summary?.total ?? 0;
  const priorities = summary?.priorities;

  const lowCount = priorities?.low ?? 0;
  const mediumCount = priorities?.medium ?? 0;
  const highCount = priorities?.high ?? 0;

  const getPercent = (count: number) =>
    total > 0 ? Math.round((count / total) * 100) : 0;

  const items: PriorityBarItem[] = [
    {
      key: "HIGH",
      label: "High Priority",
      count: highCount,
      percent: getPercent(highCount),
      barColor: "bg-rose-500",
      pillClass: "bg-rose-50 text-rose-700 border-rose-200/80",
      dotColor: "bg-rose-500",
    },
    {
      key: "MEDIUM",
      label: "Medium Priority",
      count: mediumCount,
      percent: getPercent(mediumCount),
      barColor: "bg-amber-500",
      pillClass: "bg-amber-50 text-amber-700 border-amber-200/80",
      dotColor: "bg-amber-500",
    },
    {
      key: "LOW",
      label: "Low Priority",
      count: lowCount,
      percent: getPercent(lowCount),
      barColor: "bg-teal-500",
      pillClass: "bg-teal-50 text-teal-700 border-teal-200/80",
      dotColor: "bg-teal-500",
    },
  ];

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
          <div className="h-3.5 w-3/4 bg-gray-100 rounded" />
          <div className="h-2 w-full bg-gray-100 rounded-full" />
          <div className="h-3.5 w-1/2 bg-gray-100 rounded" />
          <div className="h-2 w-full bg-gray-100 rounded-full" />
          <div className="h-3.5 w-2/3 bg-gray-100 rounded" />
          <div className="h-2 w-full bg-gray-100 rounded-full" />
        </div>
      ) : (
        <div className="py-3 flex flex-col justify-center flex-1 space-y-3">
          {items.map((item) => (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${item.dotColor}`}
                  />
                  <span className="font-semibold text-gray-800 text-xs whitespace-nowrap">
                    {item.label}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border tabular-nums shrink-0 ${item.pillClass}`}
                  >
                    {item.percent}%
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-extrabold text-xs text-gray-900 tabular-nums">
                    {item.count}
                  </span>
                  <span className="text-[11px] text-gray-400 font-normal">
                    tickets
                  </span>
                </div>
              </div>

              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${item.barColor}`}
                  style={{
                    width: `${Math.max(item.count > 0 ? 3 : 0, item.percent)}%`,
                  }}
                />
              </div>
            </div>
          ))}
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
