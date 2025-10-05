const { Octokit } = require("@octokit/rest");

exports.handler = async (event, context) => {
  console.log("Function invoked");
  
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("No authorization header found");
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized - No token provided" })
    };
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized - Invalid token" })
    };
  }

  console.log("Token received, proceeding with save");

  try {
    const { changes } = JSON.parse(event.body);
    console.log("Changes to save:", changes);

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = "admin";

    console.log(`Repo: ${owner}/${repo}, Branch: ${branch}`);

    // Helper function to set nested values in objects
    function setNestedValue(obj, path, value) {
      const parts = path.split(/\.|\[|\]/).filter(p => p);
      
      let current = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const nextPart = parts[i + 1];
        
        if (!isNaN(nextPart)) {
          if (!Array.isArray(current[part])) {
            current[part] = [];
          }
          current = current[part];
        } else {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      }
      
      const lastPart = parts[parts.length - 1];
      current[lastPart] = value;
    }

    // Group changes by file
    const fileChanges = {};
    for (const change of changes) {
      if (!fileChanges[change.file]) {
        fileChanges[change.file] = [];
      }
      fileChanges[change.file].push(change);
    }

    // Process each file once with all its changes
    for (const [filename, fileChangesList] of Object.entries(fileChanges)) {
      const filePath = `src/content/${filename}`;
      console.log(`Updating ${filePath} with ${fileChangesList.length} changes`);

      try {
        const { data: currentFile } = await octokit.repos.getContent({
          owner,
          repo,
          path: filePath,
          ref: branch
        });

        const content = JSON.parse(
          Buffer.from(currentFile.content, 'base64').toString()
        );

        // Apply ALL changes to this file
        for (const change of fileChangesList) {
          setNestedValue(content, change.field, change.value);
        }

        // Make ONE commit with all changes
        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: filePath,
          message: `Admin: Update ${fileChangesList.length} field(s) in ${filename}`,
          content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
          sha: currentFile.sha,
          branch
        });

        console.log(`Successfully updated: ${filePath}`);
      } catch (fileError) {
        console.error(`Error updating ${filePath}:`, fileError.message);
        throw fileError;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Changes saved successfully",
        count: changes.length,
        filesUpdated: Object.keys(fileChanges).length
      })
    };

  } catch (error) {
    console.error("Save error:", error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: error.message,
        details: error.stack 
      })
    };
  }
};