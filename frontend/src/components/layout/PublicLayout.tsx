import React from "react";
import { Outlet, Link } from "react-router-dom";
import { PublicHeader } from "./PublicHeader";
import { AppLogo } from "../common/AppLogo";
import { ROUTES } from "../../constants/routes";

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <PublicHeader />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AppLogo size="small" />
            <span className="text-xs text-gray-400">
              — Support Ticket Management System
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link to={ROUTES.HOME} className="hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <Link to={ROUTES.ABOUT} className="hover:text-indigo-600 transition-colors">
              About Us
            </Link>
            <Link to={ROUTES.LOGIN} className="hover:text-indigo-600 transition-colors">
              Sign In
            </Link>
            <Link to={ROUTES.REGISTER} className="hover:text-indigo-600 transition-colors">
              Register
            </Link>
          </div>

          <p className="text-xs text-gray-400 m-0">
            &copy; {new Date().getFullYear()} SolviX Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
