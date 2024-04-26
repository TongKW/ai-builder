"use server";

import Airtable from "airtable";

export async function airtableInsertUser(email: string, name: string = "") {
  const airtableBaseId = "appiRT7Ch39brWlYz";
  const airtableTableId = "tblyyrsjhTJu3qhhz";

  // TODO: finish the function:

  /*
  the airtable has 3 fields:

  1. Name (String)
  2. Email (String)
  3. Register Time (Date)

  */

  // Configure Airtable base
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_PERSONAL_TOKEN,
  }).base(airtableBaseId);

  try {
    // Create a record in the specified table
    const record = await base(airtableTableId).create({
      Name: name,
      Email: email,
      "Register Time": airtableFormatDate(),
    });

    console.log("Record created:", record.getId());
    return record;
  } catch (error) {
    console.error("Error creating record:", error);
    throw error;
  }
}

function airtableFormatDate(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // getUTCMonth returns 0-11
  const day = date.getUTCDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}
