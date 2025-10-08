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
    const { jsonChanges, markdownChanges, user } = JSON.parse(event.body);
    console.log("Changes to save:", { jsonChanges, markdownChanges });

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = "admin";

    console.log(`Repo: ${owner}/${repo}, Branch: ${branch}`);

    // Get the current branch reference
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    });
    const currentCommitSha = refData.object.sha;

    // Get the current commit
    const { data: currentCommit } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: currentCommitSha
    });
    const currentTreeSha = currentCommit.tree.sha;

    // Prepare all file changes as blobs
    const blobs = [];
    let changeCount = 0;

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

    // Handle JSON changes
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
        console.log(`Preparing update for ${filePath} with ${fileChangesList.length} changes`);

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

          const newContent = JSON.stringify(content, null, 2);
          
          // Create blob for this file
          const { data: blob } = await octokit.git.createBlob({
            owner,
            repo,
            content: Buffer.from(newContent).toString('base64'),
            encoding: 'base64'
          });

          blobs.push({
            path: filePath,
            mode: '100644',
            type: 'blob',
            sha: blob.sha
          });

          changeCount += fileChangesList.length;
          console.log(`Blob created for: ${filePath}`);
        } catch (fileError) {
          console.error(`Error preparing ${filePath}:`, fileError.message);
          throw fileError;
        }
      }
    }

    // Handle Markdown deletions with existence check
    if (markdownChanges?.deleted && markdownChanges.deleted.length > 0) {
      for (const filename of markdownChanges.deleted) {
        const filePath = `src/content/${filename}`;
        try {
          // Check if file exists before marking for deletion
          await octokit.repos.getContent({
            owner,
            repo,
            path: filePath,
            ref: branch
          });
          blobs.push({
            path: filePath,
            mode: '100644',
            type: 'blob',
            sha: null // null sha means delete
          });
          changeCount++;
          console.log(`Marked for deletion: ${filename}`);
        } catch (err) {
          if (err.status === 404) {
            console.warn(`File not found for deletion: ${filename}, skipping.`);
          } else {
            console.error(`Error checking file existence for deletion: ${filename}`, err.message);
            throw err;
          }
        }
      }
    }

    // Handle Markdown updates
    if (markdownChanges?.modified) {
      for (const [filename, data] of Object.entries(markdownChanges.modified)) {
        const filePath = `src/content/${filename}`;
        console.log(`Preparing update for ${filePath}`);
        
        const markdownContent = generateMarkdownFile(data);
        
        const { data: blob } = await octokit.git.createBlob({
          owner,
          repo,
          content: Buffer.from(markdownContent).toString('base64'),
          encoding: 'base64'
        });

        blobs.push({
          path: filePath,
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        });

        changeCount++;
        console.log(`Blob created for: ${filePath}`);
      }
    }

    // Handle Markdown creations
    if (markdownChanges?.created && markdownChanges.created.length > 0) {
      for (const item of markdownChanges.created) {
        const filePath = `src/content/${item.filename}`;
        console.log(`Preparing creation of ${filePath}`);
        
        const markdownContent = generateMarkdownFile(item.data);
        
        const { data: blob } = await octokit.git.createBlob({
          owner,
          repo,
          content: Buffer.from(markdownContent).toString('base64'),
          encoding: 'base64'
        });

        blobs.push({
          path: filePath,
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        });

        changeCount++;
        console.log(`Blob created for: ${filePath}`);
      }
    }

    // Update index.json
    if (markdownChanges && (markdownChanges.deleted?.length > 0 || markdownChanges.created?.length > 0)) {
      try {
        console.log('Preparing index.json update');
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
        
        const { data: blob } = await octokit.git.createBlob({
          owner,
          repo,
          content: Buffer.from(JSON.stringify(indexContent, null, 2)).toString('base64'),
          encoding: 'base64'
        });

        blobs.push({
          path: indexPath,
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        });

        console.log('Blob created for index.json');
      } catch (indexError) {
        console.error('Error preparing index.json:', indexError.message);
      }
    }

    // Create new tree with all changes
    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: currentTreeSha,
      tree: blobs
    });

    console.log(`Created new tree with ${blobs.length} file changes`);

    // Create commit with all changes
    const commitMessage = `Admin: Batch update - ${changeCount} changes by ${user || 'admin'}`;
    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTree.sha,
      parents: [currentCommitSha]
    });

    console.log(`Created commit: ${newCommit.sha}`);

    // Update branch reference to point to new commit
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha
    });

    console.log(`Updated branch ${branch} to new commit`);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: "All changes saved in a single commit",
        commitSha: newCommit.sha,
        commitMessage: commitMessage,
        filesChanged: blobs.length,
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
  
  let yamlFrontmatter = '';
  
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      yamlFrontmatter += `${key}:\n`;
      value.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          const entries = Object.entries(item);
          if (entries.length === 1) {
            // Single property: - key: "value"
            const [itemKey, itemValue] = entries[0];
            yamlFrontmatter += `  - ${itemKey}: "${itemValue}"\n`;
          } else {
            // Multiple properties: first on dash line, rest indented
            entries.forEach(([itemKey, itemValue], index) => {
              if (index === 0) {
                yamlFrontmatter += `  - ${itemKey}: "${itemValue}"\n`;
              } else {
                yamlFrontmatter += `    ${itemKey}: "${itemValue}"\n`;
              }
            });
          }
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