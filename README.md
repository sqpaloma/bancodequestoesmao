Product Requirements Document (PRD)

1. Overview

1.1 Objective

This document outlines the initial scope and key requirements for the
development of the "Banco de Questões" web application. The purpose of this app
is to provide an organized platform for students and professionals to practice
questions, track progress, receive instant feedback, and manage content via an
administrative area. A landing page will also be included for user acquisition,
registration, payment processing, and redirection to the application.

1.2 Technology Stack

Frontend: Next.js

Backend: Convex

Authentication: Clerk

Payment Processing: Third-party provider (TBD)

2. Scope of the Project

2.1 Core Features (Mandatory)

2.1.1 Landing Page

Introduction to the product (Banco de Questões).

Explanation of benefits and key features.

User registration and login flow.

Payment processing for subscriptions or licenses.

Redirection to the application upon successful payment.

2.1.2 Authentication & User Management (using Clerk)

Email/password authentication.

Single active session per user (automatic session termination on new login).

2.1.3 Responsive Design

Fully responsive web application for mobile, tablet, and desktop.

2.1.4 Content Organization

Question bank structured by themes,subthemes and groups (under subthemes).

Admins can create predefined themes,subthemes and groups.

Users can create custom study quizzes.

Each module will track user progress and completed questions.

2.1.5 Question Presentation & Answering

Display one question at a time.

Instant feedback on correct/incorrect answers (on study mode) otherwise progress
imediately on exam mode.

Explanations for correct and incorrect responses only on study mode.

2.1.6 Progress Tracking

Tracks user completion of each question.

Displays the number of questions completed and remaining.

2.1.7 Dashboard & Statistics

Shows the percentage of correct answers.

Displays progress in the current module.

2.1.8 Admin Panel

Management of questions, answers, categories, and modules.

Image upload support (via CDN, up to 10 GB storage limit).

2.1.9 Payment Integration (using MercadoPago API)

Setup for receiving payments for subscriptions or licenses.

Integration with the landing page to facilitate onboarding.

2.2 Question Structure & Module Features

2.2.1 Question Structure

Each question consists of:

Statement: The main question text.

Options: Multiple-choice answers.

Correct Answer: Defined answer key.

Theme, Subtheme and Group: Only theme is mandatory.

2.2.2 Quiz Types

Preset Quizzes: Created by administrators. Preset Quizzes can be either
Simulador Or Trilha (exam or study mode respectively)

Custom Quizzes: Created by users (individual use). Private to the user who
created them.

Past Exams Screen: User can retry same quiz for improvement.

2.2.3 Quiz Functionality

Users progress through questions sequentially.

System records accuracy and progress on the server (it must sync on any device).

2.2.4 Study vs. Simulation Modes

Study Mode: Immediate answer feedback.

Simulation Mode: No feedback until the entire module is completed.
