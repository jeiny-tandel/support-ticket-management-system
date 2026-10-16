import React from "react";
import { Progress, Tag, Tooltip } from "antd";
import {
  RiseOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { TicketSummaryResponse } from "../../../types";

interface QueueHealthCardProps {
  summary: TicketSummaryResponse | null;
  loading: boolean;
}

export const QueueHealthCard: React.FC<QueueHealthCardProps> = ({
  summary,
  loading,
}) => {
  const total = summary?.total ?? 0;
  const activeCount = (summary?.open ?? 0) + (summary?.inProgress ?? 0);
  const completedCount = (summary?.resolved ?? 0) + (summary?.closed ?? 0);

  const resolutionRate =
    total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const activeRate = total > 0 ? Math.round((activeCount / total) * 100) : 0;

  return (
    <div className="flex flex-col h-full justify-between flex-1">
      <div className="flex items-start justify-between pb-3 border-b border-gray-100 min-h-12 gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center text-xs shrink-0 mt-0.5">
            <RiseOutlined />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-gray-900 m-0 leading-snug">
              Queue Health & Resolution
            </h3>
            <span className="text-[11px] text-gray-400 font-normal block leading-tight mt-0.5">
              Active workload vs completed outcomes
            </span>
          </div>
        </div>

        <Tag
          color={
            resolutionRate >= 70
              ? "green"
              : resolutionRate >= 40
                ? "blue"
                : "orange"
          }
          className="m-0 text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 mt-0.5"
        >
          {resolutionRate >= 70
            ? "High Resolution"
            : resolutionRate >= 40
              ? "Moderate Resolution"
              : "Pending Resolution"}
        </Tag>
      </div>

      {loading ? (
        <div className="py-6 space-y-3 animate-pulse flex-1 flex flex-col justify-center">
          <div className="h-5 w-3/4 bg-gray-100 rounded" />
          <div className="h-2 w-full bg-gray-100 rounded-full" />
          <div className="h-12 w-full bg-gray-50 rounded-lg" />
        </div>
      ) : (
        <div className="py-3 flex flex-col justify-center flex-1 space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                Overall Resolution Rate
                <Tooltip title="Percentage of tickets that have been marked as Resolved or Closed.">
                  <InfoCircleOutlined className="text-gray-400 cursor-pointer text-[11px]" />
                </Tooltip>
              </span>
              <span className="font-bold text-xs text-gray-900 tabular-nums">
                {resolutionRate}%
              </span>
            </div>
            <Progress
              percent={resolutionRate}
              showInfo={false}
              strokeColor={{
                "0%": "#6366f1",
                "100%": "#10b981",
              }}
              trailColor="#f1f5f9"
              size={["100%", 7]}
              className="m-0"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100/70">
              <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold mb-0.5">
                <ClockCircleFilled className="text-[10px]" />
                <span>Active Queue</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-blue-900 tabular-nums">
                  {activeCount}
                </span>
                <span className="text-[11px] font-mono text-blue-600 tabular-nums">
                  {activeRate}%
                </span>
              </div>
              <span className="text-[10px] text-blue-600/80 block mt-0.5">
                Open &amp; In-Progress
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100/70">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-0.5">
                <CheckCircleFilled className="text-[10px]" />
                <span>Settled Output</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-emerald-900 tabular-nums">
                  {completedCount}
                </span>
                <span className="text-[11px] font-mono text-emerald-600 tabular-nums">
                  {resolutionRate}%
                </span>
              </div>
              <span className="text-[10px] text-emerald-600/80 block mt-0.5">
                Resolved &amp; Closed
              </span>
            </div>
          </div>

          <div className="bg-gray-50/90 rounded-lg p-2 border border-gray-200/60 flex items-start gap-2">
            <InfoCircleOutlined className="text-gray-400 text-xs mt-0.5 shrink-0" />
            <div className="text-[11px] text-gray-500 leading-normal">
              <span className="font-semibold text-gray-700 block">
                Resolution Summary:
              </span>
              {resolutionRate >= 70
                ? "High resolution share: Over 70% of tickets resolved or closed across workspace."
                : resolutionRate >= 40
                  ? "Balanced lifecycle: Workload is evenly distributed between active and completed tickets."
                  : "Active workload focus: The majority of tickets are currently in open or in-progress status."}
            </div>
          </div>
        </div>
      )}

      <div className="pt-2.5 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between shrink-0">
        <span>Continuous queue health calculation</span>
        <span className="font-medium text-gray-500">
          {completedCount} of {total} completed
        </span>
      </div>
    </div>
  );
};

export default QueueHealthCard;
