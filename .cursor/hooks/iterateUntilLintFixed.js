import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';

const LINT_ATTEMPT_FILE_PATH = '.cursor/hooks/lintAttempts';

function main() {
  const hookArguments = JSON.parse(fs.readFileSync('/dev/stdin'), 'utf8');
  const { workspace_roots } = hookArguments;

  for (const root of workspace_roots) {
    const attemptsDirectory = path.normalize(
      path.join(root, LINT_ATTEMPT_FILE_PATH),
    );
    if (!fs.existsSync(attemptsDirectory)) {
      continue;
    }

    const locatedFiles = fs.readdirSync(
      path.normalize(path.join(root, LINT_ATTEMPT_FILE_PATH)),
    );
    if (locatedFiles.length > 0) {
      const filesNames = locatedFiles
        .map((f) => ({
          content: fs.readFileSync(
            path.join(root, LINT_ATTEMPT_FILE_PATH, f),
            'utf8',
          ),
          filename: f,
        }))
        .map((f) => ({
          sourceFile: JSON.parse(f.content).file_path,
          attemptsFile: f.filename,
        }));
      exec(
        `cd ${JSON.stringify(root)} && npm run lint -- --quiet`,
        (error, stdout) => {
          if (error) {
            const filesToFix = [];
            for (const file of filesNames) {
              if (
                fs.existsSync(path.join(root, file.sourceFile)) &&
                stdout.includes(file.sourceFile)
              ) {
                filesToFix.push(`- ${file.sourceFile}`);
              } else {
                fs.rmSync(
                  path.join(root, LINT_ATTEMPT_FILE_PATH, file.attemptsFile),
                );
              }
            }
            if (filesToFix.length > 0) {
              const folowUpMessage = `Please fix the linter errors in the workspace ${root} and try again. Use ESLint MCP to find the issues and fix it. Iterate until all issues are fixed. Bear in mind no eslint file configuration changes not disable commits wont work.
              
              Linter errors found in files: 
              ${filesToFix.join('\n')}`;

              console.log(
                JSON.stringify(
                  {
                    followup_message: folowUpMessage,
                  },
                  undefined,
                  2,
                ),
              );
            } else {
              fs.rmSync(attemptsDirectory, { recursive: true, force: true });
            }
          } else {
            fs.rmSync(attemptsDirectory, { recursive: true, force: true });
          }
        },
      );
    }
  }
}

main();
