#!/usr/bin/env node
/**
 * Transform backup JSONL files for import into a different deployment.
 *
 * This script:
 * 1. Reads JSONL files from a Convex backup
 * 2. Converts _id to legacyId (as string)
 * 3. Converts foreign key IDs to legacy fields (as strings)
 * 4. Removes _id and _creationTime
 * 5. Writes transformed files ready for import with --append
 *
 * Usage:
 *   node scripts/transform-backup.js <backup-folder> [output-folder]
 *
 * Example:
 *   node scripts/transform-backup.js ./snapshot_scrupulous-opossum-953_1769954282629238270 ./transformed
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Tables to process and their foreign key mappings
const TABLE_CONFIG = {
  themes: {
    // No foreign keys, just convert _id to legacyId
    foreignKeys: {},
  },
  subthemes: {
    foreignKeys: {
      themeId: 'legacyThemeId',
    },
  },
  groups: {
    foreignKeys: {
      subthemeId: 'legacySubthemeId',
    },
  },
  questions: {
    foreignKeys: {
      themeId: 'legacyThemeId',
      subthemeId: 'legacySubthemeId',
      groupId: 'legacyGroupId',
    },
  },
  questionContent: {
    foreignKeys: {
      questionId: 'legacyQuestionId',
    },
  },
};

async function processJsonlFile(inputPath, outputPath, config) {
  const inputStream = fs.createReadStream(inputPath);
  const outputStream = fs.createWriteStream(outputPath);

  const rl = readline.createInterface({
    input: inputStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const doc = JSON.parse(line);

      // Transform the document
      const transformed = {};

      // Copy all fields except _id and _creationTime
      for (const [key, value] of Object.entries(doc)) {
        if (key === '_id') {
          // Convert _id to legacyId (as string)
          transformed.legacyId = value;
        } else if (key === '_creationTime') {
          // Skip _creationTime
          continue;
        } else if (config.foreignKeys[key]) {
          // Convert foreign key to legacy field (as string)
          // Keep the value as the legacy field
          transformed[config.foreignKeys[key]] = value;
          // Don't include the original foreign key - it will be invalid
          // The migration will recreate it
        } else {
          // Keep other fields as-is
          transformed[key] = value;
        }
      }

      outputStream.write(JSON.stringify(transformed) + '\n');
      lineCount++;
    } catch (error) {
      console.error(`Error processing line: ${error.message}`);
      console.error(`Line content: ${line.substring(0, 100)}...`);
    }
  }

  outputStream.end();
  return lineCount;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('Usage: node scripts/transform-backup.js <backup-folder> [output-folder]');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/transform-backup.js ./snapshot_scrupulous-opossum-953_1769954282629238270 ./transformed');
    process.exit(1);
  }

  const backupFolder = args[0];
  const outputFolder = args[1] || path.join(path.dirname(backupFolder), 'transformed');

  // Validate backup folder exists
  if (!fs.existsSync(backupFolder)) {
    console.error(`Error: Backup folder not found: ${backupFolder}`);
    process.exit(1);
  }

  // Create output folder if it doesn't exist
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  console.log(`Processing backup from: ${backupFolder}`);
  console.log(`Output folder: ${outputFolder}`);
  console.log('');

  // Process each table
  for (const [tableName, config] of Object.entries(TABLE_CONFIG)) {
    const inputPath = path.join(backupFolder, tableName, 'documents.jsonl');

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${tableName}: documents.jsonl not found`);
      continue;
    }

    const outputPath = path.join(outputFolder, `${tableName}.jsonl`);

    console.log(`Processing ${tableName}...`);
    const count = await processJsonlFile(inputPath, outputPath, config);
    console.log(`  ✓ ${count} documents transformed → ${outputPath}`);
  }

  console.log('');
  console.log('Done! Next steps:');
  console.log('');
  console.log('1. Deploy schema with legacy fields to target deployment');
  console.log('2. Import each table in order:');
  console.log('');
  console.log(`   npx convex import --prod --append --table themes "${path.join(outputFolder, 'themes.jsonl')}"`);
  console.log(`   npx convex import --prod --append --table subthemes "${path.join(outputFolder, 'subthemes.jsonl')}"`);
  console.log(`   npx convex import --prod --append --table groups "${path.join(outputFolder, 'groups.jsonl')}"`);
  console.log(`   npx convex import --prod --append --table questions "${path.join(outputFolder, 'questions.jsonl')}"`);
  console.log(`   npx convex import --prod --append --table questionContent "${path.join(outputFolder, 'questionContent.jsonl')}"`);
  console.log('');
  console.log('3. Run the relink migrations to recreate foreign key references');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
