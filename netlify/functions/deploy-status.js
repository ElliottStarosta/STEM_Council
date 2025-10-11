exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!process.env.NETLIFY_SITE_ID || !process.env.NETLIFY_API_TOKEN) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing environment variables' })
      };
    }

    // Get the timestamp parameter to find deploys after this time
    const afterTime = event.queryStringParameters?.after;

    const response = await fetch(
      `https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/deploys?per_page=5`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NETLIFY_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: `Netlify API error: ${response.status}` })
      };
    }

    const deploys = await response.json();
    
    if (!deploys || deploys.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No deploys found' })
      };
    }

    // If we have an 'after' timestamp, find the first deploy created after it
    let targetDeploy = deploys[0];
    
    if (afterTime) {
      const afterDate = new Date(afterTime);
      const recentDeploy = deploys.find(d => new Date(d.created_at) > afterDate);
      if (recentDeploy) {
        targetDeploy = recentDeploy;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: targetDeploy.id,
        state: targetDeploy.state,
        created_at: targetDeploy.created_at,
        deploy_time: targetDeploy.deploy_time,
        error_message: targetDeploy.error_message,
        context: targetDeploy.context,
        branch: targetDeploy.branch,
      })
    };
  } catch (error) {
    console.error('Deploy status error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};