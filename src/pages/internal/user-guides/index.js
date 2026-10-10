import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function InternalUserGuides() {
  return (
    <Layout title="Internal User Guides">
      <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
        <h1>📚 User Guides (Internal Preview)</h1>
        <p>Review and edit user guides before production deployment.</p>
        <p><Link to="/internal/">← Back to Internal Preview</Link></p>
      </div>
    </Layout>
  );
}