import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const bucketName = process.env.GCP_BUCKET_NAME || 'wall-decor-visualizer-images';
const projectId = process.env.GCP_PROJECT_ID;

async function testGCPUpload() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('Testing GCP Upload with Same Credentials');
    console.log('='.repeat(80));
    console.log(`\nProject ID: ${projectId}`);
    console.log(`Bucket Name: ${bucketName}\n`);

    // Parse GCP credentials from environment variable
    const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY || '{}');
    console.log(`Service Account: ${credentials.client_email}`);

    // Initialize Storage client (same as in the app)
    const storage = new Storage({
      projectId: projectId,
      credentials: credentials
    });

    console.log('\n✓ Storage client initialized');

    // Check if bucket exists
    const bucket = storage.bucket(bucketName);
    const [exists] = await bucket.exists();

    if (!exists) {
      console.log(`\n✗ Bucket "${bucketName}" does not exist!`);
      console.log('\nCreating bucket...');
      
      await storage.createBucket(bucketName, {
        location: 'US',
        storageClass: 'STANDARD',
      });
      
      console.log(`✓ Bucket "${bucketName}" created`);
    } else {
      console.log(`✓ Bucket "${bucketName}" exists`);
    }

    // Create a test file
    const testContent = Buffer.from('This is a test image upload from terminal');
    const testPath = 'test-user/test-image-id/test-image.txt';

    console.log(`\nUploading test file to: ${testPath}`);

    const file = bucket.file(testPath);

    // Upload the file (same method as in the app)
    await file.save(testContent, {
      metadata: {
        contentType: 'text/plain',
      },
      resumable: false,
    });

    console.log('✓ File uploaded successfully!');

    // Generate public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${testPath}`;
    console.log(`\nPublic URL: ${publicUrl}`);

    // List files in bucket
    console.log('\nListing all files in bucket:');
    console.log('-'.repeat(80));

    const [files] = await bucket.getFiles();
    
    if (files.length === 0) {
      console.log('No files found in bucket.');
    } else {
      files.forEach((f, index) => {
        console.log(`${index + 1}. ${f.name}`);
        console.log(`   Size: ${(f.metadata.size / 1024).toFixed(2)} KB`);
        console.log(`   Content Type: ${f.metadata.contentType}`);
        console.log(`   URL: https://storage.googleapis.com/${bucketName}/${f.name}`);
        console.log('');
      });
    }

    console.log('='.repeat(80));
    console.log('Test Complete!');
    console.log('='.repeat(80));
    console.log('\nYour GCP credentials are working correctly.');
    console.log('You can now upload images through the application.\n');

  } catch (error: any) {
    console.error('\n' + '='.repeat(80));
    console.error('✗ Error during GCP upload test');
    console.error('='.repeat(80));
    console.error(`\nError: ${error.message}`);
    
    if (error.code === 'ENOENT') {
      console.error('\nGCP credentials file not found!');
      console.error('Please check that GCP_SERVICE_ACCOUNT_KEY in .env.local is correct.');
    } else if (error.code === 403) {
      console.error('\nPermission denied!');
      console.error('Please check that your service account has the "Storage Admin" role.');
      console.error(`Service Account: ${JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY || '{}').client_email}`);
    } else if (error.code === 404) {
      console.error('\nBucket not found!');
      console.error(`Bucket Name: ${bucketName}`);
      console.error('Please create the bucket first using: npm run create-bucket');
    } else {
      console.error('\nFull error:', error);
    }
    
    console.error('\n' + '='.repeat(80));
    process.exit(1);
  }
}

testGCPUpload();
