// netlify/functions/deploy-status.js
// This function runs on Netlify's servers and keeps your API token secure

exports.handler = async (event, context) => {
  // Add CORS headers to allow requests from your site
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 200, 
      headers, 
      body: '' 
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Check if environment variables are configured
    if (!process.env.NETLIFY_SITE_ID || !process.env.NETLIFY_API_TOKEN) {
      console.error('Missing environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error - missing environment variables' 
        })
      };
    }

    // Fetch the latest deploy from Netlify API
    const response = await fetch(
      `https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/deploys?per_page=1`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NETLIFY_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Netlify API error: ${response.status}`);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Netlify API returned status ${response.status}` 
        })
      };
    }

    const deploys = await response.json();
    
    if (!deploys || deploys.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'No deploys found' 
        })
      };
    }

    const latestDeploy = deploys[0];

    // Return only the necessary information (don't leak sensitive data)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: latestDeploy.id,
        state: latestDeploy.state,
        created_at: latestDeploy.created_at,
        deploy_time: latestDeploy.deploy_time,
        error_message: latestDeploy.error_message,
        context: latestDeploy.context,
        branch: latestDeploy.branch,
      })
    };
  } catch (error) {
    console.error('Deploy status function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};