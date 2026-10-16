import React, { useState } from 'react';
import { Form, Input, Alert, message, Tag } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EditOutlined,
  UserAddOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useFormik } from 'formik';
import {
  createAgentSchema,
  editAgentSchema,
  type CreateAgentFormData,
} from '../../../schemas';
import {
  createUserApi,
  updateUserApi,
  type BackendUserResponse,
} from '../../../api';
import { USER_ROLES } from '../../../constants/roles';
import { Button, Modal } from '../../../components/common';

export interface AgentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agent?: BackendUserResponse | null;
}

export const AgentFormModal: React.FC<AgentFormModalProps> = ({
  open,
  onClose,
  onSuccess,
  agent,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = Boolean(agent);

  const formik = useFormik<CreateAgentFormData>({
    enableReinitialize: true,
    initialValues: {
      name: agent?.name ?? '',
      email: agent?.email ?? '',
      password: '',
    },
    validationSchema: isEdit ? editAgentSchema : createAgentSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitError(null);
      try {
        if (isEdit && agent) {
          await updateUserApi(agent._id, {
            name: values.name.trim(),
          });
          message.success('Agent profile updated successfully');
        } else {
          await createUserApi({
            name: values.name.trim(),
            email: values.email.trim(),
            password: values.password,
            role: USER_ROLES.SUPPORT_AGENT,
          });
          message.success('Support agent created successfully');
        }

        resetForm();
        onClose();
        onSuccess();
      } catch (err: unknown) {
        const defaultMsg = isEdit
          ? 'Failed to update agent. Please try again.'
          : 'Failed to create support agent. Please check the inputs and try again.';
        const errorMsg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : defaultMsg;
        setSubmitError(errorMsg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleCancel = () => {
    formik.resetForm();
    setSubmitError(null);
    onClose();
  };

  return (
    <Modal
      title={isEdit ? 'Edit Support Agent' : 'Add Support Agent'}
      subtitle={
        isEdit
          ? 'Update the profile display name for this support agent account.'
          : 'Register a new support agent account with queue access.'
      }
      icon={
        <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-semibold text-base shadow-2xs">
          {isEdit ? <EditOutlined /> : <UserAddOutlined />}
        </div>
      }
      open={open}
      onCancel={handleCancel}
      maxWidth="md"
    >
      {submitError && (
        <Alert
          type="error"
          showIcon
          message={submitError}
          className="my-3 text-xs rounded-xl border border-rose-100 bg-rose-50/70"
          closable
          onClose={() => setSubmitError(null)}
        />
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4 pt-2">
        {isEdit && (
          <Form.Item
            label={
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-gray-700 text-xs">Email Address</span>
                <span className="text-[11px] text-gray-400 font-normal flex items-center gap-1">
                  <LockOutlined className="text-[10px]" /> Read-only
                </span>
              </div>
            }
            layout="vertical"
            className="mb-3"
          >
            <Input
              value={agent?.email || ''}
              disabled
              prefix={<MailOutlined className="text-gray-400 text-xs" />}
              className="h-10 rounded-lg bg-gray-50/80 text-gray-500 cursor-not-allowed text-sm"
            />
          </Form.Item>
        )}

        <Form.Item
          label={<span className="font-semibold text-gray-700 text-xs">Full Name</span>}
          layout="vertical"
          required
          validateStatus={formik.touched.name && formik.errors.name ? 'error' : ''}
          help={formik.touched.name ? formik.errors.name : undefined}
          className="mb-3"
        >
          <Input
            id="name"
            name="name"
            placeholder={isEdit ? 'Agent full name' : 'e.g. Sarah Connor'}
            prefix={<UserOutlined className="text-gray-400 text-xs" />}
            maxLength={100}
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={formik.isSubmitting}
            className="h-10 rounded-lg text-sm"
          />
        </Form.Item>

        {!isEdit && (
          <Form.Item
            label={<span className="font-semibold text-gray-700 text-xs">Email Address</span>}
            layout="vertical"
            required
            validateStatus={formik.touched.email && formik.errors.email ? 'error' : ''}
            help={formik.touched.email ? formik.errors.email : undefined}
            className="mb-3"
          >
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. sarah.connor@solvix.com"
              prefix={<MailOutlined className="text-gray-400 text-xs" />}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              className="h-10 rounded-lg text-sm"
            />
          </Form.Item>
        )}

        {!isEdit && (
          <Form.Item
            label={<span className="font-semibold text-gray-700 text-xs">Initial Password</span>}
            layout="vertical"
            required
            validateStatus={formik.touched.password && formik.errors.password ? 'error' : ''}
            help={
              formik.touched.password
                ? formik.errors.password
                : 'Must be at least 8 characters long.'
            }
            className="mb-4"
          >
            <Input.Password
              id="password"
              name="password"
              placeholder="Enter temporary password"
              prefix={<LockOutlined className="text-gray-400 text-xs" />}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              className="h-10 rounded-lg text-sm"
            />
          </Form.Item>
        )}

        <div className="bg-purple-50/50 border border-purple-100/80 rounded-xl p-3.5 text-xs text-gray-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SafetyCertificateOutlined className="text-purple-600 text-sm" />
            <span className="font-medium text-gray-700">
              {isEdit ? 'Assigned Role:' : 'Default Role:'}
            </span>
          </div>
          <Tag
            color="purple"
            className="m-0 font-semibold px-2.5 py-0.5 rounded-full border border-purple-200 bg-purple-100 text-purple-700 text-xs"
          >
            Support Agent
          </Tag>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
          <Button
            type="default"
            onClick={handleCancel}
            disabled={formik.isSubmitting}
            className="h-9 px-4 text-xs font-semibold rounded-lg text-gray-700 hover:text-gray-900 border-gray-200"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
            className="h-9 px-5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 border-purple-600 shadow-2xs"
          >
            {isEdit ? 'Save Changes' : 'Create Agent'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
