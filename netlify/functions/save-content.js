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
    const { jsonChanges, markdownChanges } = JSON.parse(event.body);
    console.log("Changes to save:", { jsonChanges, markdownChanges });

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

    // Handle JSON changes (existing logic)
    if (jsonChanges && jsonChanges.length > 0) {
      const fileChanges = {};
      for (const change of jsonChanges) {
        if (!fileChanges[change.file]) {
          fileChanges[change.file] = [];
        }
        fileChanges[change.file].push(change);
      }

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

          for (const change of fileChangesList) {
            setNestedValue(content, change.field, change.value);
          }

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
    }

    // Handle Markdown changes
    if (markdownChanges) {
      // Delete files
      for (const filename of markdownChanges.deleted || []) {
        const filePath = `src/content/${filename}`;
        console.log(`Deleting ${filePath}`);
        
        try {
          const { data: file } = await octokit.repos.getContent({
            owner, 
            repo, 
            path: filePath, 
            ref: branch
          });
          
          await octokit.repos.deleteFile({
            owner, 
            repo, 
            path: filePath,
            message: `Admin: Delete ${filename}`,
            sha: file.sha,
            branch
          });
          
          console.log(`Successfully deleted: ${filePath}`);
        } catch (deleteError) {
          console.error(`Error deleting ${filePath}:`, deleteError.message);
          // Don't throw - continue with other operations
        }
      }

      // Update existing files
      for (const [filename, data] of Object.entries(markdownChanges.modified || {})) {
        const filePath = `src/content/${filename}`;
        console.log(`Updating ${filePath}`);
        
        try {
          const { data: file } = await octokit.repos.getContent({
            owner, 
            repo, 
            path: filePath, 
            ref: branch
          });
          
          const markdownContent = generateMarkdownFile(data);
          
          await octokit.repos.createOrUpdateFileContents({
            owner, 
            repo, 
            path: filePath,
            message: `Admin: Update ${filename}`,
            content: Buffer.from(markdownContent).toString('base64'),
            sha: file.sha,
            branch
          });
          
          console.log(`Successfully updated: ${filePath}`);
        } catch (updateError) {
          console.error(`Error updating ${filePath}:`, updateError.message);
          throw updateError;
        }
      }

      // Create new files
      for (const item of markdownChanges.created || []) {
        const filePath = `src/content/${item.filename}`;
        console.log(`Creating ${filePath}`);
        
        try {
          const markdownContent = generateMarkdownFile(item.data);
          
          await octokit.repos.createOrUpdateFileContents({
            owner, 
            repo, 
            path: filePath,
            message: `Admin: Create ${item.filename}`,
            content: Buffer.from(markdownContent).toString('base64'),
            branch
          });
          
          console.log(`Successfully created: ${filePath}`);
        } catch (createError) {
          console.error(`Error creating ${filePath}:`, createError.message);
          throw createError;
        }
      }

      // Update index.json
      try {
        console.log('Updating index.json');
        const indexPath = 'src/content/index.json';
        
        const { data: indexFile } = await octokit.repos.getContent({
          owner,
          repo,
          path: indexPath,
          ref: branch
        });
        
        const indexContent = JSON.parse(
          Buffer.from(indexFile.content, 'base64').toString()
        );
        
        // Update index based on changes
        for (const filename of markdownChanges.deleted || []) {
          const [folder, file] = filename.split('/');
          if (indexContent[folder]) {
            indexContent[folder] = indexContent[folder].filter(f => f !== file);
          }
        }
        
        for (const item of markdownChanges.created || []) {
          const [folder, file] = item.filename.split('/');
          if (indexContent[folder] && !indexContent[folder].includes(file)) {
            indexContent[folder].push(file);
          }
        }
        
        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: indexPath,
          message: 'Admin: Update content index',
          content: Buffer.from(JSON.stringify(indexContent, null, 2)).toString('base64'),
          sha: indexFile.sha,
          branch
        });
        
        console.log('Successfully updated index.json');
      } catch (indexError) {
        console.error('Error updating index.json:', indexError.message);
        // Don't throw - index update is not critical
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: "All changes saved successfully",
        jsonCount: jsonChanges?.length || 0,
        markdownDeleted: markdownChanges?.deleted?.length || 0,
        markdownModified: Object.keys(markdownChanges?.modified || {}).length,
        markdownCreated: markdownChanges?.created?.length || 0
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

function generateMarkdownFile(data) {
  const { body, ...frontmatter } = data;
  
  // Manually format YAML frontmatter to ensure proper formatting
  let yamlFrontmatter = '';
  
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      yamlFrontmatter += `${key}:\n`;
      value.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          yamlFrontmatter += `  -`;
          for (const [itemKey, itemValue] of Object.entries(item)) {
            yamlFrontmatter += ` ${itemKey}: "${itemValue}"`;
          }
          yamlFrontmatter += '\n';
        } else {
          yamlFrontmatter += `  - "${item}"\n`;
        }
      });
    } else if (typeof value === 'string') {
      yamlFrontmatter += `${key}: "${value}"\n`;
    } else {
      yamlFrontmatter += `${key}: ${value}\n`;
    }
  }
  
  return `---\n${yamlFrontmatter}---\n${body || ''}`;
}