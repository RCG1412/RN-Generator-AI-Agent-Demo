import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function InternalQualityReports() {
  return (
    <Layout title="Quality Reports">
      <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
        <h1>📊 Quality Reports (Internal Only)</h1>
        <p>Quality reports are for internal team review only. NOT published to production.</p>
        <p><Link to="/internal/">← Back to Internal Preview</Link></p>
        
        <div style={{marginTop: '2rem', padding: '1rem', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px'}}>
          <strong>🔒 Restricted:</strong> Quality reports are in Markdown (.md) format and never published to production.
        </div>
      </div>
    </Layout>
  );
}