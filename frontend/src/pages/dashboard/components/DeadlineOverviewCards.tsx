import React from "react";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { Card } from "../../../components/common";
import type { TicketSummaryResponse } from "../../../types";

interface DeadlineOverviewCardsProps {
  summary: TicketSummaryResponse | null;
  loading: boolean;
}

export const DeadlineOverviewCards: React.FC<DeadlineOverviewCardsProps> = ({
  summary,
  loading,
}) => {
  const deadlines = summary?.deadlines;
  const overdueCount = deadlines?.overdue ?? 0;
  const dueTodayCount = deadlines?.dueToday ?? 0;
  const dueSoonCount = deadlines?.dueSoon ?? 0;

  const deadlineCards = [
    {
      label: "Overdue",
      count: overdueCount,
      subtext: "Active tickets past deadline",
      badgeText: overdueCount > 0 ? "Requires action" : "All clear",
      valueColor: overdueCount > 0 ? "text-rose-600" : "text-rose-600/80",
      accentBorder: "border-t-4 border-t-rose-500",
      icon: <ClockCircleOutlined className="text-base" />,
      iconBoxClass: "bg-rose-50 text-rose-600 border border-rose-100",
      badgePillClass:
        overdueCount > 0
          ? "bg-rose-50 text-rose-700 border border-rose-100/80 font-semibold"
          : "bg-gray-50 text-gray-500 border border-gray-100",
    },
    {
      label: "Due Today",
      count: dueTodayCount,
      subtext: "Targeting resolution today",
      badgeText: dueTodayCount > 0 ? "Target today" : "None today",
      valueColor: dueTodayCount > 0 ? "text-amber-600" : "text-amber-600/80",
      accentBorder: "border-t-4 border-t-amber-500",
      icon: <CalendarOutlined className="text-base" />,
      iconBoxClass: "bg-amber-50 text-amber-600 border border-amber-100",
      badgePillClass:
        dueTodayCount > 0
          ? "bg-amber-50 text-amber-700 border border-amber-100/80 font-semibold"
          : "bg-gray-50 text-gray-500 border border-gray-100",
    },
    {
      label: "Due Soon",
      count: dueSoonCount,
      subtext: "Due within next 48 hours",
      badgeText: dueSoonCount > 0 ? "Next 48h" : "Queue clear",
      valueColor: dueSoonCount > 0 ? "text-indigo-600" : "text-indigo-600/80",
      accentBorder: "border-t-4 border-t-indigo-500",
      icon: <AlertOutlined className="text-base" />,
      iconBoxClass: "bg-indigo-50 text-indigo-600 border border-indigo-100",
      badgePillClass:
        dueSoonCount > 0
          ? "bg-indigo-50 text-indigo-700 border border-indigo-100/80 font-semibold"
          : "bg-gray-50 text-gray-500 border border-gray-100",
    },
  ];

  return (
    <section className="mb-5">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-xs text-gray-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 m-0">
            Deadline Overview
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {deadlineCards.map((item) => (
          <Card
            key={item.label}
            elevated
            className={`bg-white border-gray-200/80 shadow-xs hover:shadow-md transition-all ${item.accentBorder} flex flex-col justify-between`}
            styles={{
              body: {
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between",
              },
            }}
          >
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider leading-tight">
                {item.label}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.iconBoxClass}`}
              >
                {item.icon}
              </div>
            </div>

            {loading ? (
              <div className="mt-2.5 flex flex-col gap-1.5 animate-pulse">
                <div className="h-7 w-16 bg-gray-200/80 rounded-md" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
            ) : (
              <div className="mt-2 flex-1 flex flex-col justify-end">
                <div className="flex items-baseline justify-between gap-1.5">
                  <p
                    className={`text-2xl sm:text-3xl font-extrabold tracking-tight m-0 tabular-nums ${item.valueColor}`}
                  >
                    {item.count}
                  </p>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded tabular-nums shrink-0 ${item.badgePillClass}`}
                  >
                    {item.badgeText}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-400 m-0 font-normal leading-4">
                  {item.subtext}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
};

export default DeadlineOverviewCards;
