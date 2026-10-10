import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function InternalReleaseNotes() {
  return (
    <Layout title="Internal Release Notes">
      <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
        <h1>📋 Release Notes (Internal Preview)</h1>
        <p>Review and edit release notes before production deployment.</p>
        <p><Link to="/internal/">← Back to Internal Preview</Link></p>
      </div>
    </Layout>
  );
}