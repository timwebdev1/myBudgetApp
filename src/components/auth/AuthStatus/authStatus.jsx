import React from "react";
import { useAuth } from "../../../context/AuthContext";

function AuthStatus() {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
      {user ? (
        <div className="space-y-2">
          <p className="text-green-600">Status: Logged In</p>
          <div className="bg-gray-50 p-4 rounded">
            <p>
              <span className="font-medium">Username:</span> {user.username}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium">User ID:</span> {user.userId}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-red-600">Status: Not Logged In</p>
      )}
    </div>
  );
}

export default AuthStatus;
