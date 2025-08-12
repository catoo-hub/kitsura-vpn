/**
 * Script to sign release files with minisign
 * This script will find and sign all release artifacts with minisign
 */

import fs from "fs/promises";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

/**
 * Sign a file with minisign
 * @param {string} filePath - Path to the file to sign
 * @param {string} secretKeyPath - Path to the minisign secret key
 * @returns {Promise<string>} - Path to the signature file
 */
async function signFile(filePath, secretKeyPath) {
  try {
    console.log(`🔒 Signing file: ${path.basename(filePath)}`);

    // Check if file exists
    await fs.access(filePath);

    // Sign the file
    const command = `minisign -Sm "${filePath}" -s "${secretKeyPath}"`;
    execSync(command, { stdio: "inherit" });

    const signatureFile = `${filePath}.minisig`;
    console.log(`✓ Created signature: ${path.basename(signatureFile)}`);

    return signatureFile;
  } catch (error) {
    console.error(
      `✗ Failed to sign ${path.basename(filePath)}:`,
      error.message,
    );
    throw error;
  }
}

/**
 * Find all release files in the target directory
 * @param {string} targetDir - Target directory to search
 * @returns {Promise<string[]>} - Array of file paths
 */
async function findReleaseFiles(targetDir) {
  const releaseFiles = [];

  try {
    const items = await fs.readdir(targetDir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(targetDir, item.name);

      if (item.isDirectory()) {
        // Recursively search subdirectories
        const subFiles = await findReleaseFiles(fullPath);
        releaseFiles.push(...subFiles);
      } else if (item.isFile()) {
        // Check for release file patterns
        if (
          item.name.endsWith(".msi") ||
          item.name.endsWith(".exe") ||
          item.name.endsWith(".deb") ||
          item.name.endsWith(".AppImage") ||
          item.name.endsWith(".dmg") ||
          item.name.endsWith(".app.tar.gz") ||
          item.name.endsWith(".tar.gz") ||
          item.name.endsWith(".zip")
        ) {
          releaseFiles.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${targetDir}:`, error.message);
  }

  return releaseFiles;
}

/**
 * Main function to sign all release files
 */
async function signReleaseFiles() {
  try {
    console.log("🚀 Starting minisign file signing process...\n");

    // Path to the secret key
    const secretKeyPath = path.join(
      process.env.USERPROFILE || process.env.HOME,
      ".minisign",
      "minisign.key",
    );
    const projectPublicKeyPath = path.join(
      projectRoot,
      ".minisign",
      "minisign.pub",
    );

    // Check if secret key exists
    try {
      await fs.access(secretKeyPath);
      console.log(`✓ Found secret key at: ${secretKeyPath}`);
    } catch {
      console.error(`❌ Secret key not found at: ${secretKeyPath}`);
      console.error("Please generate a key pair first with: minisign -G");
      process.exit(1);
    }

    // Check if project public key exists
    try {
      await fs.access(projectPublicKeyPath);
      console.log(`✓ Found project public key at: ${projectPublicKeyPath}`);
    } catch {
      console.error(
        `❌ Project public key not found at: ${projectPublicKeyPath}`,
      );
      console.error("Please copy minisign.pub to .minisign/ directory");
      process.exit(1);
    }

    // Find target directory
    const targetDir = path.join(
      projectRoot,
      "src-tauri",
      "target",
      "release",
      "bundle",
    );

    console.log(`🔍 Searching for release files in: ${targetDir}\n`);

    // Check if target directory exists
    try {
      await fs.access(targetDir);
    } catch {
      console.error(`❌ Target directory not found: ${targetDir}`);
      console.error(
        "Please run 'pnpm tauri build' first to create release files",
      );
      process.exit(1);
    }

    // Find all release files
    const releaseFiles = await findReleaseFiles(targetDir);

    if (releaseFiles.length === 0) {
      console.log("ℹ️  No release files found to sign");
      console.log("Run 'pnpm tauri build' to create release files first");
      return;
    }

    console.log(`📦 Found ${releaseFiles.length} release files:`);
    releaseFiles.forEach((file) => console.log(`  - ${path.basename(file)}`));
    console.log();

    // Sign all files
    const signatures = [];
    for (const filePath of releaseFiles) {
      try {
        const signatureFile = await signFile(filePath, secretKeyPath);
        signatures.push(signatureFile);
      } catch (error) {
        console.error(
          `Failed to sign ${path.basename(filePath)}:`,
          error.message,
        );
      }
    }

    console.log(
      `\n✅ Successfully signed ${signatures.length}/${releaseFiles.length} files`,
    );

    // Show signature files
    if (signatures.length > 0) {
      console.log("\n📝 Generated signatures:");
      signatures.forEach((sig) => console.log(`  - ${path.basename(sig)}`));

      console.log("\n💡 Upload these files to your GitHub release:");
      releaseFiles.forEach((file) => console.log(`  - ${path.basename(file)}`));
      signatures.forEach((sig) => console.log(`  - ${path.basename(sig)}`));
    }
  } catch (error) {
    console.error("❌ Error during signing process:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  signReleaseFiles().catch(console.error);
}

export { signReleaseFiles, signFile };
