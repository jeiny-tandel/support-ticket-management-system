import React, { useState } from "react";
import { Form, Input, Tag, Alert, message, Tooltip } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useFormik } from "formik";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { selectCurrentUser, updateUser } from "../../store";
import { updateProfileApi } from "../../api";
import { updateProfileSchema, type UpdateProfileFormData } from "../../schemas";
import { Button, Card, PageHeader } from "../../components/common";
import { USER_ROLES } from "../../constants/roles";

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
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";
  const isDirty = formik.values.name.trim() !== initialName;

  return (
    <div className="pb-12 max-w-4xl mx-auto">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal SolviX identity, account credentials, and platform details."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-white border-gray-200/80 shadow-xs text-center p-6">
            <div className="relative inline-block mx-auto mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-linear-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-md mx-auto select-none">
                {initial}
              </div>
              <Tooltip title="Authenticated & Active">
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-xs">
                  <CheckCircleOutlined className="text-[11px]" />
                </span>
              </Tooltip>
            </div>

            <h2 className="text-lg font-bold text-gray-900 m-0 truncate">
              {user?.name || "User"}
            </h2>
            <p className="text-xs text-gray-500 m-0 mt-0.5 truncate select-all">
              {user?.email}
            </p>

            <div className="mt-3">
              <Tag
                color={isAdmin ? "purple" : "blue"}
                className="text-xs font-semibold px-3 py-0.5 rounded-full border m-0"
              >
                {isAdmin ? "Administrator" : "Support Agent"}
              </Tag>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100 text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <SafetyCertificateOutlined /> Permissions
                </span>
                <span className="text-gray-700 font-medium">
                  {isAdmin ? "Full Access" : "Queue Access"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card
            className="bg-white border-gray-200/80 shadow-xs"
            title={
              <div className="py-1">
                <span className="text-base font-bold text-gray-900 block leading-tight">
                  Profile Information
                </span>
                <span className="text-xs text-gray-500 font-normal">
                  Update your display name. Email address and system role are
                  protected.
                </span>
              </div>
            }
          >
            {submitError && (
              <Alert
                type="error"
                showIcon
                message={submitError}
                className="mb-5 text-xs rounded-lg"
                closable
                onClose={() => setSubmitError(null)}
              />
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-5">
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700 text-xs">
                    Display Name
                  </span>
                }
                layout="vertical"
                required
                validateStatus={
                  formik.touched.name && formik.errors.name ? "error" : ""
                }
                help={
                  formik.touched.name
                    ? formik.errors.name
                    : "Your public name shown on tickets and internal queues."
                }
                className="mb-4"
              >
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  prefix={<UserOutlined className="text-gray-400 text-sm" />}
                  maxLength={100}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={formik.isSubmitting}
                  className="h-10 rounded-lg text-sm"
                />
              </Form.Item>

              <Form.Item
                label={
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-gray-700 text-xs">
                      Email Address
                    </span>
                    <span className="text-[11px] text-gray-400 font-normal flex items-center gap-1">
                      <LockOutlined className="text-[10px]" /> Read-only
                    </span>
                  </div>
                }
                layout="vertical"
                help="Email address is permanent and used for SolviX authentication."
                className="mb-4"
              >
                <Input
                  value={user?.email || ""}
                  disabled
                  prefix={<MailOutlined className="text-gray-400 text-sm" />}
                  className="h-10 rounded-lg bg-gray-50/90 text-gray-500 cursor-not-allowed select-all"
                />
              </Form.Item>

              <Form.Item
                label={
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-gray-700 text-xs">
                      Platform Role
                    </span>
                    <span className="text-[11px] text-gray-400 font-normal flex items-center gap-1">
                      <LockOutlined className="text-[10px]" /> System-managed
                    </span>
                  </div>
                }
                layout="vertical"
                help="Role permissions are managed strictly by organization administrators."
                className="mb-6"
              >
                <div className="h-10 rounded-lg bg-gray-50/90 border border-gray-200/80 px-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">
                    {isAdmin
                      ? "Administrator (Full Access)"
                      : "Support Agent (Ticket Resolution)"}
                  </span>
                  <Tag
                    color={isAdmin ? "purple" : "blue"}
                    className="text-xs font-semibold m-0"
                  >
                    {user?.role}
                  </Tag>
                </div>
              </Form.Item>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="default"
                  onClick={handleReset}
                  disabled={formik.isSubmitting || !isDirty}
                  icon={<ReloadOutlined />}
                  className="h-10 px-4 text-xs font-medium"
                >
                  Reset
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={formik.isSubmitting}
                  disabled={formik.isSubmitting || !isDirty}
                  className="h-10 px-5 text-xs font-medium bg-purple-600 hover:bg-purple-700 border-purple-600"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
