# LegalPrecedent – Project Documentation

## 1. Problem Statement

Lawyers face difficulty in quickly finding and comparing previous cases that are factually and legally similar to the case they are currently handling.

**For example:** If a lawyer is handling a robbery case involving a knife and a jewellery shop, they may need to find similar cases from the Madras High Court or other Indian courts and study the judgments given in those cases.

## 2. Target Users

**Primary Users:** Lawyers and advocates who need to research previous judgments for case preparation and legal strategy.

**Secondary Users:** Legal researchers, law students, law firms, and legal interns.

## 3. Product Overview / Proposed Solution

**LegalPrecedent** is a legal research platform that helps lawyers discover previous cases similar to the case they are currently handling. The lawyer can enter a case description along with details such as offence, court, location, and relevant legal provisions. The system analyzes important case factors and ranks relevant previous cases based on their similarity. It also allows the lawyer to understand why a case is considered similar, compare cases side-by-side, and view relevant judgment and court decision details.

## 4. Key Features

1. **Case Description & Search** — Lawyers can enter their current case and search for relevant precedents.
2. **Similar Case Discovery** — Finds and ranks previous cases based on factual and legal factors.
3. **Why Similar?** — Shows the factors that make a previous case relevant.
4. **Case Comparison** — Allows lawyers to compare cases side-by-side.
5. **Judgment & Decision View** — Displays case facts, legal provisions, court reasoning, and final decision.
6. **Filters & Saved Cases** — Allows filtering by court, year, location, and legal provision and saving useful cases.

## 5. User Stories / Use Cases

### Use Case 1 – Finding Similar Cases
> As a lawyer, I want to enter the details of my current robbery case, so that I can find previous cases with similar facts and legal circumstances.

### Use Case 2 – Understanding Relevance
> As a lawyer, I want to know why a previous case is considered similar to mine, so that I can quickly decide whether it is relevant to my legal research.

### Use Case 3 – Comparing Judgments
> As a lawyer, I want to compare my case with previous cases and their court decisions, so that I can better understand how similar cases were decided.

## 6. Success Metrics

- **≥ 80% relevant results:** At least 8 out of 10 top-ranked demo cases should be judged relevant by test users.
- **≤ 3 minutes:** A user should be able to enter a case and identify a relevant previous case within 3 minutes.
- **≥ 80% task completion:** At least 8 out of 10 test users should successfully complete the workflow: Enter Case → Find Similar Case → Compare → View Judgment.

These are prototype targets, not claims about real-world legal accuracy.

## 7. Assumptions & Constraints

### Assumptions
- Lawyers are willing to enter a short description of their current case.
- Previous judgments can be obtained from reliable and legally permitted sources.
- Important case factors can be extracted from case information.
- Users will treat the platform as a research assistance tool, not as a replacement for professional legal judgment.

### Constraints
- The project has a 3-member development team.
- Limited development time and budget.
- The prototype will initially use a limited demo dataset rather than the complete Indian judgment database.
- Full-scale AI/NLP similarity may require more data, computing resources, and testing.
- Legal data licensing, copyright, accuracy, and source verification must be considered before real-world deployment.
- The prototype cannot guarantee that a retrieved case is legally applicable to a particular matter.

## 8. Timeline / Milestones

| Milestone | Activities | Rough Timing |
|---|---|---|
| **1. Research & Planning** | Study existing platforms, define users, collect sample cases, design workflow and database | Week 1 |
| **2. Core Development** | Build frontend, backend, database, login, and case-search functionality | Weeks 2–3 |
| **3. Similarity & Comparison** | Implement demo similarity engine, ranking, Why Similar, and case comparison | Weeks 4–5 |
| **4. Testing & Presentation** | Testing, UI improvements, documentation, demo preparation, and final presentation | Week 6 |

## 9. Risks & Open Questions

### Risks
- **Legal data availability:** Obtaining a sufficiently large and legally usable case dataset may be difficult.
- **Incorrect similarity:** Similar keywords do not always mean similar legal facts.
- **Legal accuracy:** The system may rank a case as relevant even when a lawyer should not rely on it.
- **Data licensing:** Court judgments and legal databases may have different access and usage conditions.
- **Limited prototype dataset:** A small dataset may not represent the diversity of real legal cases.
- **AI limitations:** NLP/AI may misunderstand complex legal language or context.

### Open Questions
- What is the best method for calculating case similarity?
- Which authoritative and legally permitted sources should provide the case data?
- Should similarity be based more heavily on facts, legal provisions, or court decisions?
- How can the system explain its similarity results in a way that lawyers can trust?
- How should the system handle changes in laws, such as the transition from IPC to BNS?
- How can we validate the system's results with legal professionals?

# Figma UI Prototype

## Screen 1 – Login / User Verification
- LegalPrecedent logo/title
- Email ID or phone number
- OTP verification
- User name
- Continue button

## Screen 2 – Select User Type
The user selects one:
- Student
- Lawyer
- Legal Advisor

## Screen 3 – Case Details
The user enters:
- Applicable law
- Relevant Article/Section
- Case description
- Reason for searching similar cases

## Screen 4 – Matching Cases
The system displays:
- Number of matching cases
- Similarity percentage
- Case names
- Court
- Year
- Relevant legal provisions
- Short case summary

## Screen 5 – Case Details / Judgment
When the user selects a case, the platform displays:
- Case information
- Facts
- Legal issues
- Arguments
- Court reasoning
- Final decision
- Relevant legal provisions
- Judgment/source information

## Screen 6 – Case Comparison
The user can compare the current case with selected previous cases using:
- Case facts
- Legal provisions
- Court
- Year
- Key circumstances
- Court reasoning
- Final decision

## Prototype Disclaimer

> LegalPrecedent is a research assistance prototype. It does not provide legal advice, predict court outcomes, or replace professional legal judgment. Demo cases are fictional unless linked to an official source.
