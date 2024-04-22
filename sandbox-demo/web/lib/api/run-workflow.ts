"use server";

export async function runWorkflow(workflowId: string) {
  try {
    const result = await fetch(`${process.env.SANDBOX_API}/handler`, {
      method: "POST",
      body: JSON.stringify({ workflowId }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const resultJson = await result.json();
    console.log(resultJson);
  } catch (error) {
    console.log(error);
  }
}
