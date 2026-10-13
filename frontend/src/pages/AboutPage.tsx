import React from "react";
import { Link } from "react-router-dom";
import {
  CompassOutlined,
  CheckCircleOutlined,
  LockOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { PageHeader, AppButton, AppCard } from "../components/common";
import { ROUTES } from "../constants/routes";

export const AboutPage: React.FC = () => {
  return (
    <div className="py-10 sm:py-14 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="About SolviX"
          subtitle="A dedicated support ticket management platform engineered for speed, transparency, and operational clarity."
          extra={
            <div className="flex gap-3">
              <Link to={ROUTES.LOGIN}>
                <AppButton type="default">Sign In</AppButton>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <AppButton type="primary">Register Agent</AppButton>
              </Link>
            </div>
          }
        />

        {/* Purpose Statement */}
        <AppCard elevated className="p-4 sm:p-6 mb-10 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shrink-0">
              <CompassOutlined />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 m-0">
                Our Purpose & Mission
              </h2>
              <p className="mt-2.5 text-base text-gray-600 leading-relaxed m-0">
                Customer support teams face high ticket volumes, fragmented
                communication, and slow resolution times when managing requests
                through generic inboxes. SolviX was created to provide a single,
                unified workspace that brings structure and accountability to
                every support conversation.
              </p>
              <p className="mt-2.5 text-base text-gray-600 leading-relaxed m-0">
                By formalizing ticket states, assigning issues directly to
                qualified Support Agents, and enforcing role-based permissions,
                SolviX transforms chaotic support queues into predictable,
                efficient workflows.
              </p>
            </div>
          </div>
        </AppCard>

        {/* Architectural Pillars */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6 m-0">
            How SolviX Delivers Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AppCard className="border border-gray-100">
              <div className="text-indigo-600 text-xl mb-3">
                <CheckCircleOutlined />
              </div>
              <h3 className="text-base font-bold text-gray-900 m-0">
                Structured Workflows
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed m-0">
                Every ticket progresses through defined statuses (Open, In
                Progress, Resolved), preventing tickets from slipping through the
                cracks.
              </p>
            </AppCard>

            <AppCard className="border border-gray-100">
              <div className="text-indigo-600 text-xl mb-3">
                <LockOutlined />
              </div>
              <h3 className="text-base font-bold text-gray-900 m-0">
                Role-Based Access
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed m-0">
                Administrators manage platform users and system settings, while
                Support Agents focus strictly on resolving tickets.
              </p>
            </AppCard>

            <AppCard className="border border-gray-100">
              <div className="text-indigo-600 text-xl mb-3">
                <ThunderboltOutlined />
              </div>
              <h3 className="text-base font-bold text-gray-900 m-0">
                Fast & Responsive
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed m-0">
                Built on modern React and Ant Design primitives, ensuring smooth
                desktop and mobile operations without bloat.
              </p>
            </AppCard>
          </div>
        </div>

        {/* Ready to join banner */}
        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-indigo-950 m-0">
              Join the SolviX Support Platform
            </h3>
            <p className="mt-1 text-sm text-indigo-700 m-0">
              Create a support agent account to get started with ticket handling.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 shrink-0">
            <Link to={ROUTES.REGISTER}>
              <AppButton type="primary">Register Account</AppButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
