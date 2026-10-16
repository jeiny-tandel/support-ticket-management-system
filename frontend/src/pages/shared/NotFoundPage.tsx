import React from "react";
import { Link } from "react-router-dom";
import { Result } from "antd";
import { Button } from "../../components/common";
import { ROUTES } from "../../constants/routes";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Link to={ROUTES.DASHBOARD}>
            <Button type="primary">Back to Dashboard</Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFoundPage;
