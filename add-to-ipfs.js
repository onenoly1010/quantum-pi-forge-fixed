const fs = require('fs');
const https = require('https');

const IPFS_API = 'http://127.0.0.1:5001/api/v0/add';

console.log('🏛️  Adding Sovereign Page to IPFS...');

// Read the HTML file
const htmlContent = fs.readFileSync('sovereign-index.html');

// Create multipart form data
const boundary = '----FormBoundary' + Date.now();
const postData = [
  `--${boundary}`,
  'Content-Disposition: form-data; name="file"; filename="index.html"',
  'Content-Type: text/html',
  '',
  htmlContent,
  `--${boundary}--`
].join('\r\n');

const options = {
  hostname: '127.0.0.1',
  port: 5001,
  path: '/api/v0/add',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      const ipfsHash = result.Hash;

      console.log('✅ File added to IPFS!');
      console.log(`📋 IPFS Hash: ${ipfsHash}`);
      console.log(`🌐 Local Gateway: http://127.0.0.1:8080/ipfs/${ipfsHash}`);
      console.log(`🌍 Public Gateway: https://ipfs.io/ipfs/${ipfsHash}`);

      // Save configuration
      const config = {
        ipfsHash,
        ipfsUrl: `https://ipfs.io/ipfs/${ipfsHash}`,
        gatewayUrl: `http://127.0.0.1:8080/ipfs/${ipfsHash}`,
        deployedAt: new Date().toISOString(),
        network: '0G Aristotle',
        status: 'sovereign-page-deployed'
      };

      fs.writeFileSync('ipfs-deployment.json', JSON.stringify(config, null, 2));
      console.log('💾 Configuration saved to ipfs-deployment.json');

      console.log('\n🎉 Sovereign Page Live on IPFS!');
      console.log('===============================');
      console.log('Next: Run Kraken withdrawal script');
      console.log('Then: Deploy CentralAwarenessV2 contract');

    } catch (error) {
      console.error('❌ Error parsing IPFS response:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ IPFS request failed:', error.message);
});

req.write(postData);
req.end();