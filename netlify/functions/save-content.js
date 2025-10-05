const { Octokit } = require("@octokit/rest");

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Check authentication
  const { user } = context.clientContext;
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" })
    };
  }

  try {
    const { changes } = JSON.parse(event.body);

    // Initialize Octokit with your GitHub token
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = "main";

    // Process each change
    for (const change of changes) {
      const filePath = `src/content/${change.file}`;

      // Get current file content
      const { data: currentFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch
      });

      // Decode and parse JSON
      const content = JSON.parse(
        Buffer.from(currentFile.content, 'base64').toString()
      );

      // Update the field
      content[change.field] = change.value;

      // Commit the change
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: `Update ${change.field} in ${change.file}`,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
        sha: currentFile.sha,
        branch
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Changes saved successfully",
        count: changes.length
      })
    };

  } catch (error) {
    console.error("Save error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message
      })
    };
  }
};