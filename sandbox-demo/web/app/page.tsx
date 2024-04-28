"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function MainPage() {
  useEffect(() => {
    // 1: generate workflow id
    const workflowId = uuidv4().replace(/-/g, "");

    // 2: redirect page
    redirect(`/workflow/${workflowId}`);
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg font-semibold text-gray-600">
        Redirecting to workflow sandbox editor...
      </p>
    </div>
  );
}
