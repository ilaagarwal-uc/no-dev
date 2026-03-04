# User Prompts Log

This file contains all prompts and requirements provided by the user during the specification and design process.

---

## Initial Feature Description

**Prompt 1:**
> trying to build an app for take an image and mark dimension on it . once dimensions are marked , run a prompt that generates a blender script which will show the 3d model in space wher eyou can do variuos actions on that blender model, like spin it around, zoom in out , it will also show the list of other 3d model that can be applied on this base model that has been generated and by dragging and dropping from a side bar that has a catalog .  we will add more feature later on for auto adding 

---

## Material Quantity Calculation Feature

**Prompt 2:**
> along with applying them to base model, we will aslo have engines that will calculate exactly how much of item is needed. eg: if a 4 ft by 3ft section is marked where panle a will be put, number of panels neded will be total 3 since size on one panel is 4ft by 1 ft, similary we wil do this for bidding , lights , cove etc

---

## Backend Architecture Specification

**Prompt 3:**
> we will be using backend to save images , call gemini api for LLM give LLM prompt as an input , run blender in headless mode on a web url

---

## Image Upload Interaction

**Prompt 4:**
> **User Story:** As a user, I want to upload an image of a wall to the backend server, so that it can be stored securely and used for generating a 3D model.   user can click n image

---

## Camera Capture Feature

**Prompt 5:**
> user can also take and image by opening the camera view - they should have both options capture a image using caemra and uploading image from  images in camera roll 

---

## GCP Storage Integration

**Prompt 6:**
> we will use gcp to store the imges

---

## Authentication Requirement

**Prompt 7:**
> user also has to login to this weburl first, once logged in login should be persisted , this will be a web url

---

## Database Technology Choice

**Prompt 8:**
> use mongo for database

---

## Remove Redis

**Prompt 9:**
> no need for redis as cache

---

## Setup File Creation

**Prompt 11:**
> Create file for setup , later on we will move setup to an already build enterprise microservice post demo

---

## User Prompts Logging

**Prompt 12:**
> also want to create a file where all prmpts i am writing are getting stored - only what i am writing not what you are replying

---

## Architecture file 

**Prompt 12:**
> also want to create a file for defining best coding practices and file structure

## Code Structure Definition

**Prompt 13:**
> Use this image to see how code will be structured. For folder structure with in source ith in source i will make a data-service and a page-service . For each service api call will happen , no directs imports between both. With each service we will have two folders application and domain . application will have all api files - each for for each api that an client can call for this in domain there will be folders that are core domains , each domain will hvae 1 index file, 1 interface file . Application will not be allowed to call any other domain other than its own domain. domain will also have schema files.

---

## Testing Strategy & Continuous Testing

**Prompt 16:**
> crete a file for tesitng stratergy as well, we will also do heavey test driven developement , so all use cases are always covered, any time a test breaks or user reports abug a heavey analysis will be done to figure out why that bug happened and how we could imporve the testing so bug woul dhave not happened. We will also try to run test cases as an when possible , every 6 hours for sure ,so create a seperate file to maintain that as well

