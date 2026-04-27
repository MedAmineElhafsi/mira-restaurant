const https = require('https');
const token = 'vca_7QfDzt6ooNDX5UZ63cSZiLpopzOd9ZhorgXtYaVW8DhhKzvN3Z2va4Lq';
const projectName = 'mira-mediterrane';

const envVars = [
  {
    key: 'DATABASE_URL',
    value: 'postgresql://neondb_owner:npg_lv3xgpHrJC6k@ep-cold-frost-alrvqnmc.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    type: 'plain',
    target: ['production', 'preview', 'development']
  },
  {
    key: 'NEXTAUTH_SECRET',
    value: 'dev-secret-key-change-in-production-abc123',
    type: 'plain',
    target: ['production', 'preview', 'development']
  },
  {
    key: 'STRIPE_SECRET_KEY',
    value: 'sk_test_placeholder',
    type: 'plain',
    target: ['production', 'preview', 'development']
  }
];

function addEnvVar(envVar, projectId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(envVar);
    const req = https.request(`https://api.vercel.com/v10/projects/${projectId}/env`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Added ${envVar.key} successfully.`);
          resolve();
        } else {
          console.log(`Failed to add ${envVar.key}: ${body}`);
          resolve(); // Resolve anyway to continue with others
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getProjectId() {
  return new Promise((resolve, reject) => {
    https.get(`https://api.vercel.com/v9/projects/${projectName}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body).id);
        } else {
          reject(new Error(`Failed to get project: ${body}`));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    const projectId = await getProjectId();
    console.log('Project ID:', projectId);
    for (const v of envVars) {
      await addEnvVar(v, projectId);
    }
  } catch (err) {
    console.error(err);
  }
}

main();
