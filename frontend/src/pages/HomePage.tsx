import React from "react";
import { Link } from "react-router-dom";
import {
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { AppButton, AppCard } from "../components/common";
import { ROUTES } from "../constants/routes";

export const HomePage: React.FC = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle background ambient blur */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-50/70 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-6 shadow-2xs">
            <ThunderboltOutlined /> Enterprise Support Ticket Management System
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto m-0">
            Customer Issue Resolution,{" "}
            <span className="text-indigo-600">Engineered for Speed</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            SolviX streamlines ticket queues, orchestrates agent workflows, and
            delivers role-based accountability to resolve customer requests faster.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ROUTES.REGISTER}>
              <AppButton
                type="primary"
                size="large"
                className="h-12 px-7 text-base font-semibold shadow-md shadow-indigo-200"
              >
                Register as Support Agent <ArrowRightOutlined />
              </AppButton>
            </Link>

            <Link to={ROUTES.LOGIN}>
              <AppButton
                type="default"
                size="large"
                className="h-12 px-7 text-base font-semibold text-gray-700 bg-white"
              >
                Sign In to Workspace
              </AppButton>
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-2">
              <CheckCircleFilled className="text-emerald-500" />
              Role-Based Access Control
            </span>
            <span className="flex items-center gap-2">
              <CheckCircleFilled className="text-emerald-500" />
              Real-Time Ticket Tracking
            </span>
            <span className="flex items-center gap-2">
              <CheckCircleFilled className="text-emerald-500" />
              Dedicated Agent Queues
            </span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight m-0">
              Built for Modern Support Operations
            </h2>
            <p className="mt-3 text-base text-gray-500 m-0">
              Everything your team needs to prioritize, collaborate, and close tickets with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AppCard elevated className="p-2 border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mb-5 shadow-xs">
                <CustomerServiceOutlined />
              </div>
              <h3 className="text-lg font-bold text-gray-900 m-0">
                Ticket Lifecycle Management
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed m-0">
                Track issues through structured states from Open to In Progress and Resolved with clear accountability.
              </p>
            </AppCard>

            <AppCard elevated className="p-2 border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mb-5 shadow-xs">
                <SafetyCertificateOutlined />
              </div>
              <h3 className="text-lg font-bold text-gray-900 m-0">
                Granular Security & Roles
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed m-0">
                Enforce principle of least privilege with strictly segregated roles for Administrators and Support Agents.
              </p>
            </AppCard>

            <AppCard elevated className="p-2 border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mb-5 shadow-xs">
                <TeamOutlined />
              </div>
              <h3 className="text-lg font-bold text-gray-900 m-0">
                Agent Workspaces
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed m-0">
                Equip your agents with focused queues, responsive layouts, and clean dashboards to maximize throughput.
              </p>
            </AppCard>
          </div>
        </div>
      </section>

      {/* Call to action section */}
      <section className="py-16 sm:py-20 bg-linear-to-br from-indigo-700 to-indigo-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight m-0">
            Ready to upgrade your support management?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-indigo-100 max-w-xl mx-auto m-0">
            Join SolviX as a Support Agent or log in with your administrative account today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ROUTES.REGISTER}>
              <AppButton
                type="default"
                size="large"
                className="h-11 px-6 font-semibold bg-white text-indigo-700 hover:bg-gray-50 border-white"
              >
                Create Agent Account
              </AppButton>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <AppButton
                type="default"
                size="large"
                className="h-11 px-6 font-semibold bg-transparent text-white border-white/60 hover:border-white hover:text-white"
              >
                Sign In to Workspace
              </AppButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
