# Overview

## What This Demo Does

This system automates the entire documentation lifecycle:
Reads Jira - Pulls tickets for a specific version, filtering by status "Done" and issue type labels.
1. **Writes Documentation** - Generates User Guides and Release Notes following Microsoft Manual of Style.
2. **Checks Quality** - Evaluates readability, style compliance, structure, and completeness using objective metrics.
3. **Deploys to Staging** - Creates a Pull Request for internal tech writer review.
4. **Tech Writer Edits** - Tech writers preview and edit in the staging environment.
5. **Deploys to Production** - Creates a final Pull Request for production deployment.

## Architecture Diagram

<img width="1266" height="2086" alt="image" src="https://github.com/user-attachments/assets/ee6c6c13-4a60-40aa-998d-7ab0d86b3191" />

## Key Features
- **Label-based categorization:** Stories with new_features label go to "New Features" section, Stories with enhancements label go to "Enhancements" section
- **Status filtering:** Only tickets with status "Done" are included
- **Release Highlights:** Benefit-focused bullet points at the top of Release Notes
- **Microsoft Manual of Style:** All content is checked and corrected to follow MS style rules
- **Quality Metrics:** Objective scoring using readability, style compliance, structure, and completeness
- **Missing Labels Alert:** Flags Stories without proper labels
- **Two-stage deployment:** Staging for tech writer review, then production for end users
- **Internal-only reports:** Quality reports are never published to production
