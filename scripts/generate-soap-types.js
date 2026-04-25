const { execSync } = require('child_process');
const path = require('path');

/**
 * Generates TypeScript types from WSDL files using wsdl-tsclient.
 * Run: npm run generate:soap-types
 *
 * Output is written to src/types/generated/ — commit generated types to source control
 * so CI doesn't require WSDL access at test time.
 */
const wsdlFiles = [
  { input: 'src/services/wsdl/d365-policy.wsdl', output: 'src/types/generated/d365-policy' },
  { input: 'src/services/wsdl/d365-claim.wsdl', output: 'src/types/generated/d365-claim' },
  { input: 'src/services/wsdl/d365-billing.wsdl', output: 'src/types/generated/d365-billing' },
];

for (const { input, output } of wsdlFiles) {
  const inputPath = path.resolve(input);
  const outputPath = path.resolve(output);
  console.log(`Generating types from ${input} → ${output}`);
  try {
    execSync(`npx wsdl-tsclient ${inputPath} -o ${outputPath}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to generate types for ${input}:`, err.message);
    process.exit(1);
  }
}

console.log('SOAP type generation complete.');
