import React, { useState } from 'react';
import { Form, Input, Select, DatePicker, Alert, message } from 'antd';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useAppDispatch } from '../../../hooks';
import { createTicket, updateTicket, fetchTicketSummary } from '../../../store';
import { createTicketSchema, type CreateTicketFormData } from '../../../schemas';
import { TICKET_PRIORITIES, type Ticket, type TicketPriority } from '../../../types';
import { Button, Modal } from '../../../components/common';

const { TextArea } = Input;

export interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ticket?: Ticket | null;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  open,
  onClose,
  onSuccess,
  ticket,
}) => {
  const dispatch = useAppDispatch();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = Boolean(ticket);

  const formik = useFormik<CreateTicketFormData>({
    enableReinitialize: true,
    initialValues: {
      title: ticket?.title ?? '',
      description: ticket?.description ?? '',
      priority: ticket?.priority ?? 'MEDIUM',
      dueDate: ticket?.dueDate ?? null,
    },
    validationSchema: createTicketSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitError(null);
      let resultAction;
      const trimmedTitle = values.title.trim();
      const trimmedDescription = values.description.trim();
      const payloadDueDate = values.dueDate
        ? new Date(values.dueDate).toISOString()
        : null;

      if (isEdit && ticket) {
        resultAction = await dispatch(
          updateTicket({
            ticketId: ticket._id,
            payload: {
              title: trimmedTitle,
              description: trimmedDescription,
              priority: values.priority,
              dueDate: payloadDueDate,
            },
          }),
        );
      } else {
        resultAction = await dispatch(
          createTicket({
            title: trimmedTitle,
            description: trimmedDescription,
            priority: values.priority,
            dueDate: payloadDueDate,
          }),
        );
      }

      setSubmitting(false);

      if (
        (isEdit && updateTicket.fulfilled.match(resultAction)) ||
        (!isEdit && createTicket.fulfilled.match(resultAction))
      ) {
        message.success(
          isEdit
            ? 'Ticket updated successfully'
            : 'Ticket created successfully',
        );
        dispatch(fetchTicketSummary());
        resetForm();
        onClose();
        onSuccess();
      } else {
        const defaultMsg = isEdit
          ? 'Failed to update ticket. Please try again.'
          : 'Failed to create ticket. Please try again.';
        const errorMsg =
          typeof resultAction?.payload === 'string'
            ? resultAction.payload
            : defaultMsg;
        setSubmitError(errorMsg);
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
      title={isEdit ? 'Edit Ticket' : 'Create New Ticket'}
      open={open}
      onCancel={handleCancel}
      maxWidth="lg"
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

        <Form.Item
          label={
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-gray-700">Due Date (Optional)</span>
              <span className="text-xs text-gray-400 font-normal">
                Target resolution deadline
              </span>
            </div>
          }
          layout="vertical"
          validateStatus={
            formik.touched.dueDate && formik.errors.dueDate ? 'error' : ''
          }
          help={formik.touched.dueDate ? formik.errors.dueDate : undefined}
          className="mb-3"
        >
          <DatePicker
            id="dueDate"
            value={formik.values.dueDate ? dayjs(formik.values.dueDate) : null}
            onChange={(date) => {
              formik.setFieldValue(
                'dueDate',
                date ? date.endOf('day').toISOString() : null,
              );
            }}
            onBlur={() => formik.setFieldTouched('dueDate', true)}
            disabled={formik.isSubmitting}
            disabledDate={(current) =>
              !isEdit &&
              Boolean(current && current.endOf('day').isBefore(dayjs().startOf('day')))
            }
            placeholder="Select target resolution deadline"
            className="h-10 w-full rounded-lg"
            format="YYYY-MM-DD"
            allowClear
          />
        </Form.Item>

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

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button
            type="default"
            onClick={handleCancel}
            disabled={formik.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            {isEdit ? 'Save Changes' : 'Create Ticket'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
