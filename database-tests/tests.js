import dotenv from "dotenv";
import crypto from "node:crypto"; // only needed if crypto isn't global in your Node

dotenv.config();
// Load config from environment (NEVER hard-code real secrets in code)
const DATABASE_URL = process.env.SUPABASE_URL;
const API_KEY = process.env.SUPABASE_ANON_KEY;
const TABLE = "Test_Driver";

if (!DATABASE_URL || !API_KEY) {
  console.error(
    " Missing SUPABASE_URL or SUPABASE_ANON_KEY. Skipping DB tests."
  );
  process.exitCode = 0; // don't fail CI if env not set
  process.exit();
}

// generate random test data
const testDriver = {
  account_id: crypto.randomUUID(),
  rating: 4,
  availiablity_status: "Booked",
  license_number: Math.floor(10000 + Math.random() * 90000),
  current_location: null,
};

let testsPassed = 0;
let totalTests = 0;

async function insertTestDriver() {
  totalTests++;
  const res = await fetch(`${DATABASE_URL}/rest/v1/${TABLE}`, {
    method: "POST",
    headers: {
      apikey: API_KEY,
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(testDriver),
  });

  const data = await res.json();

  if (res.ok && data.length > 0) {
    console.log("INSERT: test passed – row added with account_id:", data[0].account_id);
    testsPassed++;
    return data[0];
  } else {
    console.error("INSERT: test failed:", data);
    return null;
  }
}

async function getTestDriver(account_id) {
  totalTests++;
  const res = await fetch(
    `${DATABASE_URL}/rest/v1/${TABLE}?account_id=eq.${account_id}`,
    {
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    console.log("GET: test passed – got inserted driver:", data[0]);
    testsPassed++;
    return data[0];
  } else {
    console.error("GET: test failed – no row returned");
    return null;
  }
}

async function deleteTestDriver(account_id) {
  totalTests++;
  const res = await fetch(
    `${DATABASE_URL}/rest/v1/${TABLE}?account_id=eq.${account_id}`,
    {
      method: "DELETE",
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );
  if (res.ok) {
    console.log("DELETE: test passed");
    testsPassed++;
  } else {
    console.error("DELETE: test failed – status:", res.status);
  }
}

function validateAccountId(driver) {
  totalTests++;
  if (typeof driver.account_id === "string" && driver.account_id.length > 0) {
    console.log("ACCOUNT_ID: test passed");
    testsPassed++;
  } else {
    console.error("ACCOUNT_ID: test failed – invalid value");
  }
}

function validateRating(driver) {
  totalTests++;
  if (typeof driver.rating === "number") {
    console.log("RATING: test passed");
    testsPassed++;
  } else {
    console.error("RATING: test failed – invalid value");
  }
}

function validateAvailabilityStatus(driver) {
  totalTests++;
  if (
    typeof driver.availiablity_status === "string" &&
    driver.availiablity_status.length > 0
  ) {
    console.log("AVAILIABILITY_STATUS: test passed");
    testsPassed++;
  } else {
    console.error("AVAILIABILITY_STATUS: test failed – invalid value");
  }
}

function validateLicenseNumber(driver) {
  totalTests++;
  if (typeof driver.license_number === "number") {
    console.log("LICENSE_NUMBER: test passed");
    testsPassed++;
  } else {
    console.error("LICENSE_NUMBER: test failed – invalid value");
  }
}

function validateCurrentLocation(driver) {
  totalTests++;
  if (
    driver.current_location === null ||
    typeof driver.current_location === "string"
  ) {
    console.log("CURRENT_LOCATION: test passed");
    testsPassed++;
  } else {
    console.error("CURRENT_LOCATION: test failed – invalid value");
  }
}

(async () => {
  try {
    const inserted = await insertTestDriver();
    if (inserted) {
      const driver = await getTestDriver(inserted.account_id);
      if (driver) {
        validateAccountId(driver);
        validateRating(driver);
        validateAvailabilityStatus(driver);
        validateLicenseNumber(driver);
        validateCurrentLocation(driver);
        await deleteTestDriver(inserted.account_id);
      }
    }

    console.log(`\nTests passed: ${testsPassed}/${totalTests}\n`);

    // make this behave like a real test: fail process if any test failed
    if (testsPassed !== totalTests) {
      process.exitCode = 1;
    } else {
      process.exitCode = 0;
    }
  } catch (err) {
    console.error("Unexpected error while running DB tests:", err);
    process.exitCode = 1;
  }
})();