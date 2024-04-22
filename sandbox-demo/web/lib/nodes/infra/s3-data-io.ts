"use server";

export async function getS3PresignedUrl(
  workflowId: string,
  key: string,
  method: "getObject" | "putObject"
): Promise<string> {
  if (method === "getObject") {
    const result = await fetch(
      `${
        process.env.SANDBOX_API
      }/services/single_file_download?key=${encodeURIComponent(
        key
      )}&workflowId=${workflowId}`,
      {
        method: "GET",
        cache: "no-store", // This prevents the use of the cache
      }
    );
    const resultJson = await result.json();
    return resultJson.presignedUrl;
  } else if (method === "putObject") {
    const result = await fetch(
      `${
        process.env.SANDBOX_API
      }/services/single_file_upload?key=${encodeURIComponent(
        key
      )}&workflowId=${workflowId}`,
      {
        method: "GET",
        cache: "no-store", // This prevents the use of the cache
      }
    );
    const resultJson = await result.json();
    return resultJson.presignedUrl;
  }
  throw new Error("Unsupported method.");
}

export async function updateSingleUploadDataStatus(args: {
  workflowId: string;
  nodeId: string;
  nodeHandle: string;
}): Promise<string> {
  const result = await fetch(
    `${process.env.SANDBOX_API}/services/single_file_upload`,
    {
      method: "POST",
      body: JSON.stringify(args),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const { workflowSrc } = await result.json();
  return workflowSrc;
}
