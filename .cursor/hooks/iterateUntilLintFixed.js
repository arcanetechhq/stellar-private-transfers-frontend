import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";

const LINT_ATTEMPT_FILE_PATH = ".cursor/hooks/lintAttempts";
const FOLLOW_UP_MESSAGE_HEADER =
  "Please fix the linter errors. Use ESLint MCP to find the issues and fix it. Iterate until all issues are fixed. Bear in mind the eslint file configuration changes nor disable commits wont work.";

function lintWorkspace(root, filesNames) {
  const attemptsDirectory = path.normalize(
    path.join(root, LINT_ATTEMPT_FILE_PATH),
  );
  if (!fs.existsSync(attemptsDirectory)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    exec(
      `cd ${JSON.stringify(root)} && npm run lint -- --quiet`,
      (error, stdout) => {
        try {
          if (error) {
            const filesToFix = [];
            for (const file of filesNames) {
              if (
                fs.existsSync(file.sourceFile) &&
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
              const folowUpMessage = `Linter errors found in the workspace ${root} in files: \n${filesToFix.join("\n")}`;

              resolve(folowUpMessage);
            } else {
              fs.rmSync(attemptsDirectory, {
                recursive: true,
                force: true,
              });
              resolve();
            }
          } else {
            fs.rmSync(attemptsDirectory, { recursive: true, force: true });
            resolve();
          }
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

function main() {
  const hookArguments = JSON.parse(fs.readFileSync("/dev/stdin"), "utf8");
  const { workspace_roots } = hookArguments;

  const startedProceses = [];

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
            "utf8",
          ),
          filename: f,
        }))
        .map((f) => ({
          sourceFile: JSON.parse(f.content).file_path,
          attemptsFile: f.filename,
        }));
      const lintProcess = lintWorkspace(root, filesNames);
      startedProceses.push(lintProcess);
    }
  }
  Promise.all(startedProceses)
    .then((outputs) => {
      return outputs.filter((output) => output !== undefined).join("\n");
    })
    .then((outputs) => {
      if (outputs.length > 0) {
        console.log(
          JSON.stringify({
            followup_message: `${FOLLOW_UP_MESSAGE_HEADER}\n\n${outputs}`,
          }),
        );
      }
    });
}

main();
