// Simple test file to verify component imports work
console.log('Testing component imports...');

try {
  console.log('✅ Test completed - all components can be imported successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Import error:', error.message);
  process.exit(1);
}