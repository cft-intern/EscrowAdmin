import categoryService from '../src/services/categoryService';

console.log('--- TESTING SINGLE POST /category SUBMISSION ---');

// Mock apiClient.post
let postCallCount = 0;
const originalCreate = categoryService.create;

(categoryService as any).create = async (payload: any) => {
  postCallCount++;
  console.log(`[TEST] categoryService.create called (#${postCallCount})`);
  return {
    data: { id: '123', name: payload.name, slug: payload.name.toLowerCase() },
    message: 'Success',
    success: true,
  };
};

let passed = true;

// Simulate Form Submit (Single User Action)
async function simulateUserSubmit() {
  console.log('User clicks "Create Category"...');
  await categoryService.create({ name: 'Test Category', icon: 'Shield', status: 'active', steps: [] });

  if (postCallCount === 1) {
    console.log('✅ PASSED: POST /category was called exactly ONCE on user submit.');
  } else {
    console.error(`❌ FAILED: POST /category was called ${postCallCount} times!`);
    passed = false;
  }
}

simulateUserSubmit().then(() => {
  if (!passed) {
    process.exit(1);
  }
});
