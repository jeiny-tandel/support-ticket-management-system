import * as Yup from 'yup';
import type { LoginCredentials } from '../types';

export type LoginFormData = LoginCredentials;

/** Validation schema for user authentication. */
export const loginSchema: Yup.ObjectSchema<LoginFormData> = Yup.object({
  email: Yup.string()
    .trim()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  password: Yup.string().required('Password is required'),
});

export default loginSchema;
