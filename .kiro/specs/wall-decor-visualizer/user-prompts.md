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
use kebab case for folder names and snake case for file names. page service will have domains which will be calling other data aservice to create UI for the page. page is ui being shown to the user. no helpers / manager file should exist in code base, no generic files that can house any code. as a rule remember we have to keep code clean, avoid imported interfaces from domain to application folder. share less code between domain and application. if 4-5 parameters have to be passed in an api use decontructed list only, dont try to make objects for everything. for api resposena dn request from external clients an object with defined type will always exsits.  

---

## Testing Strategy & Continuous Testing

**Prompt 14:**
> crete a file for tesitng stratergy as well, we will also do heavey test driven developement , so all use cases are always covered, any time a test breaks or user reports abug a heavey analysis will be done to figure out why that bug happened and how we could imporve the testing so bug woul dhave not happened. We will also try to run test cases as an when possible , every 6 hours for sure ,so create a seperate file to maintain that as well

---

## Session 2: Project Setup & UI Implementation

**Prompt 17 (2026-03-04):**
> okay lets move with setup, guide me what all to do next

**Prompt 18 (2026-03-04):**
> mongodb+srv://username:password/?appName=Cluster0

**Prompt 19 (2026-03-04):**
> GCP Bucket Name : wall-decor-visualizer-images

**Prompt 20 (2026-03-04):**
> mkdir -p wall-decor-visualizer/backend wall-decor-visualizer/frontend

**Prompt 21 (2026-03-04):**
> yes only work on login page and upload page for now - we also have to make a beautiful ui which we have not discussed yet, also save prompts dont see that happening

---

## Key Decisions Made

### Session 2 Decisions:
1. **Focus on Login & Upload Pages** - Prioritize these two pages for initial implementation

2. **Beautiful UI Design** - Created comprehensive UI design system with:
   - Color palette (Purple gradient theme)
   - Typography standards
   - Spacing and sizing guidelines
   - Component specifications
   - Responsive design breakpoints
   - Accessibility standards

3. **Project Structure Created:**
   - Backend: DDD architecture with data-service and page-service
   - Frontend: React + Vite with matching DDD structure
   - Environment files configured with all credentials
   - Beautiful login page with gradient background
   - Drag-and-drop upload page with progress tracking

4. **Prompt Logging System** - Set up automatic hook to log all user prompts

**UI design instructions (2026-03-04):**
> check urbancompany.com website and create UI design file form there
also add laets sublte animation and transaition in UI to make the ui feel premium and rich, use light paster colors and make it evidently please to the customer -- should i geive example of please designs ?
[Image with 6 pastel colors: #97B3AE, #D2E0D3, #F0DDD6, #F2C3B9, #D6CBBF, #F0EEEA]. try to keep background white as much as possible and use colors on elements only

---

## Premium Design Aesthetic Reference

**Prompt 15:**
> Animations
Elastic button hover effects with scale and shadow
Smooth fade-in animations on page load (0.6s - 0.8s)
Staggered form field animations (0.1s - 0.4s delays)
Floating background elements with 20-25s animations
Gradient underlines on links with smooth width transitions
Soft glow effects on input focus
Cubic-bezier easing (0.34, 1.56, 0.64, 1) for smooth, elastic feel
Micro-interactions on all interactive elements


---

## UI Visual Mockup Request

**Prompt 16:**
> can you show an html how ui may look like ?


---

## Authentication Method Change

**Prompt 17:**
> requirement change - user phone number and fixed otp - 2213 for login

---

## Color Palette Refinement - Dull Pastels

**Prompt 18:**
> animation are looking good, instead of cyna range could you do more pastel range - green pink blue yellow pastels
> uset this color pallete for ui design
> [Image with 6 pastel colors: #97B3AE, #D2E0D3, #F0DDD6, #F2C3B9, #D6CBBF, #F0EEEA]

---

## Session 3: UI Implementation & Testing

**Prompt 19 (2026-03-04):**
> ui mick up looking good lets go to implement login page first and write test cases for it -- want to understand test cases in english whata ll you are planning to write as test cases

**Prompt 22 (2026-03-04):**
> create a branch ila/implementation

**Prompt 23 (2026-03-04):**
> create implement-phase-quidelines.md for login page and we will exectute tasks one by one

**Prompt 24 (2026-03-04):**
> RUn for manual testing

## Query 108
**Timestamp**: 2026-03-05
**User Message**: push all changes

## Query 110
**Timestamp**: 2026-03-05
**User Message**: raise MR for master


## Query 111
**Timestamp**: 2026-03-05
**User Message**: create new branch  ila/implementation2


## Query 128
**Timestamp**: 2026-03-05
**User Message**: forget all previous context. Start fresh. Read global-setup folder and understand rules - read requierments.md to understand whay we are building.

## Query 114
**Timestamp**: 2026-03-05
**User Message**: lets do what implement.md is saying. For a new change that we have to make.








## Query 129
**Timestamp**: 2026-03-05
**User Message**: add all task in feature_task.md


## Query 130
**Timestamp**: 2026-03-05
**User Message**: there was a prohibition to create anu other folder than data-service and page-service but you created another folder-- why ?

## Query 131
**Timestamp**: 2026-03-05
**User Message**: check you didnt create it ? because no one els wrote code here

## Query 132
**Timestamp**: 2026-03-05
**User Message**: cann you check in backend folder what is not right as per DDD rules

## Query 133
**Timestamp**: 2026-03-05
**User Message**: fix

## Query 134
**Timestamp**: 2026-03-05
**User Message**: continue


## Query 135
**Timestamp**: 2026-03-05
**User Message**: after login page is showing only loading... nothin happens page reamins black


## Query 136
**Timestamp**: 2026-03-05
**User Message**: stuck here - nothing happened
