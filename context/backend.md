> **BACKEND – LEGALPRECEDENT**

**1. User Table**

The User Table stores the details of users who access the platform.

Fields:

- User_ID (PK)

- Name

- Email

- Password

- Role

Role: Lawyer, Legal Researcher, Law Student, Law Firm, or Legal Intern.

**2. Case Table**

The Case Table stores the details of the current case entered by the
user.

Fields:

- Case_ID (PK)

- Case_Description

- Offence

- Location

- Court

- Legal_Provision

The case description can be entered in simple language by the lawyer.

**3. Court Table**

The Court Table stores information about the courts related to the
cases.

Fields:

- Court_ID (PK)

- Court_Name

- Location

- Court_Level

Example: Madras High Court, other Indian courts.

**4. Legal Provision Table**

The Legal Provision Table stores the legal provisions related to a case.

Fields:

- Provision_ID (PK)

- Law_Name

- Section

- Article

- Description

This table can store relevant provisions such as BNS sections or
Constitutional Articles.

**5. Judgment Table**

The Judgment Table stores the judgment details of previous cases.

Fields:

- Judgment_ID (PK)

- Case_ID (FK)

- Case_Facts

- Legal_Provisions

- Court_Reasoning

- Final_Decision

This table helps users view the relevant judgment and court decision.

**6. Similar Case Table**

The Similar Case Table stores the relationship between the current case
and previous similar cases.

Fields:

- Similarity_ID (PK)

- Current_Case_ID (FK)

- Previous_Case_ID (FK)

- Similarity_Score

- Matching_Factors

The Matching_Factors can include offence, facts, location, victim,
weapon, and other circumstances.

The Similarity_Score is used to rank the most relevant previous cases.

**7. Backend Process**

1.  The lawyer enters the current case description.

2.  The system stores the case details.

3.  The system identifies important case factors such as offence, facts,
    court, location, and legal provisions.

4.  The system searches the previous case data.

5.  Similar cases are identified and ranked based on their similarity.

6.  The system stores the similarity score and matching factors.

7.  The user can compare the current case with previous cases.

8.  The system displays the case facts, legal provisions, court
    reasoning, and final decision.

**8. Primary Key and Foreign Key**

**Primary Key (PK):**  
A Primary Key uniquely identifies each record in a table.

**Foreign Key (FK):**  
A Foreign Key connects one table with another table using the Primary
Key of another table.

**Example:**

Case_ID (PK) → Case Table

Case_ID (FK) → Judgment Table

This connects the case with its judgment.

**9. Main Backend Purpose**

The backend is responsible for storing, managing, searching, ranking,
and retrieving legal case information.

The main goal is to help lawyers quickly identify relevant previous
cases and understand why those cases are similar to the current case.

The platform is a legal research assistance tool and does not replace
professional legal judgment.

CASE DETAILS

↓

Receive User Input

↓

Store in Case Database

↓

Extract Case Factors

↓ ↓ ↓

Offence Location Court

↓ ↓ ↓

Legal Provisions / Facts

↓

Search Previous Cases

↓

Similarity Calculation

↓

Similarity Score

↓

Rank Similar Cases

↓

Store Matching Factors

↓

Retrieve Judgment Data

↓

Send Data to Frontend
