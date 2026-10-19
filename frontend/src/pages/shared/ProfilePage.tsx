import React, { useState } from "react";
import { Form, Input, Tag, Alert, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  CrownOutlined,
  CalendarOutlined,
  CheckOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useFormik } from "formik";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { selectCurrentUser, updateUser } from "../../store";
import { updateProfileApi } from "../../api";
import { updateProfileSchema, type UpdateProfileFormData } from "../../schemas";
import { Button, Card, PageHeader } from "../../components/common";
import { USER_ROLES } from "../../constants/roles";
import { getAvatarInitial } from "../../utils";

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initialName = user?.name || "";

  const formik = useFormik<UpdateProfileFormData>({
    enableReinitialize: true,
    initialValues: {
      name: initialName,
    },
    validationSchema: updateProfileSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitError(null);
      const trimmedName = values.name.trim();

      if (trimmedName === initialName) {
        message.info("No changes were made to your profile name.");
        setSubmitting(false);
        return;
      }

      try {
        const updated = await updateProfileApi({ name: trimmedName });

        dispatch(updateUser(updated));

        message.success("Profile updated successfully");
        resetForm({ values: { name: updated.name } });
      } catch (err: unknown) {
        const errorMsg =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to update profile. Please try again.";
        setSubmitError(errorMsg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleReset = () => {
    formik.resetForm();
    setSubmitError(null);
  };

  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const initial = getAvatarInitial(user?.name);
  const isDirty = formik.values.name.trim() !== initialName;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-3">
            <span>My Profile</span>
            {isAdmin ? (
              <Tag
                color="purple"
                className="m-0 font-medium px-2.5 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-xs"
              >
                Administrator
              </Tag>
            ) : (
              <Tag
                color="blue"
                className="m-0 font-medium px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs"
              >
                Support Agent
              </Tag>
            )}
          </div>
        }
        subtitle="Manage your personal SolviX identity, credentials, and platform details."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Summary Card */}
        <div className="lg:col-span-1">
          <Card
            elevated
            className="bg-white border-gray-200/80 shadow-xs hover:shadow-md transition-all rounded-2xl flex flex-col justify-between overflow-hidden"
            styles={{ body: { padding: 0 } }}
          >
            <div
              className={`h-1.5 bg-linear-to-r ${
                isAdmin
                  ? "from-purple-500 via-indigo-500 to-purple-600"
                  : "from-blue-500 via-indigo-500 to-blue-600"
              }`}
            />

            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 p-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-sm shrink-0">
                <UserOutlined />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-gray-900 m-0 leading-tight">
                  Account Identity
                </h3>
                <span className="text-[11px] text-gray-400 font-normal block leading-tight mt-0.5">
                  Workspace credentials overview
                </span>
              </div>
            </div>

            <div className="p-5 pt-3 space-y-4">
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white font-bold text-2xl flex items-center justify-center shadow-md mx-auto select-none ring-4 ring-indigo-50">
                  {initial}
                </div>
                <h4 className="text-base font-bold text-gray-900 mt-3 m-0 truncate">
                  {user?.name || "User"}
                </h4>
                <p className="text-xs text-gray-500 m-0 mt-0.5 truncate select-all">
                  {user?.email}
                </p>
                <div className="mt-2.5 flex justify-center">
                  <Tag
                    color={isAdmin ? "purple" : "blue"}
                    className="text-xs font-semibold px-3 py-0.5 rounded-full border m-0"
                  >
                    {isAdmin ? "Administrator" : "Support Agent"}
                  </Tag>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2.5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <SafetyCertificateOutlined className="text-indigo-600" />
                  Permissions & Scope
                </div>

                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-gray-50/80 border border-gray-150">
                  <span className="text-gray-500 font-medium">Role Tier</span>
                  <span className="text-gray-900 font-semibold">
                    {isAdmin ? "Administrator" : "Support Agent"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-gray-50/80 border border-gray-150">
                  <span className="text-gray-500 font-medium">Queue Access</span>
                  <span className="text-gray-900 font-semibold">
                    {isAdmin ? "Full Access" : "Queue Access"}
                  </span>
                </div>

                {memberSince && (
                  <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-gray-50/80 border border-gray-150">
                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                      <CalendarOutlined className="text-gray-400 text-xs" />
                      Joined
                    </span>
                    <span className="text-gray-700 font-medium">{memberSince}</span>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-indigo-50/70 border border-indigo-100/90 p-3 text-xs flex items-start gap-2.5">
                <LockOutlined className="text-indigo-600 text-sm mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-indigo-950 m-0">
                    Protected Credentials
                  </p>
                  <p className="text-[11px] text-indigo-900/70 m-0 mt-0.5 leading-relaxed">
                    Authentication and permissions are managed by SolviX IAM.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Profile Information Card */}
        <div className="lg:col-span-2">
          <Card
            elevated
            className="bg-white border-gray-200/80 shadow-xs hover:shadow-md transition-all rounded-2xl flex flex-col justify-between overflow-hidden"
            styles={{ body: { padding: 0 } }}
          >
            <div className="h-1.5 bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-600" />

            <div className="flex items-center justify-between pb-3 border-b border-gray-100 p-5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100/80 text-purple-600 flex items-center justify-center text-sm shrink-0">
                  <EditOutlined />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 m-0 leading-tight">
                    Profile Information
                  </h3>
                  <span className="text-[11px] text-gray-400 font-normal block leading-tight mt-0.5">
                    Update your display name. Email address and system role are protected.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 pt-4">
              {submitError && (
                <Alert
                  type="error"
                  showIcon
                  message={submitError}
                  className="mb-5 text-xs rounded-xl border border-red-200"
                  closable
                  onClose={() => setSubmitError(null)}
                />
              )}

              <form onSubmit={formik.handleSubmit} className="space-y-5">
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700 text-xs flex items-center gap-1">
                      Display Name <span className="text-rose-500 font-bold">*</span>
                    </span>
                  }
                  layout="vertical"
                  validateStatus={
                    formik.touched.name && formik.errors.name ? "error" : ""
                  }
                  help={
                    formik.touched.name && formik.errors.name ? (
                      <span className="text-rose-600 text-xs">
                        {formik.errors.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px]">
                        Your public name shown on tickets, comments, and internal queues.
                      </span>
                    )
                  }
                  className="mb-4"
                >
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    prefix={<UserOutlined className="text-indigo-500 text-sm" />}
                    maxLength={100}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={formik.isSubmitting}
                    className="h-10 rounded-lg text-sm border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-gray-700 text-xs">
                        Email Address
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <LockOutlined className="text-[10px]" /> Read-only
                      </span>
                    </div>
                  }
                  layout="vertical"
                  help={
                    <span className="text-gray-400 text-[11px]">
                      Email address is permanent and used for SolviX authentication.
                    </span>
                  }
                  className="mb-4"
                >
                  <Input
                    value={user?.email || ""}
                    disabled
                    prefix={<MailOutlined className="text-gray-400 text-sm" />}
                    className="h-10 rounded-lg bg-gray-50/90 text-gray-600 border border-gray-200/80 cursor-not-allowed select-all"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-gray-700 text-xs">
                        Platform Role
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <LockOutlined className="text-[10px]" /> System-managed
                      </span>
                    </div>
                  }
                  layout="vertical"
                  help={
                    <span className="text-gray-400 text-[11px]">
                      Role permissions are managed strictly by organization administrators.
                    </span>
                  }
                  className="mb-6"
                >
                  <div className="h-11 rounded-lg bg-gray-50/90 border border-gray-200/80 px-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 ${
                          isAdmin
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {isAdmin ? (
                          <CrownOutlined className="text-xs" />
                        ) : (
                          <SafetyCertificateOutlined className="text-xs" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-gray-700 truncate">
                        {isAdmin
                          ? "Administrator (Full Access)"
                          : "Support Agent (Ticket Resolution)"}
                      </span>
                    </div>
                    <Tag
                      color={isAdmin ? "purple" : "blue"}
                      className="text-xs font-semibold m-0 shrink-0"
                    >
                      {user?.role}
                    </Tag>
                  </div>
                </Form.Item>

                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  <div>
                    {isDirty ? (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        Unsaved changes pending
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-normal">
                        <CheckCircleOutlined className="text-emerald-500 text-xs" />
                        Profile information is up to date
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <Button
                      type="default"
                      onClick={handleReset}
                      disabled={formik.isSubmitting || !isDirty}
                      icon={<ReloadOutlined />}
                      className="h-10 px-4 text-xs font-medium border-gray-200 hover:border-gray-300 text-gray-700 w-full sm:w-auto"
                    >
                      Reset
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={formik.isSubmitting}
                      disabled={formik.isSubmitting || !isDirty}
                      icon={<CheckOutlined />}
                      className="h-10 px-5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 border-purple-600 text-white shadow-sm shadow-purple-200 w-full sm:w-auto"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

