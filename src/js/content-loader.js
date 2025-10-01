// Content Loader Utility Functions
// Handles fetching and parsing JSON and Markdown content

/**
 * Fetch and parse JSON content
 * @param {string} path - Path to JSON file
 * @returns {Promise<Object>} Parsed JSON data
 */
async function fetchJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching JSON from ${path}:`, error);
    return null;
  }
}

/**
 * Fetch and parse markdown content with frontmatter
 * @param {string} path - Path to markdown file
 * @returns {Promise<Object>} Parsed markdown with frontmatter and body
 */
async function fetchMarkdown(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const content = await response.text();
    return parseMarkdownFrontmatter(content);
  } catch (error) {
    console.error(`Error fetching markdown from ${path}:`, error);
    return null;
  }
}

/**
 * Parse markdown frontmatter and body
 * @param {string} content - Raw markdown content
 * @returns {Object} Object with frontmatter and body
 */
function parseMarkdownFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return {
      frontmatter: {},
      body: content
    };
  }
  
  const frontmatterText = match[1];
  const body = match[2];
  
  // Parse YAML frontmatter (simple implementation)
  const frontmatter = {};
  const lines = frontmatterText.split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Handle arrays (simple implementation)
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // If JSON parsing fails, treat as string
        }
      }
      
      frontmatter[key] = value;
    }
  }
  
  return {
    frontmatter,
    body
  };
}

/**
 * Fetch all markdown files in a folder
 * @param {string} folder - Folder path
 * @returns {Promise<Array>} Array of parsed markdown files
 */
async function fetchAllMarkdownInFolder(folder) {
  try {
    // For now, we'll need to maintain a list of files
    // In a real implementation, you might have an index file or API endpoint
    console.warn('fetchAllMarkdownInFolder: This function requires a file listing mechanism');
    return [];
  } catch (error) {
    console.error(`Error fetching markdown files from ${folder}:`, error);
    return [];
  }
}

/**
 * Get all markdown files from a directory (requires index file)
 * @param {string} folder - Folder path
 * @param {Array} fileList - List of files in the folder
 * @returns {Promise<Array>} Array of parsed markdown files
 */
async function fetchMarkdownFiles(folder, fileList) {
  const markdownFiles = fileList.filter(file => file.endsWith('.md'));
  const results = [];
  
  for (const file of markdownFiles) {
    const fullPath = `${folder}/${file}`;
    const content = await fetchMarkdown(fullPath);
    if (content) {
      results.push({
        filename: file,
        path: fullPath,
        ...content
      });
    }
  }
  
  return results;
}

/**
 * Resolve image path - handles both URLs and local paths
 * @param {string} imagePath - Image path
 * @returns {string} Resolved image path
 */
function resolveImagePath(imagePath) {
  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  // If it's a relative path, return as is (browser will resolve relative to current page)
  return imagePath;
}

/**
 * Format date for display
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {string} Formatted date string
 */
function formatDate(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  if (startDate === endDate) {
    return start.toLocaleDateString("en-US", options);
  } else {
    const startFormatted = start.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    const endFormatted = end.toLocaleDateString("en-US", options);
    return `${startFormatted} - ${endFormatted}`;
  }
}

/**
 * Get preview text (first N characters)
 * @param {string} text - Text to preview
 * @param {number} length - Maximum length (default 100)
 * @returns {string} Preview text
 */
function getPreviewText(text, length = 100) {
  return text.length > length
    ? text.substring(0, length) + "..."
    : text;
}

// Export functions for use in other modules
window.ContentLoader = {
  fetchJSON,
  fetchMarkdown,
  parseMarkdownFrontmatter,
  fetchAllMarkdownInFolder,
  fetchMarkdownFiles,
  resolveImagePath,
  formatDate,
  getPreviewText
};
