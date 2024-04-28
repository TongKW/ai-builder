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

  return <></>;
}
