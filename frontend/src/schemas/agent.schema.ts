import * as Yup from 'yup';

export interface CreateAgentFormData {
  name: string;
  email: string;
  password: string;
}

export interface EditAgentFormData {
  name: string;
}

/** Validation schema for creating a Support Agent. */
export const createAgentSchema: Yup.ObjectSchema<CreateAgentFormData> = Yup.object({
  name: Yup.string()
    .trim()
    .required('Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  email: Yup.string()
    .trim()
    .required('Email is required')
    .email('Invalid email address format'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long'),
});

/** Validation schema for editing a Support Agent's profile. */
export const editAgentSchema: Yup.ObjectSchema<EditAgentFormData> = Yup.object({
  name: Yup.string()
    .trim()
    .required('Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
});

/** Validation schema for self-profile update. */
export type UpdateProfileFormData = EditAgentFormData;
export const updateProfileSchema: Yup.ObjectSchema<UpdateProfileFormData> = editAgentSchema;
