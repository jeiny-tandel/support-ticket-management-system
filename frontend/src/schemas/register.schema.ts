import * as Yup from 'yup';
import type { RegisterAgentCredentials } from '../types';

export interface RegisterFormData extends RegisterAgentCredentials {
  confirmPassword: string;
}

/**
 * Validation schema for Support Agent self-registration.
 * Aligns with backend RegisterDto validation constraints (6 char min password).
 * Includes client-side confirmPassword matching validation.
 */
export const registerSchema: Yup.ObjectSchema<RegisterFormData> = Yup.object({
  name: Yup.string().trim().required('Name is required'),
  email: Yup.string()
    .trim()
    .required('Email is required')
    .email('Invalid email address format'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters long'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

export default registerSchema;
