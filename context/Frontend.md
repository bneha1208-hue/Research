# LegalPrecedent -- Frontend Documentation

## 1. Frontend Overview

The frontend of **LegalPrecedent** provides an interactive interface for
lawyers and legal researchers to search and explore previous court
cases. It allows users to enter details of their current case, find
similar cases, compare cases, and view judgments.

## 2. Technologies Used

-   HTML5 -- Page structure
-   CSS3 -- Styling and responsive design
-   JavaScript -- User interaction
-   React.js -- Frontend development and reusable components
-   Bootstrap/Tailwind CSS -- UI design

## 3. Frontend Pages

### 3.1 Landing Page

-   Project introduction
-   Features
-   Login and Register options
-   Get Started button

### 3.2 Login Page

-   Email/Username
-   Password
-   Login button
-   Forgot Password option

### 3.3 Registration Page

-   Name
-   Email
-   Password
-   Confirm Password
-   User type

### 3.4 Dashboard

-   New Case Search
-   Recent Searches
-   Saved Cases
-   User Profile

### 3.5 Case Search Page

Users enter: - Case description - Offence - Court - Location - Legal
provisions

The system uses these details to search for relevant previous cases.

### 3.6 Search Results Page

Displays: - Previous case name - Court - Year - Location - Legal
provisions - Similarity score - View Case - Compare - Save

### 3.7 Filters

Users can filter cases based on: - Court - Year - Location - Legal
provision

### 3.8 Why Similar?

This section explains why a previous case is relevant by showing factors
such as: - Offence - Weapon - Location - Victim - Circumstances

### 3.9 Case Comparison

Allows users to compare the current case with previous cases
side-by-side, including their facts and decisions.

### 3.10 Judgment View

Displays: - Case facts - Legal provisions - Court reasoning - Final
decision

### 3.11 Saved Cases

Users can save important cases and access them later for further
research.

## 4. Frontend Workflow

**Login → Dashboard → Enter Case → Search Similar Cases → Search Results
→ Filter → Why Similar? → Compare Cases → View Judgment → Save Case**

## 5. Main UI Components

-   Navigation Bar
-   Sidebar
-   Search Bar
-   Case Input Form
-   Case Cards
-   Filter Panel
-   Similarity Score
-   Comparison Table
-   Judgment Viewer
-   Save Button

## 6. Responsive Design

The frontend is designed to work on:

-   Desktop
-   Laptop
-   Tablet
-   Mobile

## 7. Frontend Validation and Testing

The frontend should be tested for:

-   Login and registration
-   Case form validation
-   Case searching
-   Filtering
-   Case comparison
-   Judgment viewing
-   Saving cases
-   Responsive layout

## 8. Frontend Limitation

The prototype initially uses a limited demo dataset rather than the
complete Indian judgment database. The frontend also presents research
information and does not guarantee that a retrieved case is legally
applicable to a particular matter.

## 9. Expected Frontend Outcome

The frontend provides a simple and organized interface that helps users
move from **entering a case to finding, understanding, comparing, and
viewing relevant previous cases** efficiently.
