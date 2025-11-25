const fs = require('fs');
const path = require('path');

// Simple YAML validator
function validateYAML(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    const errors = [];
    let prevIndent = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Skip empty lines and comments
      if (line.trim() === '' || line.trim().startsWith('#')) {
        continue;
      }

      // Check indentation (must be multiple of 2)
      const indent = line.match(/^(\s*)/)[1].length;
      if (indent % 2 !== 0) {
        errors.push(`Line ${lineNum}: Invalid indentation (${indent} spaces, must be multiple of 2)`);
      }

      // Check for tabs
      if (line.includes('\t')) {
        errors.push(`Line ${lineNum}: Contains tabs (should use spaces)`);
      }

      // Check for trailing spaces (except empty lines)
      if (line.length > 0 && line !== line.trimEnd()) {
        errors.push(`Line ${lineNum}: Has trailing whitespace`);
      }

      // Check basic YAML structure
      if (line.includes(':')) {
        const parts = line.split(':');
        if (parts[0].trim() === '') {
          errors.push(`Line ${lineNum}: Empty key before colon`);
        }
      }

      // Check for $ref format
      if (line.includes('$ref:')) {
        const refMatch = line.match(/\$ref:\s*['"]?([^'"]+)['"]?/);
        if (refMatch) {
          const ref = refMatch[1];
          // Check if it looks like a valid path
          if (!ref.includes('#/components/')) {
            errors.push(`Line ${lineNum}: Invalid $ref format: ${ref}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      lineCount: lines.length
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to read file: ${error.message}`],
      lineCount: 0
    };
  }
}

const baseDir = path.join(__dirname, 'openapi');

const filesToValidate = [
  'components/common.yaml',
  'components/parameters.yaml',
  'components/responses.yaml',
  'components/securitySchemes.yaml',
  'components/schemas/auth.yaml',
  'components/schemas/users.yaml',
  'components/schemas/gyms.yaml',
  'components/schemas/exercises.yaml',
  'components/schemas/routines.yaml',
  'paths/auth.yaml',
  'paths/users.yaml',
  'paths/gyms.yaml',
  'paths/exercises.yaml',
  'paths/routines.yaml'
];

console.log('\n=== VALIDATING YAML SYNTAX ===\n');

let allValid = true;
const results = [];

filesToValidate.forEach(file => {
  const filePath = path.join(baseDir, file);
  const result = validateYAML(filePath);

  results.push({
    file,
    ...result
  });

  if (result.valid) {
    console.log(`✓ ${file} (${result.lineCount} lines)`);
  } else {
    console.log(`✗ ${file}`);
    result.errors.forEach(err => console.log(`  - ${err}`));
    allValid = false;
  }
});

console.log('\n=== VALIDATION SUMMARY ===\n');

if (allValid) {
  console.log('✓ All files have valid YAML syntax!');
} else {
  console.log('✗ Some files have validation errors');
}

console.log(`\nTotal files validated: ${filesToValidate.length}`);
console.log(`Valid: ${results.filter(r => r.valid).length}`);
console.log(`Invalid: ${results.filter(r => !r.valid).length}`);

// Save validation report
fs.writeFileSync(
  path.join(__dirname, 'validation-report.json'),
  JSON.stringify(results, null, 2)
);

console.log('\nValidation report saved to: validation-report.json');
