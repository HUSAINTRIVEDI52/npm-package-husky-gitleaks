const fs = require('fs-extra');
const path = require('path');
const { logInfo, logSuccess } = require('./logger');

exports.installDevDependency = async (pkg) => {
  const pkgPath = path.join(process.cwd(), 'package.json');
  
  if (!await fs.pathExists(pkgPath)) {
    logInfo(`No package.json found at ${process.cwd()}. Skipping devDependency: ${pkg}`);
    return;
  }

  const packageJson = await fs.readJSON(pkgPath);
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }

  if (!packageJson.devDependencies[pkg]) {
    packageJson.devDependencies[pkg] = 'latest'; // Or a specific version if needed
    await fs.writeJSON(pkgPath, packageJson, { spaces: 2 });
    logSuccess(`Added ${pkg} to devDependencies in package.json`);
    logInfo(`Note: Run 'npm install' later to refresh your lockfile.`);
  } else {
    logInfo(`${pkg} is already in devDependencies.`);
  }
};
