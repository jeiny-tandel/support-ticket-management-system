import React from "react";
import {
  InboxOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  LockOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import type { TicketStatus } from "../../../types";

export interface TicketLifecycleProgressProps {
  status: TicketStatus;
}

interface StepConfig {
  key: TicketStatus;
  title: string;
  shortDesc: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  {
    key: "OPEN",
    title: "Open",
    shortDesc: "Awaiting triage",
    icon: <InboxOutlined />,
  },
  {
    key: "IN_PROGRESS",
    title: "In Progress",
    shortDesc: "Under investigation",
    icon: <SyncOutlined />,
  },
  {
    key: "RESOLVED",
    title: "Resolved",
    shortDesc: "Solution provided",
    icon: <CheckCircleOutlined />,
  },
  {
    key: "CLOSED",
    title: "Closed",
    shortDesc: "Finalized & closed",
    icon: <LockOutlined />,
  },
];

const STATUS_DETAILS: Record<
  TicketStatus,
  {
    label: string;
    description: string;
    badgeBg: string;
    badgeText: string;
    dotColor: string;
  }
> = {
  OPEN: {
    label: "Open",
    description: "Ticket created and waiting for investigation or assignment.",
    badgeBg: "bg-blue-50 border-blue-200/80",
    badgeText: "text-blue-700",
    dotColor: "bg-blue-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    description:
      "Support agent is actively diagnosing and working on a resolution.",
    badgeBg: "bg-amber-50 border-amber-200/80",
    badgeText: "text-amber-800",
    dotColor: "bg-amber-500",
  },
  RESOLVED: {
    label: "Resolved",
    description:
      "Fix or resolution delivered; awaiting verification or sign-off.",
    badgeBg: "bg-emerald-50 border-emerald-200/80",
    badgeText: "text-emerald-800",
    dotColor: "bg-emerald-500",
  },
  CLOSED: {
    label: "Closed",
    description: "Ticket verified, completed, and archived from active queues.",
    badgeBg: "bg-slate-100 border-slate-200",
    badgeText: "text-slate-700",
    dotColor: "bg-slate-500",
  },
};

export const TicketLifecycleProgress: React.FC<
  TicketLifecycleProgressProps
> = ({ status }) => {
  const currentStepIndex = STEPS.findIndex((s) => s.key === status);
  const statusInfo = STATUS_DETAILS[status] || STATUS_DETAILS.OPEN;

  const getStepState = (
    index: number,
  ): "completed" | "current" | "upcoming" => {
    if (status === "CLOSED") {
      return "completed";
    }
    if (index < currentStepIndex) {
      return "completed";
    }
    if (index === currentStepIndex) {
      return "current";
    }
    return "upcoming";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-4 sm:p-5">
      {/* Header bar with status announcement */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Lifecycle Stage
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-medium">
            Current status:{" "}
            <strong className="text-gray-900">{statusInfo.label}</strong>
          </span>
        </div>

        <div
          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium self-start sm:self-auto ${statusInfo.badgeBg} ${statusInfo.badgeText}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${statusInfo.dotColor} animate-pulse`}
          />
          <span className="font-semibold">{statusInfo.label} Stage</span>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="px-1 sm:px-4 py-1">
        <div className="relative flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const state = getStepState(idx);
            const isLast = idx === STEPS.length - 1;

            return (
              <React.Fragment key={step.key}>
                {/* Step Node */}
                <div className="flex flex-col items-center relative z-10 text-center min-w-17.5 sm:min-w-22.5">
                  {/* Circle Indicator */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all shadow-xs ${
                      state === "completed"
                        ? "bg-emerald-600 text-white border-2 border-emerald-600 ring-4 ring-emerald-50"
                        : state === "current"
                          ? "bg-purple-600 text-white border-2 border-purple-600 ring-4 ring-purple-100 scale-105"
                          : "bg-white text-gray-400 border-2 border-gray-200"
                    }`}
                  >
                    {state === "completed" ? (
                      <CheckOutlined className="text-xs sm:text-sm font-bold" />
                    ) : (
                      <span className="text-xs sm:text-sm">{step.icon}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <p
                      className={`text-xs font-bold m-0 leading-tight ${
                        state === "current"
                          ? "text-purple-700 font-extrabold"
                          : state === "completed"
                            ? "text-gray-900"
                            : "text-gray-400 font-normal"
                      }`}
                    >
                      {step.title}
                    </p>
                    <span
                      className={`text-[10px] hidden sm:block mt-0.5 leading-tight ${
                        state === "current"
                          ? "text-purple-600 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {state === "current"
                        ? "Active"
                        : state === "completed"
                          ? "Done"
                          : step.shortDesc}
                    </span>
                  </div>
                </div>

                {/* Connecting Line between steps */}
                {!isLast && (
                  <div className="flex-1 -mt-6 sm:-mt-5 mx-1 sm:mx-3 relative">
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          state === "completed"
                            ? "bg-emerald-500 w-full"
                            : "bg-transparent w-0"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Explanatory footer subtitle */}
      <div className="mt-3 pt-3 border-t border-gray-100/80 text-xs text-gray-400 flex items-center justify-between flex-wrap gap-2">
        <span>{statusInfo.description}</span>
        <span className="text-[11px] text-gray-400 font-normal">
          Authorized changes via{" "}
          <strong className="text-gray-600">Update Status</strong>
        </span>
      </div>
    </div>
  );
};

export default TicketLifecycleProgress;
