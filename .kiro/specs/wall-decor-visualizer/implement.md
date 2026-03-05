Remember now we are working in existing code base so cant make changes to existing files without prior permission - Should wery careful, plan propoely and only then execute. Also not merges in master wihtout MR review. Also strongly follow all rules in global-setup files. 


Ask these question to collect inputs -

1. Describe what are you implementing
2. It is a bug fix, Feature improvement, Adding a new feature ?
3. If 3, have you reviewed gobals requirements file ? Requirements for New Feature correct in requirements doc ?
4. Give UI mock up file name that has Mock up for this feature
5. What is the linking of this feature



After prompt recieving this file if 3 was chosen
-- Create a folder <feature name>_playground
-- Create a feature_task.md
-- Task 1 - Generate test plan for this feature with 100% Coverage
-- Task 2 - Verify test plan follows test-quality.md
-- Task 3 - Add UI mock file copy in this folder
-- Task 4 - Create a feature_architecture.md file for this feature in this folder
-- Task 5 - Verify as per global-setup files. Fix all violations
-- Task 5 - Generate interfaces and parameters. 
-- Task 6 - Start implementation accordint to files generated above
-- Task 7 - Implement all tests for this feature in feature_test.ts in both front end and backend folders 
-- Task 8 - Run all previous test implemented in this repo and feature_test.ts and esnure coverage and testing strategy is same as mentionedin testing-quality.md
-- Task 9 - Deploy and try the feature
-- Raise MR for review


Note :
When creating tasks in feature_task.md files reduce the number of subtasks that are there in each task, keep only 1-2 subtasks in each tasks
