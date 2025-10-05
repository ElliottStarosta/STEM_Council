const { Octokit } = require("@octokit/rest");

exports.handler = async (event, context) => {
  console.log("Function invoked");
  
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { user } = context.clientContext;
  if (!user) {
    console.log("No user found");
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" })
    };
  }

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

    // TEST: Can we access the repo at all?
    try {
      const { data: repoData } = await octokit.repos.get({
        owner,
        repo
      });
      console.log("Repo access successful:", repoData.full_name);
    } catch (repoError) {
      console.error("Cannot access repo:", repoError.message);
      throw new Error(`Cannot access repository ${owner}/${repo}. Token may not have permission.`);
    }

    for (const change of changes) {
      const filePath = `src/content/${change.file}`;
      console.log(`Attempting to update: ${filePath}`);

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

        content[change.field] = change.value;

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