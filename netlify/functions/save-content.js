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
      // Split path by dots and brackets, filter empty strings
      const parts = path.split(/\.|\[|\]/).filter(p => p);
      
      let current = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const nextPart = parts[i + 1];
        
        // If next part is a number, ensure current is array
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
      
      // Set the final value
      const lastPart = parts[parts.length - 1];
      current[lastPart] = value;
    }

    for (const change of changes) {
      const filePath = `src/content/${change.file}`;
      console.log(`Attempting to update: ${filePath}, field: ${change.field}`);

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

        // Use helper function to set nested value
        setNestedValue(content, change.field, change.value);

        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: filePath,
          message: `Admin: Update ${change.field} in ${change.file}`,
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
        count: changes.length
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