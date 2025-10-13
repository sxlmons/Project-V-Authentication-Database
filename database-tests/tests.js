//config 
const DATABASE_URL = 'the secret url';
const API_KEY = 'the secret api key';
const TABLE = 'Test_Driver';  

//generate random test data
const testDriver = {
  account_id: crypto.randomUUID(),
  rating: 4,
  availiablity_status: 'Booked',
  license_number: Math.floor(10000 + Math.random() * 90000),
  current_location: null
};

let testsPassed = 0;
let totalTests = 0;

//INSERT row into test_driver table
async function insertTestDriver() {
  totalTests++;
  const res = await fetch(`${DATABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      'apikey': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(testDriver)
  });

  const data = await res.json();

  if (res.ok && data.length > 0) {
    console.log('INSERT - row added with account_id:', data[0].account_id);
    console.log( 'INSERT: test passed');
    testsPassed++;
    return data[0];
  } else {
    console.error('INSERT: insert failed:', data);
    return null;
  }
}

//GET test driver row with the account_id
async function getTestDriver(account_id) {
  totalTests++;
  const res = await fetch(`${DATABASE_URL}/rest/v1/${TABLE}?account_id=eq.${account_id}`, {
    headers: {
      'apikey': API_KEY,
      'Authorization': `Bearer ${API_KEY}`
    }
  });

  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    console.log('GET: got inserted driver:', data[0]);
    console.log('GET: test passed');
    testsPassed++;
    return data[0];
  } else {
    console.error('GET: get failed');
    return null;
  }
}

//DELETE the test driver using the account_id
async function deleteTestDriver(account_id) {
  totalTests++;
  const res = await fetch(`${DATABASE_URL}/rest/v1/${TABLE}?account_id=eq.${account_id}`, {
    method: 'DELETE',
    headers: {
      'apikey': API_KEY,
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  if (res.ok) {
    console.log('DELETE: test passed:');
    testsPassed++;
  } else {
    console.error('DELETE failed');
  }
}

//validation for account_id
function validateAccountId(driver) {
  totalTests++;
  if (typeof driver.account_id === 'string' && driver.account_id.length > 0) {
    console.log('ACCOUNT ID: test passed');
    testsPassed++;
  } else {
    console.error('test failed: account_id invalid');
  }
}

//validation for rating
function validateRating(driver) {
  totalTests++;
  if (typeof driver.rating === 'number') {
    console.log('RATING: test passed');
    testsPassed++;
  } else {
    console.error('test failed: rating invalid');
  }
}

//validation for availiablity_status
function validateAvailabilityStatus(driver) {
  totalTests++;
  if (typeof driver.availiablity_status === 'string' && driver.availiablity_status.length > 0) {
    console.log('AVALIABILITY_STATUS: test passed');
    testsPassed++;
  } else {
    console.error('test failed: availiablity_status invalid');
  }
}

//validation for license_number
function validateLicenseNumber(driver) {
  totalTests++;
  if (typeof driver.license_number === 'number') {
    console.log('LICENSE_NUMBER: test passed');
    testsPassed++;
  } else {
    console.error('test failed: license_number invalid');
  }
}

//validation for current_location
function validateCurrentLocation(driver) {
  totalTests++;
  if (driver.current_location === null || typeof driver.current_location === 'string') {
    console.log('CURRENT_LOCATION: test passed');
    testsPassed++;
  } else {
    console.error('test failed: current_location invalid');
  }
}

//run all tests
(async () => {
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
})();