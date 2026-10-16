import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "antd";
import {
  MailOutlined,
  LockOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useFormik } from "formik";
import { loginSchema, type LoginFormData } from "../../schemas";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  login,
  clearError,
  selectAuthLoading,
  selectAuthError,
} from "../../store";
import { Logo, Input, Button } from "../../components/common";
import { ROUTES } from "../../constants/routes";

export const LoginPage: React.FC = () => {
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

  const formik = useFormik<LoginFormData>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      const resultAction = await dispatch(login(values));
      if (login.fulfilled.match(resultAction)) {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }
    },
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-indigo-50/40 to-slate-200 flex flex-col items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-5/12 bg-linear-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
          <div
            className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <Logo size="small" />
            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 mb-2.5">
                <SafetyCertificateOutlined /> Secure Enterprise Support
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white m-0">
                Welcome Back
              </h2>
              <p className="mt-2 text-xs text-indigo-100/80 leading-relaxed m-0">
                Sign in to monitor ticket queues, collaborate with support agents, and deliver rapid customer resolutions.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-indigo-700/50 relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-xs text-indigo-100">
              <CheckCircleFilled className="text-indigo-400 text-xs shrink-0" />
              <span>Real-time ticket updates and notifications</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-100">
              <CheckCircleFilled className="text-indigo-400 text-xs shrink-0" />
              <span>Role-based permissions & audit logging</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-100">
              <CheckCircleFilled className="text-indigo-400 text-xs shrink-0" />
              <span>99.9% uptime SLA for critical support</span>
            </div>
          </div>
        </div>

        <div className="md:w-7/12 p-6 sm:p-7 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight m-0">
                Sign In
              </h1>
              <p className="mt-0.5 text-xs text-gray-500 m-0">
                Enter your credentials to access your account.
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

          <form onSubmit={formik.handleSubmit} noValidate className="space-y-3">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="name@company.com"
              prefix={<MailOutlined className="text-gray-400" />}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email ? formik.errors.email : undefined}
              required
              autoComplete="email"
              disabled={authLoading || formik.isSubmitting}
            />

            <Input
              id="password"
              name="password"
              isPassword
              label="Password"
              placeholder="••••••••"
              prefix={<LockOutlined className="text-gray-400" />}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password ? formik.errors.password : undefined}
              required
              autoComplete="current-password"
              disabled={authLoading || formik.isSubmitting}
            />

            <div className="pt-1.5">
              <Button
                type="primary"
                htmlType="submit"
                fullWidth
                loading={authLoading || formik.isSubmitting}
                disabled={authLoading || formik.isSubmitting}
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 m-0">
              Need a support agent account?{" "}
              <Link
                to={ROUTES.REGISTER}
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Register as Support Agent
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
