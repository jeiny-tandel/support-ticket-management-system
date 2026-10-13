import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  CheckCircleFilled,
  CustomerServiceOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useFormik } from "formik";
import { registerSchema, type RegisterFormData } from "../schemas";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  registerAgent,
  clearError,
  selectAuthLoading,
  selectAuthError,
} from "../store";
import { AppLogo, AppInput, AppButton } from "../components/common";
import { ROUTES } from "../constants/routes";

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);

  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const formik = useFormik<RegisterFormData>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      const resultAction = await dispatch(registerAgent(values));
      if (registerAgent.fulfilled.match(resultAction)) {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }
    },
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-indigo-50/40 to-slate-200 flex flex-col items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Branded Welcome Panel (Compact) */}
        <div className="md:w-5/12 bg-linear-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative glow elements */}
          <div
            className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <AppLogo size="small" />
            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 mb-2.5">
                <CustomerServiceOutlined /> Join Support Team
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white m-0">
                Empower Support
              </h2>
              <p className="mt-2 text-xs text-indigo-100/80 leading-relaxed m-0">
                Create your Support Agent account to manage ticket queues and collaborate on fast issue resolution.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-indigo-700/50 relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-xs text-indigo-100">
              <CheckCircleFilled className="text-indigo-400 text-xs shrink-0" />
              <span>Assigned ticket queues with SLA tracking</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-100">
              <CheckCircleFilled className="text-indigo-400 text-xs shrink-0" />
              <span>Direct customer communication threads</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-100">
              <CheckCircleFilled className="text-indigo-400 text-xs shrink-0" />
              <span>Real-time resolution metrics</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Panel (Compact) */}
        <div className="md:w-7/12 p-6 sm:p-7 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight m-0">
                Create Agent Account
              </h1>
              <p className="mt-0.5 text-xs text-gray-500 m-0">
                Register as a Support Agent to manage tickets.
              </p>
            </div>
            <Link
              to={ROUTES.HOME}
              className="text-xs text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <ArrowLeftOutlined /> Home
            </Link>
          </div>

          {authError && (
            <Alert
              type="error"
              showIcon
              message={authError}
              closable
              onClose={() => dispatch(clearError())}
              className="mb-3 text-xs"
            />
          )}

          <form onSubmit={formik.handleSubmit} noValidate className="space-y-2.5">
            <AppInput
              id="name"
              name="name"
              label="Full Name"
              placeholder="Jane Doe"
              prefix={<UserOutlined className="text-gray-400" />}
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name ? formik.errors.name : undefined}
              required
              autoComplete="name"
              disabled={authLoading || formik.isSubmitting}
            />

            <AppInput
              id="email"
              name="email"
              type="email"
              label="Work Email"
              placeholder="jane@company.com"
              prefix={<MailOutlined className="text-gray-400" />}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email ? formik.errors.email : undefined}
              required
              autoComplete="email"
              disabled={authLoading || formik.isSubmitting}
            />

            <AppInput
              id="password"
              name="password"
              isPassword
              label="Password"
              placeholder="Minimum 6 characters"
              prefix={<LockOutlined className="text-gray-400" />}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password ? formik.errors.password : undefined}
              required
              autoComplete="new-password"
              disabled={authLoading || formik.isSubmitting}
            />

            <AppInput
              id="confirmPassword"
              name="confirmPassword"
              isPassword
              label="Confirm Password"
              placeholder="Re-enter password"
              prefix={<LockOutlined className="text-gray-400" />}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.confirmPassword
                  ? formik.errors.confirmPassword
                  : undefined
              }
              required
              autoComplete="new-password"
              disabled={authLoading || formik.isSubmitting}
            />

            <div className="pt-1.5">
              <AppButton
                type="primary"
                htmlType="submit"
                fullWidth
                loading={authLoading || formik.isSubmitting}
                disabled={authLoading || formik.isSubmitting}
              >
                Register as Support Agent
              </AppButton>
            </div>
          </form>

          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 m-0">
              Already have an account?{" "}
              <Link
                to={ROUTES.LOGIN}
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
