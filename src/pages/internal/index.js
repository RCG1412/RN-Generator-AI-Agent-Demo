import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function InternalPreview() {
  return (
    <Layout title="Internal Preview" description="Internal documentation preview">
      <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
        <h1>🔒 Internal Preview Environment</h1>
        <p>Internal staging environment for tech writers to review documentation before production.</p>
        
        <div style={{marginTop: '2rem'}}>
          <h2>Quick Links</h2>
          <ul>
            <li><Link to="/internal/user-guides/">User Guides (Internal)</Link></li>
            <li><Link to="/internal/release-notes/">Release Notes (Internal)</Link></li>
            <li><Link to="/internal/quality-reports/">Quality Reports (Internal Only)</Link></li>
          </ul>
        </div>
        
        <div style={{marginTop: '2rem', padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px'}}>
          <strong>⚠️ Important:</strong> This content is for internal review only.
        </div>
      </div>
    </Layout>
  );
}