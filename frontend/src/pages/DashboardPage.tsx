import React from "react";
import { Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageHeader, AppButton, AppCard } from "../components/common";

export const DashboardPage: React.FC = () => {
  const tickets = [
    { id: "#TCK-101", title: "Unable to reset password", status: "Open" },
    {
      id: "#TCK-102",
      title: "Payment page not loading",
      status: "In Progress",
    },
    { id: "#TCK-103", title: "Update profile information", status: "Resolved" },
  ];

  const getStatusTag = (status: string) => {
    switch (status) {
      case "Open":
        return <Tag color="blue">Open</Tag>;
      case "In Progress":
        return <Tag color="orange">In Progress</Tag>;
      case "Resolved":
        return <Tag color="green">Resolved</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  return (
    <div>
      <PageHeader
        title="Welcome to SolviX"
        subtitle="Your support workspace, all in one place."
        extra={
          <AppButton
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            className="h-11 px-5"
          >
            Create Ticket
          </AppButton>
        }
      />

      <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          { label: "Open Tickets", count: 12 },
          { label: "In Progress", count: 5 },
          { label: "Resolved", count: 28 },
        ].map((item) => (
          <AppCard key={item.label} elevated>
            <p className="text-sm font-medium text-gray-500 m-0">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-gray-900 m-0">
              {item.count}
            </p>
          </AppCard>
        ))}
      </section>

      <AppCard
        title={<span className="text-lg font-semibold">Recent Tickets</span>}
      >
        <div className="divide-y divide-gray-100">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-mono text-gray-400 m-0">
                  {ticket.id}
                </p>
                <p className="mt-1 font-medium text-gray-800 m-0">
                  {ticket.title}
                </p>
              </div>

              <div>{getStatusTag(ticket.status)}</div>
            </div>
          ))}
        </div>
      </AppCard>
    </div>
  );
};

export default DashboardPage;
