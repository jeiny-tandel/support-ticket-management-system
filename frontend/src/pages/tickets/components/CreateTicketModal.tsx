import React, { useState } from 'react';
import { Modal, Form, Input, Select, Alert, message } from 'antd';
import { useFormik } from 'formik';
import { createTicketSchema, type CreateTicketFormData } from '../../../schemas';
import { createTicketApi } from '../../../api';
import { TICKET_PRIORITIES, type TicketPriority } from '../../../types';
import { AppButton } from '../../../components/common';

const { TextArea } = Input;

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formik = useFormik<CreateTicketFormData>({
    initialValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
    },
    validationSchema: createTicketSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitError(null);
      try {
        await createTicketApi({
          title: values.title.trim(),
          description: values.description.trim(),
          priority: values.priority,
        });
        message.success('Ticket created successfully');
        resetForm();
        onClose();
        onSuccess();
      } catch (err: unknown) {
        const errorMsg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to create ticket. Please try again.';
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
      title={<span className="text-lg font-bold text-gray-900">Create New Ticket</span>}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      centered
      className="max-w-lg"
    >
      {submitError && (
        <Alert
          type="error"
          showIcon
          message={submitError}
          className="mb-4 text-xs"
          closable
          onClose={() => setSubmitError(null)}
        />
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4 pt-2">
        {/* Title */}
        <Form.Item
          label={<span className="font-medium text-gray-700">Ticket Title</span>}
          layout="vertical"
          required
          validateStatus={formik.touched.title && formik.errors.title ? 'error' : ''}
          help={formik.touched.title ? formik.errors.title : undefined}
          className="mb-3"
        >
          <Input
            id="title"
            name="title"
            placeholder="e.g. Payment gateway timeout on checkout"
            maxLength={150}
            showCount
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={formik.isSubmitting}
            className="h-10 rounded-lg"
          />
        </Form.Item>

        {/* Priority */}
        <Form.Item
          label={<span className="font-medium text-gray-700">Priority Level</span>}
          layout="vertical"
          required
          validateStatus={formik.touched.priority && formik.errors.priority ? 'error' : ''}
          help={formik.touched.priority ? formik.errors.priority : undefined}
          className="mb-3"
        >
          <Select<TicketPriority>
            id="priority"
            value={formik.values.priority}
            onChange={(val) => formik.setFieldValue('priority', val)}
            onBlur={() => formik.setFieldTouched('priority', true)}
            disabled={formik.isSubmitting}
            className="h-10 w-full"
            options={TICKET_PRIORITIES.map((p) => ({
              label: p,
              value: p,
            }))}
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label={<span className="font-medium text-gray-700">Detailed Description</span>}
          layout="vertical"
          required
          validateStatus={formik.touched.description && formik.errors.description ? 'error' : ''}
          help={formik.touched.description ? formik.errors.description : undefined}
          className="mb-4"
        >
          <TextArea
            id="description"
            name="description"
            placeholder="Describe the problem, steps to reproduce, or affected customer details..."
            rows={5}
            maxLength={5000}
            showCount
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={formik.isSubmitting}
            className="rounded-lg"
          />
        </Form.Item>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <AppButton
            type="default"
            onClick={handleCancel}
            disabled={formik.isSubmitting}
          >
            Cancel
          </AppButton>
          <AppButton
            type="primary"
            htmlType="submit"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            Create Ticket
          </AppButton>
        </div>
      </form>
    </Modal>
  );
};
