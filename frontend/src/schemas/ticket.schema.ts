import * as Yup from 'yup';
import type { CreateTicketPayload } from '../types';

export type CreateTicketFormData = CreateTicketPayload;

export const createTicketSchema: Yup.ObjectSchema<CreateTicketFormData> =
  Yup.object({
    title: Yup.string()
      .trim()
      .required('Title is required')
      .max(150, 'Title cannot exceed 150 characters'),
    description: Yup.string()
      .trim()
      .required('Description is required')
      .max(5000, 'Description cannot exceed 5000 characters'),
    priority: Yup.string<CreateTicketPayload['priority']>()
      .required('Priority is required')
      .oneOf(['LOW', 'MEDIUM', 'HIGH'], 'Priority must be LOW, MEDIUM, or HIGH'),
    dueDate: Yup.string()
      .nullable()
      .optional(),
  });

export default createTicketSchema;
