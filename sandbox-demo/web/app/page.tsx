import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default async function MainPage() {
  // 1: generate workflow id
  const workflowId = uuidv4().replace(/-/g, "");

  // 2: redirect page
  redirect(`/workflow/${workflowId}`);
}
