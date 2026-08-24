import { handleCategoryApiError } from '../src/utils/categoryErrorHandler';

// Mock toast to capture output
let lastToastMessage = '';
(global as any).toast = {
  error: (msg: string) => {
    lastToastMessage = msg;
  },
};

console.log('--- TESTING CATEGORY API ERROR HANDLER ---');

const testCases = [
  {
    name: '400 Bad Request',
    error: { response: { status: 400, data: { message: 'Invalid payload' } } },
    expected: 'Please check the form data and try again.',
  },
  {
    name: '401 Unauthorized',
    error: { response: { status: 401, data: { message: 'Token expired' } } },
    expected: 'Your session has expired. Please login again.',
  },
  {
    name: '403 Forbidden',
    error: { response: { status: 403, data: { message: 'Forbidden' } } },
    expected: 'You do not have permission to perform this action.',
  },
  {
    name: '404 Not Found',
    error: { response: { status: 404, data: { message: 'Not found' } } },
    expected: 'Requested resource was not found.',
  },
  {
    name: '409 Slug Conflict',
    error: { response: { status: 409, data: { message: 'Category slug already exists' } } },
    expected: 'This category slug already exists. Please choose another slug.',
    checkSlugCallback: true,
  },
  {
    name: '422 Validation Error',
    error: { response: { status: 422, data: { message: ['steps.0.fields.3.fieldType is invalid', 'steps.1.fields.0.key is duplicate'] } } },
    expected: 'steps.0.fields.3.fieldType is invalid. steps.1.fields.0.key is duplicate',
  },
  {
    name: '500 Internal Server Error',
    error: { response: { status: 500, data: { message: 'Database connection failed' } } },
    expected: 'Something went wrong. Please try again later.',
  },
  {
    name: 'Network Error',
    error: { code: 'ERR_NETWORK', message: 'Network Error' },
    expected: 'Unable to connect to the server. Please check your internet connection.',
  },
];

let passedCount = 0;

for (const tc of testCases) {
  let slugCallbackFired = false;
  const result = handleCategoryApiError(tc.error, {
    onSlugConflict: () => {
      slugCallbackFired = true;
    },
  });

  const passedMessage = result === tc.expected;
  const passedSlugCheck = !tc.checkSlugCallback || slugCallbackFired;

  if (passedMessage && passedSlugCheck) {
    console.log(`✅ PASSED: [${tc.name}] -> "${result}"`);
    passedCount++;
  } else {
    console.error(`❌ FAILED: [${tc.name}]`);
    console.error(`   Expected: "${tc.expected}"`);
    console.error(`   Actual:   "${result}"`);
    console.error(`   Slug callback fired: ${slugCallbackFired}`);
  }
}

console.log(`\nResults: ${passedCount}/${testCases.length} tests passed!`);
if (passedCount !== testCases.length) {
  process.exit(1);
}
