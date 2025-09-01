import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children, allowedRole }) => {
  const [isValid, setIsValid] = useState(null); 
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const validateToken = async () => {
      if (!token || role !== allowedRole) {
        setIsValid(false);
        return;
      }

      try {
        const endpoint =
          role === "admin"
            ? "http://localhost:3000/api/v1/admin/validate"
            : "http://localhost:3000/api/v1/user/validate";

        const res = await axios.get(endpoint, {
          headers: {
            Authorization: token,
          },
        });

        if (res.data.valid) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } catch (err) {
        console.error("Token validation failed", err);
        setIsValid(false);
      }
    };

    validateToken();
  }, [token, role, allowedRole]);

  if (isValid === null) {
    return <div>Loading...</div>;
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
