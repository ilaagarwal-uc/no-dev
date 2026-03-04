---
inclusion: auto
description: How to generate tasks
---

### Steering - Auto-Loaded Rules

Ask these question to collect inputs -

1. Describe what are you implementing
2. It is a bug fix, Feature improvement, Adding a new feature ?
3. If 3, have you reviewed gobals requirements file ? Requirements for New Feature correct in requirements doc ?
4. Give UI mock up file name that has Mock up for this feature

After prompt recieving this file if 3 was chosen
-- Create a folder <feature name>_playground
-- Create a feature_task.md
-- Task 1 - generate test plan for this feature
-- Task 2 - Approve test plan
-- Task 3 - Add UI mock file copy in this folder
-- Task 4 - Create a feature-architecture.md file for this feature in this folder - follow global-setup files. In feature-architecture.md file also add api request parameters and response parameters 
-- Task 5 - Generate feature_design md file 
-- Task 6 - Start implementation
-- Task 7 - implement all tests for this feature in feature_test.ts in both front end and backend folders 
-- Task 8 - Run all previous test implemented in this repo and feature_test.ts and esnure coverage and testing strategy is same as mentionedin testing-quality.md
-- Task 9 - Deploy and try the feature
-- Raise MR for review


