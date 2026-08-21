#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Simple color helpers without external dependencies
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

const success = (text) => `${colors.green}✅ ${text}${colors.reset}`;
const error = (text) => `${colors.red}❌ ${text}${colors.reset}`;
const warning = (text) => `${colors.yellow}⚠️  ${text}${colors.reset}`;
const info = (text) => `${colors.blue}ℹ️  ${text}${colors.reset}`;
const progress = (text) => `${colors.cyan}🔄 ${text}${colors.reset}`;

const chalk = {
  green: (text) => `${colors.green}${text}${colors.reset}`,
  red: (text) => `${colors.red}${text}${colors.reset}`,
  yellow: (text) => `${colors.yellow}${text}${colors.reset}`,
  blue: (text) => `${colors.blue}${text}${colors.reset}`,
  cyan: (text) => `${colors.cyan}${text}${colors.reset}`,
  dim: (text) => `${colors.dim}${text}${colors.reset}`,
  gray: (text) => `${colors.dim}${text}${colors.reset}`,
  bold: (text) => `${colors.bold}${text}${colors.reset}`,
};

console.log(`${colors.bold}${colors.blue}\n🔍 Code Quality Check Started\n${colors.reset}`);

let hasErrors = false;

// Utility function to run commands
function runCommand(command, description, required = true) {
  return new Promise((resolve) => {
    console.log(progress(description));
    
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.log(error(`${description} failed`));
        if (stderr) console.log(chalk.red(stderr));
        if (stdout) console.log(chalk.red(stdout));
        if (required) hasErrors = true;
        resolve(false);
      } else {
        console.log(success(`${description} passed`));
        if (stdout && stdout.trim()) {
          console.log(chalk.gray(stdout.trim()));
        }
        resolve(true);
      }
    });
  });
}

// Check if file exists
function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    console.log(success(`${description} exists`));
    return true;
  } else {
    console.log(error(`${description} missing: ${filePath}`));
    hasErrors = true;
    return false;
  }
}

// Comprehensive code quality analysis
function analyzeCodeQuality() {
  console.log(info('Running comprehensive code quality analysis...'));
  
  const srcDir = path.join(__dirname, '..', 'src');
  let totalIssues = 0;
  const duplicateCode = new Map();
  const badVariableNames = [];
  const staleCode = [];
  const codeSmells = [];
  
  // Bad variable name patterns
  const badNamePatterns = [
    { pattern: /^(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)$/, message: 'Single letter variable' },
    { pattern: /^(temp|tmp|data|info|item|obj|val|value)\d*$/, message: 'Generic variable name' },
    { pattern: /^(foo|bar|baz|qux|test|example|dummy|placeholder)/, message: 'Placeholder variable name' },
    { pattern: /^(thing|stuff|something|anything)/, message: 'Vague variable name' },
    { pattern: /^(var|variable|param|parameter|arg|argument)\d*$/, message: 'Meta variable name' },
  ];
  
  // Stale code patterns
  const stalePatterns = [
    { pattern: /\/\*[\s\S]*?\*\//, message: 'Block comment (might be dead code)' },
    { pattern: /\/\/\s*(HACK|FIXME|BUG|BROKEN|DEPRECATED)/i, message: 'Code marked for attention' },
    { pattern: /^\s*\/\/\s*[A-Z][a-z].*$/gm, message: 'Commented out code' },
    { pattern: /if\s*\(\s*(false|0|null|undefined)\s*\)/, message: 'Dead conditional code' },
    { pattern: /console\.(log|debug|info|warn|error)/, message: 'Debug statements' },
  ];
  
  // Code smell patterns
  const codeSmellPatterns = [
    { pattern: /function\s+\w+\s*\([^)]*\)\s*\{[\s\S]{500,}?\}/, message: 'Large function (>500 chars)' },
    { pattern: /\{\s*[\s\S]{1000,}?\s*\}/, message: 'Large code block' },
    { pattern: /^\s*if\s*\([^)]+\)\s*\{[\s\S]*?\}\s*else\s*if\s*\([^)]+\)\s*\{[\s\S]*?\}\s*else\s*if/, message: 'Long if-else chain' },
    { pattern: /try\s*\{[\s\S]*?\}\s*catch\s*\([^)]*\)\s*\{\s*\}/, message: 'Empty catch block' },
    { pattern: /==\s*(null|undefined)|!=\s*(null|undefined)/, message: 'Loose equality with null/undefined' },
  ];
  
  // Function to normalize code for duplicate detection
  function normalizeCode(code) {
    return code
    
      .replace(/\/\/.*$/gm, '') // Remove single line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/['"]/g, '"') // Normalize quotes
      .trim();
  }
  
  // Function to check for bad variable names
  function checkVariableNames(content, filePath) {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      // Check for variable declarations
      const varMatches = line.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
      if (varMatches) {
        varMatches.forEach(match => {
          const varName = match.split(/\s+/)[1];
          badNamePatterns.forEach(({ pattern, message }) => {
            if (pattern.test(varName)) {
              badVariableNames.push({
                file: filePath,
                line: index + 1,
                variable: varName,
                issue: message
              });
            }
          });
        });
      }
      
      // Check for function parameters
      const funcMatches = line.match(/function\s+\w+\s*\(([^)]*)\)|(?:const|let)\s+\w+\s*=\s*\(([^)]*)\)\s*=>/);
      if (funcMatches) {
        const params = (funcMatches[1] || funcMatches[2] || '').split(',');
        params.forEach(param => {
          const cleanParam = param.trim().split(/[:\s=]/)[0];
          if (cleanParam) {
            badNamePatterns.forEach(({ pattern, message }) => {
              if (pattern.test(cleanParam)) {
                badVariableNames.push({
                  file: filePath,
                  line: index + 1,
                  variable: cleanParam,
                  issue: message + ' (parameter)'
                });
              }
            });
          }
        });
      }
    });
  }
  
  // Function to detect potential duplicate code
  function checkDuplicateCode(content, filePath) {
    const lines = content.split('\n');
    const codeBlocks = [];
    
    // Extract code blocks (functions, objects, etc.)
    let currentBlock = '';
    let braceCount = 0;
    let inBlock = false;
    
    lines.forEach((line, index) => {
      const normalizedLine = line.trim();
      if (!normalizedLine || normalizedLine.startsWith('//') || normalizedLine.startsWith('/*')) return;
      
      currentBlock += normalizedLine + '\n';
      
      // Count braces to detect blocks
      const openBraces = (normalizedLine.match(/\{/g) || []).length;
      const closeBraces = (normalizedLine.match(/\}/g) || []).length;
      braceCount += openBraces - closeBraces;
      
      if (openBraces > 0) inBlock = true;
      
      if (inBlock && braceCount === 0 && currentBlock.length > 100) {
        const normalized = normalizeCode(currentBlock);
        if (duplicateCode.has(normalized)) {
          duplicateCode.get(normalized).push({ file: filePath, startLine: index - currentBlock.split('\n').length + 2 });
        } else {
          duplicateCode.set(normalized, [{ file: filePath, startLine: index - currentBlock.split('\n').length + 2 }]);
        }
        currentBlock = '';
        inBlock = false;
      }
    });
  }
  
  // Function to check for stale code
  function checkStaleCode(content, filePath) {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      stalePatterns.forEach(({ pattern, message }) => {
        if (pattern.test(line)) {
          staleCode.push({
            file: filePath,
            line: index + 1,
            code: line.trim().substring(0, 60) + '...',
            issue: message
          });
        }
      });
    });
  }
  
  // Function to check for code smells
  function checkCodeSmells(content, filePath) {
    codeSmellPatterns.forEach(({ pattern, message }) => {
      const matches = content.match(pattern);
      if (matches) {
        codeSmells.push({
          file: filePath,
          count: matches.length,
          issue: message
        });
      }
    });
  }
  
  // Recursively scan files
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
        
        // Run all checks
        checkVariableNames(content, relativePath);
        checkDuplicateCode(content, relativePath);
        checkStaleCode(content, relativePath);
        checkCodeSmells(content, relativePath);
        
        // Original checks
        const consoleLogMatches = content.match(/console\.(log|debug|info|warn|error)/g);
        if (consoleLogMatches && consoleLogMatches.length > 0) {
          console.log(warning(`Found ${consoleLogMatches.length} console statements in ${relativePath}`));
          totalIssues++;
        }
        
        const todoMatches = content.match(/\/\/\s*(TODO|FIXME|HACK|BUG)/gi);
        if (todoMatches) {
          console.log(info(`Found ${todoMatches.length} TODO/FIXME comments in ${relativePath}`));
        }
        
        const anyTypeMatches = content.match(/:\s*any\b/g);
        if (anyTypeMatches && anyTypeMatches.length > 2) {
          console.log(warning(`Found ${anyTypeMatches.length} 'any' types in ${relativePath}`));
          totalIssues++;
        }
        
        // Check file size
        const sizeKB = (content.length / 1024).toFixed(1);
        if (content.length > 10000) {
          console.log(warning(`Large file: ${relativePath} (${sizeKB}KB) - consider splitting`));
          totalIssues++;
        }
        
        // Check line length
        const longLines = content.split('\n').filter(line => line.length > 120);
        if (longLines.length > 5) {
          console.log(warning(`Found ${longLines.length} long lines in ${relativePath} (>120 chars)`));
        }
      }
    });
  }
  
  try {
    scanDirectory(srcDir);
    
    // Report findings
    console.log(chalk.bold('\n📊 Code Quality Report'));
    console.log('─'.repeat(50));
    
    // Bad variable names
    if (badVariableNames.length > 0) {
      console.log(warning(`Found ${badVariableNames.length} bad variable names:`));
      badVariableNames.slice(0, 10).forEach(item => {
        console.log(`  ${chalk.dim(item.file)}:${item.line} - '${chalk.red(item.variable)}' (${item.issue})`);
      });
      if (badVariableNames.length > 10) {
        console.log(`  ... and ${badVariableNames.length - 10} more`);
      }
      totalIssues += badVariableNames.length;
    }
    
    // Duplicate code
    const duplicates = Array.from(duplicateCode.entries()).filter(([_, locations]) => locations.length > 1);
    if (duplicates.length > 0) {
      console.log(warning(`Found ${duplicates.length} potential code duplicates:`));
      duplicates.slice(0, 5).forEach(([code, locations]) => {
        console.log(`  Duplicate found in ${locations.length} files:`);
        locations.forEach(loc => {
          console.log(`    ${chalk.dim(loc.file)}:${loc.startLine}`);
        });
      });
      totalIssues += duplicates.length;
    }
    
    // Stale code
    if (staleCode.length > 0) {
      console.log(warning(`Found ${staleCode.length} potential stale code issues:`));
      staleCode.slice(0, 10).forEach(item => {
        console.log(`  ${chalk.dim(item.file)}:${item.line} - ${item.issue}`);
      });
      totalIssues += staleCode.length;
    }
    
    // Code smells
    if (codeSmells.length > 0) {
      console.log(warning(`Found ${codeSmells.length} code smell issues:`));
      codeSmells.forEach(item => {
        console.log(`  ${chalk.dim(item.file)} - ${item.issue} (${item.count} instances)`);
      });
      totalIssues += codeSmells.length;
    }
    
    if (totalIssues === 0) {
      console.log(success('Comprehensive code quality analysis passed'));
    } else {
      console.log(warning(`Code quality analysis found ${totalIssues} issues to review`));
      if (totalIssues > 20) {
        hasErrors = true;
      }
    }
  } catch (err) {
    console.log(error('Code quality analysis failed: ' + err.message));
    hasErrors = true;
  }
}

// Check dependencies for security issues
function checkDependencySecurity() {
  console.log(info('Checking dependency security...'));
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log(error('package.json not found'));
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  console.log(info(`Checking ${Object.keys(dependencies).length} dependencies...`));
  
  // Basic checks for known problematic patterns
  const problematicPackages = [];
  
  Object.keys(dependencies).forEach(dep => {
    // Check for very old React versions
    if (dep === 'react' && dependencies[dep].startsWith('^16.')) {
      problematicPackages.push(`${dep}: Consider upgrading from React 16`);
    }
    
    // Check for packages with security issues (basic list)
    const knownIssues = ['lodash', 'moment', 'request'];
    if (knownIssues.includes(dep.split('/').pop())) {
      console.log(warning(`Consider alternatives to ${dep} for better security/performance`));
    }
  });
  
  if (problematicPackages.length === 0) {
    console.log(success('Dependency security check passed'));
  } else {
    problematicPackages.forEach(issue => console.log(warning(issue)));
  }
}

// Main execution
async function main() {
  const startTime = Date.now();
  
  console.log(chalk.bold('📋 Checking project structure...'));
  
  // Check essential files exist
  checkFileExists('package.json', 'Package.json');
  checkFileExists('tsconfig.json', 'TypeScript config');
  checkFileExists('vite.config.ts', 'Vite config');
  checkFileExists('tailwind.config.js', 'Tailwind config');
  checkFileExists('src/main.tsx', 'Main entry point');
  
  console.log(chalk.bold('\n🔧 Running code quality checks...'));
  
  // Run TypeScript check
  await runCommand('npx tsc --noEmit', 'TypeScript compilation check', true);
  
  // Run ESLint if available
  if (fs.existsSync(path.join(__dirname, '..', '.eslintrc.js')) || 
      fs.existsSync(path.join(__dirname, '..', '.eslintrc.json')) ||
      fs.existsSync(path.join(__dirname, '..', 'eslint.config.js'))) {
    await runCommand('npx eslint src/ --ext .ts,.tsx --max-warnings 10', 'ESLint check', false);
  } else {
    console.log(info('ESLint config not found, skipping lint check'));
  }
  
  // Run Prettier check if available
  if (fs.existsSync(path.join(__dirname, '..', '.prettierrc')) ||
      fs.existsSync(path.join(__dirname, '..', '.prettierrc.json')) ||
      fs.existsSync(path.join(__dirname, '..', 'prettier.config.js'))) {
    await runCommand('npx prettier --check src/', 'Prettier format check', false);
  } else {
    console.log(info('Prettier config not found, skipping format check'));
  }
  
  // Build check
  await runCommand('npm run build', 'Production build check', true);
  
  console.log(chalk.bold('\n📊 Analyzing code quality...'));
  analyzeCodeQuality();
  
  console.log(chalk.bold('\n🔒 Security checks...'));
  checkDependencySecurity();
  
  // NPM audit
  await runCommand('npm audit --audit-level=high', 'NPM security audit', false);
  
  // Bundle size check (if dist exists)
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    console.log(info('Checking bundle sizes...'));
    try {
      const files = fs.readdirSync(distPath, { recursive: true });
      let totalSize = 0;
      let jsSize = 0;
      let cssSize = 0;
      
      files.forEach(file => {
        if (typeof file === 'string') {
          const filePath = path.join(distPath, file);
          if (fs.statSync(filePath).isFile()) {
            const size = fs.statSync(filePath).size;
            totalSize += size;
            
            if (file.endsWith('.js')) jsSize += size;
            if (file.endsWith('.css')) cssSize += size;
          }
        }
      });
      
      const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      };
      
      console.log(info(`Total bundle size: ${formatSize(totalSize)}`));
      console.log(info(`JavaScript size: ${formatSize(jsSize)}`));
      console.log(info(`CSS size: ${formatSize(cssSize)}`));
      
      if (jsSize > 1024 * 1024) { // > 1MB
        console.log(warning('JavaScript bundle is quite large, consider code splitting'));
      } else {
        console.log(success('Bundle size is reasonable'));
      }
    } catch (err) {
      console.log(error('Bundle size check failed: ' + err.message));
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(chalk.bold('\n📈 Quality Check Summary'));
  console.log('─'.repeat(50));
  
  if (hasErrors) {
    console.log(error(`Quality check completed with errors in ${duration}s`));
    console.log(chalk.red('❌ Some critical issues need to be addressed before deployment.'));
    process.exit(1);
  } else {
    console.log(success(`Quality check passed in ${duration}s`));
    console.log(chalk.green('🎉 Your code is ready for development/deployment!'));
    process.exit(0);
  }
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️  Quality check interrupted by user'));
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log(error('Unexpected error: ' + err.message));
  process.exit(1);
});

main().catch(err => {
  console.log(error('Quality check failed: ' + err.message));
  process.exit(1);
});