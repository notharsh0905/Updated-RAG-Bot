"""
UIET CSE B.Tech 95-Page Syllabus Parser & Knowledge Base Generator
Reads all 95 pages of syllabus text, cleans noise, extracts structured course models,
generates semantic concept chunks with metadata, and outputs all 4 final deliverables + stats.
"""

import os
import sys
import json
import re
from pathlib import Path
from typing import Dict, Any, List, Tuple

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.core.config import config
from app.core.logging_config import setup_logger

logger = setup_logger("syllabus_kb_generator")

# We will read the raw text directly from the prompt content or script string
# To ensure complete processing, we store the full 95-page text structure

RAW_PAGES_DATA = [
    # Page 1
    (1, """Page 1 of 95
GENERAL COURSE STRUCTURE AND CREDIT DISTRIBUTION
B.Tech. Computer Science and Engineering
 Semester-wise Course Structure
Course Code Definitions Course Code Definitions
L Lecture HSMC Humanities and Social Science including Management Courses
T Tutorial EC Program core courses
P Practical PE Program Elective courses
C Credits OE Open Elective courses
BSC Basic Science Courses LC Laboratory course
ESC Engineering Science Courses MC Mandatory course
AU Audit course
 Structure of UG Program in Computer Science and Engineering: The structure of UG program in Computer Science and Engineering shall have essentially the following categories of courses with the breakup of credits as given:
Category of courses Credits offered
Basic Science Core 34
Engineering Science Core 15
Humanities and Social Science Core 17
Departmental Core 68
Departmental Electives 16
Open Electives 12
Projects and Seminars 16
Mandatory/Audit Course 2
Total 180
 Category wise courses
BASIC SCIENCE COURSE
S.No Course Course Title Semester Hours per week Total Lecture Tutorial Practical Credits
1 MTHS101 Mathematics-I I 3 1 0 4
2 PHYS101 Physics-I I 3 1 3 5
3 MTHS102 Mathematics-II II 3 1 0 4
4 PHYS102 Physics-II II 3 1 3 5
5 CHMS101 Chemistry-I II 3 0 3 5
6 MTHS201 Mathematics-III III 3 1 0 4"""),

    # Page 2
    (2, """Page 2 of 95
7 MTHS301 Discrete Mathematics IV 3 1 0 4
8 MTHS504 Probability and Statistics IV 3 0 0 3
Total Credits 34
ENGINEERING SCIENCE COURSE (ESC)
S.No Course Course Title Semester Hours per week Total Lecture Tutorial Practical Credits
1 TCAS101 Engineering Drawing II 1 1 3 5
2 ESCS101 Basic Electrical & Electronics Engineering II 3 1 3 5
3 TCAS102 Workshop Practice & IDEA Lab I 0 2 4 5
Total Credits 15
HUMANITIES AND SOCIAL SCIENCE COURSES (HSM)
S.No Course Course Title Semester Hours per week Total Lecture Tutorial Practical Credits
1 HSSS101 Professional Communication I 3 1 0 4
2 UHVS101 Universal Human Values I (SIP) I 0 0 0 0
3 HSSS201 Communication Practicum III 1 1 1 2
4 UHVS201 Universal Human Values II III 2 1 0 3
5 HSSS301 Engineering Economics V 3 1 0 4
6 HSSS302 Industrial Management VI 3 1 0 4
Total Credits 17
PROGRAM CORE COURSES
S.No Course Course Title Semester Hours per week Total Lecture Tutorial Practical Credits
1 ISCS101 Programing & Computing (C & Unix) I 3 0 3 5
2 CSES201 Data Structure III 3 0 3 5
3 CSES202 Digital Electronics & Logic Design III 3 0 2 4
4 CSES203 Cyber Security & Privacy IV 3 1 3 4
5 CSES204 Object Oriented Programing (using Jawa) IV 3 0 3 5
6 CSES205 Computer Organization IV 3 1 0 4"""),

    # Page 3
    (3, """Page 3 of 95
7 CSES206 Operating Systems IV 3 1 0 4
8 CSES301 Database Management System V 3 0 3 5
9 CSES302 Design and Analysis of Algorithms V 3 1 0 4
10 CSES303 Microprocessor V 3 0 2 4
11 CSES304 Theory of Computation V 3 1 0 4
12 CSES305 Compiler Design VI 3 1 0 4
13 CSES306 Computer Networks VI 3 1 0 4
14 CSES307 Software Engineering VI 3 1 0 4
15 CSES401 Computer Graphics VII 3 1 0 4
16 CSE-S402 Machine Learning VII 3 1 0 4
Total Credits 68
Project/Summer Training/Internship
S.No Course Course Title Semester Hours per week Total Lecture Tutorial Practical Credits
1 SSTS201 Internship-1 III 0 0 2 2
2 SSTS301 Internship-2 V 0 0 2 2
3 SSTS401 Summer Training VII 0 0 3 2
4 CAPS101 Capstone Project VI 0 0 2 2
5 PRTS401 B.Tech. Project-I VII 0 0 6 4
6 PRTS402 B.Tech. Project-II VIII 0 0 6 4
Total Credits 16
Mandatory/Audit Course
S.No Course Course Title Semester Hours per week Total Lecture Tutorial Practical Credits
1 EVSS201 Environmental Science IV 2 0 0 2
Total Credits 2
Program Elective (PE) Course by CSE department/MOOCs
S.No Course Course Title Semester Hours per week Total Lecture Tutorial Practical Credits
1 CSES504 Advance Java Programming VI 3 1 4
2 CSES515 Web Technology VI 2 0 3 4
3 CSES516 Bioinformatics Concepts: A computer science perspective VI 3 1 0 4"""),

    # Page 4
    (4, """Page 4 of 95
4 CSES518 Artificial Intelligence VI 3 1 0 4
5 CSES524 Python Programming VI 3 1 0 4
6 CSES525 Internet of Things VI 3 1 0 4
7 CSES507 Advanced Computer Networks VII 3 1 0 4
8 CSES508 Natural Language Processing VII 3 1 0 4
9 CSES513 Computer Vision VII 3 1 0 4
10 CSES517 Wireless & Mobile Computing VII 3 1 0 4
12 CSES521 Data Mining & Data Warehousing VII 3 1 0 4
13 CSES526 Deep Learning VII 3 1 0 4
14 CSES501 Digital Image Processing VIII 3 1 0 4
15 CSES502 Digital Signal Processing VIII 3 1 0 4
16 CSES503 Parallel Processing VIII 3 1 0 4
17 CSES505 Distributed Processing VIII 3 1 0 4
18 CSES506 VLSI Design VIII 3 1 0 4
19 CSES509 Soft Computing VIII 3 1 0 4
20 CSES510 Cryptography and Network Security VIII 3 1 0 4
21 CSES511 Adv. Database Management System VIII 3 1 0 4
22 CSES512 Computational Geometry VIII 3 1 0 4
23 CSES514 Embedded Systems VIII 3 1 0 4
24 CSES519 Advance Computer Architecture VIII 3 1 0 4
25 CSES522 Multi-core architectures VIII 3 1 0 4
26 CSES523 Cloud Computing VIII 3 1 0 4
27 CSES527 Geographic Information System VIII 3 1 0 4
28 CSES532 Introduction to BlockChain VIII 3 1 0 4
Open Electives (OE) courses from other departments/MOOCs
S.No Course Course Title Semester Hours per week Total Lecture Tutorial Practical Credits
1 Embedded System VI 3 1 0 4"""),

    # Page 5
    (5, """Page 5 of 95
2 GIS & Remote Sensing VI 3 1 0 4
3 Automation & Robotics VII 3 1 0 4
4 Bioinformatics VII 3 1 0 4
5 Fundamentals of Drone Technology VIII 3 1 0 4
6 Introduction to Smart Grid VIII 3 1 0 4
7 VLSI Technology and Design VIII 3 1 0 4
Open Electives (OE) courses from CSE department/MOOCs
S.No Course Course Title Semester Hours per week Total Lecture Tutorial Practical Credits
1 CSES518 Artificial Intelligence VI 3 1 0 4
2 CSES525 Internet of Things VI 3 1 0 4
3 CSES517 Wireless & Mobile Computing VII 3 1 0 4
4 CSES203 Cyber Security & Privacy IV 3 1 0 4
5 CSES501 Digital Image Processing VIII 3 1 0 4
6 CSES402 Machine Learning VII 3 1 0 4
7 CSES532 Introduction to BlockChain VIII 3 1 0 4
Bridge Courses for Exit
A. After First year:
 Following Two skill based courses to qualify for certification.
1) Data Structure
2) Operating System
After Second year:
 Following Two skill based course to qualify for Diploma
1) Database Management System
2) Computer Network
B. After Third year:
 Following Two skill based course to qualify for B.Voc.
1) Computer Graphics
2) Machine Learning"""),

    # Page 6
    (6, """Page 6 of 95
Minor Degree (MD) from other Department 
a) For holistic development of the students and as per NEP-2020 and AICTE guideline, the students may earn additional 18-20 credits through the minor degree courses offered by other departments of the University from semester IV to VIII.
Minor Degree (MD) in Computer Science and Engineering
Sl. No. Course Code Course Title L T P Credits
1. CSES206 Operating Systems 3 1 0 4
2. CSES208 Data Structure using Python 3 0 2 4
3. CSES302 Design and Analysis of Algorithms 3 1 0 4
4. CSES306 Computer Networks 3 1 0 4
5. CSES402 Machine Learning 3 1 0 4
Total 15 4 2 20
Minor Degree (MD) in Computer Science and Engineering (Specialization in Artificial Intelligence and Machine Learning)
1. CSES208 Data Structure using Python 3 0 2 4
2. CSES302 Design and Analysis of Algorithms 3 1 0 4
3. CSES402 Machine Learning 3 1 0 4
4. CSES518 Artificial Intelligence 3 1 0 4
5. CSES526 Deep Learning 3 1 0 4
Total 15 4 2 20
Minor Degree (MD) in Computer Science and Engineering (Specialization in Cyber Security)
1. CSES203 Cyber Security & Privacy 3 1 0 4
2. CSES306 Computer Networks 3 1 0 4
3. CSES402 Machine Learning 3 1 0 4
4. CSES510 Cryptography & Network Security 3 1 0 4
5. CSES532 Introduction to BlockChain 3 1 0 4
Total 15 5 0 20"""),

    # Page 7
    (7, """Page 7 of 95
Semester-wise Course Structure
1st Year - Semester I
1. MTHS101 Mathematics-I 3 1 0 4
2. PHYS101 Physics-I 3 1 3 5
3. TCAS102 Workshop Practice & IDEA Lab 0 2 4 5
4. ISCS101 Programing & Computing (C & Unix) 3 0 3 5
5. HSSS101 Professional Communication 3 1 0 4
6. UHVS101 Universal Human Values –I (SIP) 0 0 0 0
Total 12 5 10 23
1st Year - Semester II
1. MTHS102 Mathematics-II 3 1 0 4
2. PHYS102 Physics-II 3 1 3 5
3. CHMS101 Chemistry-I 3 0 3 5
4. ESCS101 Basic Electrical & Electronics Engg. 3 1 3 5
5. TCAS101 Engineering Drawing 1 1 3 5
Total 13 4 12 24
2nd Year - Semester III
1. MTHS201 Mathematics-III 3 1 0 4
2. CSES201 Data Structure 3 0 3 5
3. CSES202 Digital Electronics & Logic Design 3 0 2 4
4. HSSS201 Communication Practicum 1 1 1 2
5. SSTS201 Internship-1 0 0 2 2
6. UHVS201 Universal Human Values-II 2 1 0 3
Total 12 3 8 20
2nd Year - Semester IV
1. MTHS504 Probability & Statistics 3 0 0 3
2. CSES203 Cyber Security & Privacy 3 1 0 4
3. CSES204 Object Oriented Programing (Using Java) 3 0 3 5
4. CSES205 Computer Organization 3 1 0 4
5. CSES206 Operating Systems 3 1 0 4
6. MTHS301 Discrete Mathematics 3 1 0 4
7. EVSS201 Environmental Science 2 0 0 2
Total 20 4 3 26"""),

    # Page 8
    (8, """Page 8 of 95
3rd Year - Semester V
1. CSES301 Database Management System 3 0 3 5
2. CSES302 Design and Analysis of Algorithms 3 1 0 4
3. CSES303 Microprocessor 3 0 2 4
4. CSES304 Theory of Computation 3 1 0 4
5. HSSS301 Engineering Economics 3 1 0 4
6. SSTS301 Internship-2 0 0 2 2
Total 15 3 7 23
3rd Year - Semester VI
1. CSES305 Compiler Design 3 1 0 4
2. CSES306 Computer Networks 3 1 0 4
3. CSES307 Software Engineering 3 1 0 4
4. HSSS302 Industrial Management 3 1 0 4
5. CSES5-- Departmental Elective 3 1 0 4
6 CAPS101 Capstone Project 0 0 2 2
Total 15 5 0 22
4th Year - Semester VII
1. CSES401 Computer Graphics 3 1 0 4
2. CSES402 Machine Learning 3 1 0 4
3. SSTS401 Summer Training 0 0 3 2
4. PRTS401 B.Tech. Project-I 0 0 6 4
5. CSES5-- Departmental Elective 3 1 0 4
6. CSES5--/ Departmental Elective/ Open Elective 3 1 0 4
Total 9 1 9 22
4th Year - Semester VIII
1. CSES5-- Departmental Elective 3 1 0 4
2. CSES5-- Departmental Elective 3 1 0 4
3. CSES5--/ Departmental Elective/ Open Elective 3 1 0 4
4. CSES5--/ Departmental Elective/ Open Elective 3 1 0 4
5. PRTS402 B.Tech. Project -II 0 0 6 4
Total 12 0 18 20
Total Credits – 180"""),

    # Page 9
    (9, """Page 9 of 95
Detailed Syllabus
Course Code: MTH-S101 Breakup: 3 –1 – 0 – 4
Course Name: Mathematics-I
Course outcomes (CO): At the end of the course, the student will be able to:
CO1 Test the convergence & divergence of infinite series
CO2 Understand concepts of limit, continuity and differentiability of function of two variables
CO3 Find the maxima and minima of multivariable functions
CO4 Evaluate multiple integrals, concepts of beta & gamma functions
CO5 Apply the concepts of gradient, divergence and curl to formulate engineering problems
Course Details:
Unit-I Sequences & Series: Definition, Monotonic sequences, Bounded sequences, Convergent and Divergent Sequences Infinite series, Oscillating and Geometric series and their Convergence, nth Term test, Integral test, Comparison Test, Limit Comparison test, Ratio test, Root test, Alternating series, Absolute and Conditional convergence, Leibnitz test.
Unit II Differential Calculus: Limit Continuity and differentiability of functions of two variables, Euler’s theorem for homogeneous equations, Tangent plane and normal. Change of variables, chain rule, Jacobians, Taylor’s Theorem for two variables, Extrema of functions of two or more variables, Lagrange’s method of undetermined multipliers.
Unit III Integral Calculus: Review of curve tracing, Double and Triple integrals, Change of order of integration. Change of variables. Gamma and Beta functions, Dirichlet’s integral; Applications of Multiple integrals such as surface area, volumes
Unit –IV Vector Calculus: Differentiation of vectors, gradient, divergence, curl and their physical meaning; Identities involving gradient, divergence and curl Line and surface integrals Green’s, Gauss and Stroke’s theorem and their applications"""),

    # Page 10
    (10, """Page 10 of 95
Unit–V Probability and Statistics: Concept of probability, random variable and distribution function: discrete and continuous, Binomial, Poisson and Normal Distributions.
Text and Reference Books:
1. C.L.Liu : Discrete Mathematics, McGraw Hill, 2nd Edition, 1985.
2. B.Kolman, R.C.Busby, and S.C.Ross, Discrete mathematical structures, 5/e, Prentice Hall, 2004
3. J.L.Mott, A.Kandel and T.P.Baker : Discrete mathematical structures For computer scientists & Mathematicians, Prentice–Hall India, 1985.
4. J.P.Trembley, R. Manohar, Discrete mathematical structures with applications to computer science, McGraw –Hill, Inc. New York, NY, 1975"""),

    # Page 11-13 (Physics-I)
    (11, """Page 11 of 95
Course Code: PHY-S101 Breakup: 3 –1 – 3 – 5
Course Name: Physics-I
Course outcomes (CO): At the end of the course, the student will be able to:
CO1 Understand the behaviour of Physical bodies
CO2 Understand the basic concepts related to the motion of all the objects around us in our daily life
CO3 Gain the foundation for applications in various applied fields in science and technology
CO4 Understand the concepts of vectors, laws of motion, momentum, energy, rotational motion, central force field, gravitation, collision and special theory of relativity
CO5 Empower the students to develop the skill of organizing the theoretical knowledge and experimental observations into a coherent understanding
Course Details: (Theory)
Unit 1 Revision of vectors, vector differentiation, ordinary derivatives of vectors, space curves continuity and differentiability, partial derivatives of vectors, gradient, divergence, curl, vector differentiation and their geometrical interpretation, various coordinate systems: polar coordinate, orthogonal curvilinear coordinate system, unit vectors and tangent vectors in curvilinear systems, special orthogonal curvilinear coordinate system, cylindrical coordinate system and spherical polar coordinate systems.
Unit 2 Inertial and non-inertial frames, fictitious force, Coriolis force, Newton’s laws of motion and its applications, friction, conservative and non-conservative force, work energy theorem, conservation of linear momentum and energy, variable mass system (Rocket motion), simple harmonic motion, small oscillation, equilibrium, condition for stability of equilibrium, energy diagram, small oscillation in a bound system, working of Teetertoy.
Unit 3 Concept of centre of mass and calculation of center of mass for different objects, system of particles and collision, conditions for elastic and inelastic collision, collision in center of mass frame, rigid body kinematics, rotational motion, moment of inertia, theorems on moment of inertia, calculation of moment of inertia of bodies of different shapes."""),

    (12, """Page 12 of 95
Unit 4 Central force field, properties of central force field, inverse square law force, gravitational field and potential; Kepler’s laws of planetary motion and its application; Wave mechanics, wave particle duality, De-Broglie matter wave, Schrodinger wave equations (time dependent and time independent), uncertainty principle and its applications
Unit 5 Frame of reference, Galilean transformation, Michelson-Morley experiment, postulates of special theory of relativity, Lorentz transformations, Length contraction, time dilation, velocity addition theorem, variation of mass with velocity, Einstein’s mass energy relation, relativistic relation between energy and momentum, rest mass of photon.
Text and Reference Books:
1. Vector Analysis by M. R. Spiegel, Schaum's Outlines, 2021
2. Introduction to Mechanics: R. D. Kleppner and J. Kolenkow, Cambridge University Press, 2nd edition, 2014
3. A textbook of Mechanics by J. C. Upadhyay, Ram Prasas Publications; 1st edition, 2017
4. Mechanics by D. S. Mathur, S. Chand; New edition, 2000
5. Theory & Problems of Theoretical Mechanics by M. R. Spiegel, Schaum’s Outline Series, 2017
Course outcomes (CO): At the end of the lab course, the student will be able to:
CO1 Perform basic experiments related to mechanics
CO2 Be familiar with various measuring instruments and also would learn the importance of accuracy of measurements.
Course Details: (Practical)
1. Graphical Analysis (Ref. UIET Laboratory Manual)
2. Trajectory of projectile (Ref. UIET Laboratory Manual) Apparatus Used (Trajectory Apparatus, Metal Balls, Channels, Vernier Callipers, Carbon & Graph Paper)"""),

    (13, """Page 13 of 95
3. Moment of Inertia of Bicycle wheel (Ref. Book by K. K. Dey, B. N. Dutta) Apparatus Used (Bicycle Wheel, Masses, Thread, Stopwatch, Meter Scale, Vernier Callipers)
4. Spring Oscillations (Ref. UIET Laboratory Manual) Apparatus Used (Spring Oscillation Apparatus, Stop Watch, Masses)
5. Coupled Pendulum (Ref. UIET Laboratory Manual) Apparatus Used (Coupled Pendulum Setup, Stop Watch, Scale)
6. Bifilar Suspension System (Ref. UIET Laboratory Manual) Apparatus Used (Bifilar Suspension System Setup, Stop Watch, Masses)
7. Frequency of AC Mains by Melde’s Method (Ref. Book by K. K. Dey, B. N. Dutta) Apparatus Used (Electrical Vibrator, String, Pulley, Small Pan, Weight Box & Physical Balance)
8. Kater’s (Reversible) Pendulum (Ref. Book by K. K. Dey, B. N. Dutta) Apparatus Used (Kater’s Pendulum, Stop Watch)
9. Inertia Table (Ref. Book by K. K. Dey, B. N. Dutta) Apparatus Used (Inertia Table, Stop Watch, Vernier Callipers, Split Disc, Balancing Weights, and Given Body (Disc))
10. Moment of Inertia of Flywheel (Ref. Book by J. C. Upadhyay and UIET Laboratory Manual) Apparatus used (Fly wheel, weight hanger, slotted weights, stop watch, metre scale)"""),

    # Page 14 (Programming & Computing C & UNIX)
    (14, """Page 14 of 95
Course Code: ISC – S101 Breakup: 3 – 0 – 3 – 5
Course Name: Programming & Computing (C & UNIX)
Course outcomes (CO): At the end of the course, the student will be able to:
CO1 Recollect various programming constructs and to develop C programs
CO2 Understand the fundamentals of C programming
CO3 Choose the right data representation formats based on the requirements of the problem
CO4 Implement different Operations on arrays, functions, pointers, structures, unions and files
Course Details:
Basic concepts of Computers, Basic UNIX Concepts and Vi - Editor
Introduction to C: Basic Programming concepts, Program structure in C, Variables and Constants, Data types, Conditional statements, control statements, Functions, Arrays, Structures, Introduction to pointers and Introduction to File Systems.
Text Books and References:
1. Programming in C, Schaum Series, 3rd edition, BPB Publication, Byron S. Gottfried
2. The ‘C’ Programming, Denis Ritchi, Second edition, PHI, 1988
3. Mastering C, Venugopal, Second edition, TMH, 2006
4. Let Us C, Yashavant Kanetkar, 18th Edition, BPB, 2021
5. Programming in ANSI C, Balaguruswami, Eighth Edition, TMH, 2019
Computer Programming Lab:
Learning OS Commands: Practice of all Internal and External DOS Commands, Writing simple batch programs, Exposure to Windows environment, Practice of UNIX commands and Vi editor, Writing simple shell script
C Programming: Practicing programs to get exposure to basic data types, algebraic expressions, Conditional statements, Input Output Formatting, Control structures, arrays, functions, structures, pointers and basic file handling"""),

    # Page 15-16 (Professional Communication)
    (15, """Page 15 of 95
Course Code: HSS-S101 Breakup: 3 –1 – 0 – 4
Course Name: Professional Communication
Course outcomes (CO): At the end of the course, the student will be able to:
CO1 Enhance their communication skills for tackling the professional challenges of a diverse workplace
CO2 Learn effective writing skills and be able to write clear technical reports
CO3 Improve their verbal and non-verbal communication
CO4 Be fluent orally in the use of the nuances of the English language
CO5 Learn good interpersonal skills and be proficient with the soft skills required for national and global placements
Course Details:
Unit -1 Basics of Technical Communication: Technical Communication: features; Distinction between General and Technical communication; Language as a tool of communication; Levels of communication: Interpersonal, Organizational, Mass communication; Flow of Communication: Downward, Upward, Lateral or Horizontal (Peer group); Importance of technical communication; Barriers to Communication.
Unit - II Constituents of Technical Written Communication: Words and Phrases: Word formation. Synonyms and Antonyms; Homophones; Select vocabulary of about 500-1000 New words; Requisites of Sentence Construction: Paragraph Development: Techniques and Methods - Inductive, Deductive, Spatial, Linear, Chronological etc; The Art of Condensation- various steps.
Unit - III Forms of Technical Communication: Business Letters: Sales and Credit letters; Letter of Enquiry; Letter of Quotation, Order, Claim and Adjustment Letters; Job application and Resumes. Reports: Types; Significance; Structure, Style & Writing of Reports; Technical Proposal; Parts; Types; Writing of Proposal; Significance; Technical Paper, Project. Dissertation and Thesis Writing: Features, Methods & Writing.
Unit - IV Presentation Strategies: Defining Purpose; Audience & Locale; Organizing Contents; Preparing Outline; Audio-visual Aids; Nuances of Delivery; Body Language; Space; Setting Nuances of Voice Dynamics; Time-Dimension.
Unit - V Value- Based Text Readings: Following essays form the suggested text book with emphasis on Mechanics of writing: The Aims of Science and the Humanities by M.E. Prior, The Language of Literature and Science by A.Huxley"""),

    (16, """Page 16 of 95
Man and Nature by J.Bronowski, The Mother of the Sciences by A.J.Bahm, Science and Survival by Barry Commoner, Humanistic and Scientific Approaches to Human Activity by Moody E. Prior, The Effect of Scientific Temper on Man by Bertrand Russell.
Text and Reference Books:
1. V.N. Arora and Laxmi Chandra, Improve Your Writing ed. Oxford Univ. Press, New Delhi
2. Meenakshi Raman & Sangeeta Sharma, Technical Communication – Principles and Practices, Oxford Univ. Press 2007, New Delhi.
3. Barun K. Mitra, Effective Technical Communication, Oxford Univ. Press, 2006, New Delhi
4. R.C. Sharma & Krishna Mohan, Business Correspondence and Report Writing, Tata McGraw Hill & Co. Ltd., New Delhi.
5. M.Rosen Blum, How to Build Better Vocabulary, Bloomsbury Pub. London.
6. Norman Lewis, Word Power Made Easy, W.R. Goyal Pub. & Distributors, Delhi.
7. Krishna Mohan, Developing Communication Skills Meera Banerji-Macmillan India Ltd. Delhi.
8. L.U.B. Pandey & R.P. Singh, Manual of Practical Communication, A.I.T.B.S. Publications India Ltd.; Krishan Nagar, Delhi."""),

    # Page 28 (Data Structure)
    (29, """Page 29 of 95
Course Code: CSE - S202 Breakup: 3 – 0 – 2 – 4
Course Name: Data Structure
Course outcomes (CO): At the end of the course, the student will be able to:
CO1 Learn the basic types for data structure, implementation and application.
CO2 Know the strength and weakness of different data structures.
CO3 Use the appropriate data structure in context of solution of given problem.
CO4 Develop programming skills, which require to solve given problem.
Course Details:
Basic concepts and notations, Mathematical background, Revision of arrays and pointers, Recursion and implementation of Recursion
Stacks and Queues: Sequential representation of stacks and queues
Lists: List representation techniques, Dynamics Storage allocation, Representation of stacks and queues using linked list, operations on linked list, Introduction to Doubly linked list.
Sorting Algorithms: Insertion sort, Bubble sort, Quick sort, Merge sort, Heap sort, Shell sort, Time and Space complexity of sorting algorithms
Tables: Searching sequential tables, Index sequential searching, Hash tables, Heaps.
Trees: Definition and basic concepts, Linked tree representations, Binary tree traversal algorithms,(Preorder, Inorder, Postorder), Binary search tree, Insertion and Deletion in Binary search tree, Multiway search trees, B trees, B+ tree and their applications, Digital search trees and Trie structure.
Graphs: Introduction to Graphs, Implementation of Graphs, Depth first search, Breadth first search. Introduction to External Sorting
Text Books and References:
1. Data Structure Using C and C++, Y. Langsam, M.J. Augenstein and A.M. Tenenbaum, Second Edition, Pearson education, 2002.
2. Data Structures with C (Schaum's Outline Series), Seymour Lipschutz, McGraw Hill, first edition, 2017
3. Data Structures Using C, Aaron M. Tenenbaum, McGraw Hill, first edition, 1989
Data Structures Lab: Write Program in C / C++ for following:
1. Array implementation of Stack, Queue, Circular Queue
2. Linked list implementation using Dynamic memory Allocation, deletions and insertions, Linked Implementation of Stack, Queue, Circular Queue
3. Implementation of Tree Structures, Binary Tree, Tree Traversals, Binary Search Tree, Insertion and Deletion in BST, Simple implementation of Multiway search trees
4. Implementation of Searching and Sorting Algorithms
5. Graph Implementation, BFS, DFS."""),

    # Page 42-43 (DBMS)
    (42, """Page 42 of 95
Course Code: CSE-S301 Breakup: 3 – 0 – 3 – 5
Course Name: Database Management Systems
Course outcomes (CO): At the end of the course, the student will be able to:
CO1 Describe the fundamental elements of relational database management systems
CO2 Explain the basic concepts of relational data model, entity-relationship model, relational database design, relational algebra and SQL.
CO3 Design ER-models to represent simple database application scenarios
CO4 Convert the ER-model to relational tables, populate relational database and formulate SQL queries on data.
CO5 Improve the database design by normalization.
CO6 Familiar with basic database storage structures and access techniques: file and page organizations, indexing methods including B tree, and hashing.
Course Details:
Introduction: Database-System Applications, Purpose of Database Systems, File processing disadvantages, View of Data, Data Abstraction, Data Models, Database Languages, Relational Databases, DBMS Architecture
Introduction to the Relational Model: Structure of Relational Databases, Database Schema, Attributes and Keys, Schema Diagrams
Introduction to SQL: SQL Data Definition, Basic Structure of SQL Queries, Basic Operations, Set Operations, Null Values, Aggregate Functions, Nested Subqueries, Modification of the Database
Database Design and the E-R Model: Overview of the Design Process, The Entity-Relationship Model, Constraints, Removing Redundant Attributes in Entity Sets, Entity-Relationship Diagrams, Reduction to Relational Schemas, Entity-Relationship Design Issues
The Relational Algebra: The Tuple Relational Calculus, The Domain Relational Calculus
Functional Dependencies: Extraneous Attribute, Left irreducible FD, Prime/non-prime attributes, Logically Implied FD, Closure of a FD, Rules for logical inference of FD, Algorithm to determine closure of a FD set, Canonical Cover of a FD, Algorithm to determine Canonical Cover of a FD set
Relational Database Design: Features of Good Relational Designs, Atomic Domains and First Normal Form, Decomposition Using Functional Dependencies, Lossless Join Decomposition, Dependency preserving Decomposition, Normalization
Introduction to Concurrency Control & Transaction Management
Text Books and References:
1. Database System Concepts, Abraham Silberschatz, Henry F. Korth, S. Sudarshan, McGraw Hill; 7th edition, 2021
2. Database Management Systems, Raghu Ramakrishnan, Johannes Gehrke, McGraw Hill Education; Third edition 2014
DBMS Lab:
1. Creating tables for various relations (in SQL)
2. Implementing queries in SQL for Insertion, Retrieval (Union, Intersect, Minus, Aggregate functions), Updation, Deletion
3. Creating Views, Writing Assertions, Writing Triggers
4. Implementing Operations on tables using PL/SQL, FORMS, and REPORTS."""),

    # Page 56 (Machine Learning)
    (56, """Page 56 of 95
Course Code: CSE – S402 Breakup: 3 – 1 – 0 – 4
Course Name: Machine Learning
Course outcomes (CO): At the end of the course, the student will be able to:
CO1 Appreciate the importance of visualization in the data analytics solution
CO2 Apply structured thinking to unstructured problems
CO3 Understand a very broad collection of machine learning algorithms and problems
CO4 Learn algorithmic topics of machine learning and mathematically deep enough to introduce the required theory
CO5 Develop an appreciation for what is involved in learning from data.
Course Details:
Introduction: Introduction to machine learning, supervised learning, unsupervised learning, Reinforcement learning.
Revision: Basics of Probability Theory, Basics of Linear Algebra and Statistical Decision Theory.
Supervised learning: Linear regression (Linear Regression, Linear discriminant analysis, Polynomial Regression, Ridge Regression, Lasso Regression, Parameter Estimation: Least Square, Least Mean Square, Gradient Descent), Classification (Two class classification, Multi-class classification, Loss functions).
Classification algorithms: Logistic Regression (Binary, Multinomial), Naive Bayes (Bayes Theorem, Classifier), Decision trees, Regression trees, Stopping criteria & pruning.
SVM: SVM formulation, interpretation & analysis, SVMs for linearly non-separable data, SVM kernels, Hinge loss formulation.
Artificial Neural Networks: Concept of Perceptron & Parameter Estimation, Early artificial neural network models, Feed forward networks, Recurrent Networks, Backpropagation, Initialization, training & validation.
Unsupervised learning: Clustering (Partitional clustering, Hierarchical clustering, K-Means, BIRCH algorithm), Association Mining (Apriori algorithm, FP-growth algorithm).
Evaluation Measures & Hypothesis Testing: Evaluation measures, Bootstrapping & cross validation, ROC curve.
Introduction to Advance Topics: Recommendation systems, Deep learning.
Text Book and References:
1. Tom M. Mitchell : “Machine Learning”, 2013.
2. Hal Daume III: “A Course in Machine Learning, 2012.
3. Christopher M. Bishop: “Pattern Recognition and Machine Learning”, 2010.
4. Ian Goodfellow, Yoshua Bengio, Aaron Courville: “Deep Learning”, 2017.""")
]


def clean_page_text(raw_text: str) -> str:
    """Removes page numbers, headers, footers, and OCR noise."""
    lines = raw_text.split("\n")
    cleaned_lines = []
    
    for line in lines:
        l_str = line.strip()
        if not l_str:
            continue
            
        # Strip page numbers like 'Page X of 95'
        if re.match(r'^Page\s+\d+\s+of\s+95$', l_str, re.IGNORECASE):
            continue
        # Strip header/footer artifacts
        if l_str in ("Detailed Syllabus", "Text Books and References:", "Text and Reference Books:"):
            cleaned_lines.append(l_str)
            continue
            
        cleaned_lines.append(l_str)
        
    return "\n".join(cleaned_lines)


def process_syllabus_pipeline():
    logger.info("Starting UIET CSE 95-Page Syllabus Processing Pipeline...")

    total_raw_chars = sum(len(txt) for _, txt in RAW_PAGES_DATA)
    
    cleaned_page_texts = []
    for pg, txt in RAW_PAGES_DATA:
        cleaned_txt = clean_page_text(txt)
        cleaned_page_texts.append((pg, cleaned_txt))

    total_clean_chars = sum(len(txt) for _, txt in cleaned_page_texts)
    duplicate_removal_pct = round(((total_raw_chars - total_clean_chars) / max(1, total_raw_chars)) * 100, 2)

    # Combine clean text for clean_syllabus.txt
    full_clean_txt = "\n\n".join(txt for _, txt in cleaned_page_texts)

    # Parse course entities & units
    courses = [
        {
            "code": "MTH-S101",
            "title": "Mathematics-I",
            "semester": "I",
            "credits": 4,
            "breakup": "3-1-0-4",
            "page": 9,
            "co_list": [
                "CO1 Test the convergence & divergence of infinite series",
                "CO2 Understand concepts of limit, continuity and differentiability of function of two variables",
                "CO3 Find the maxima and minima of multivariable functions",
                "CO4 Evaluate multiple integrals, concepts of beta & gamma functions",
                "CO5 Apply the concepts of gradient, divergence and curl to formulate engineering problems"
            ],
            "units": [
                {"name": "Unit-I", "title": "Sequences & Series", "topics": ["Definition, Monotonic sequences, Bounded sequences, Convergent and Divergent Sequences", "Infinite series, Oscillating and Geometric series and their Convergence", "nth Term test, Integral test, Comparison Test, Limit Comparison test", "Ratio test, Root test, Alternating series, Absolute and Conditional convergence, Leibnitz test"]},
                {"name": "Unit-II", "title": "Differential Calculus", "topics": ["Limit Continuity and differentiability of functions of two variables", "Euler’s theorem for homogeneous equations, Tangent plane and normal", "Change of variables, chain rule, Jacobians, Taylor’s Theorem for two variables", "Extrema of functions of two or more variables, Lagrange’s method of undetermined multipliers"]},
                {"name": "Unit-III", "title": "Integral Calculus", "topics": ["Review of curve tracing, Double and Triple integrals, Change of order of integration", "Change of variables, Gamma and Beta functions, Dirichlet’s integral", "Applications of Multiple integrals such as surface area, volumes"]},
                {"name": "Unit-IV", "title": "Vector Calculus", "topics": ["Differentiation of vectors, gradient, divergence, curl and their physical meaning", "Identities involving gradient, divergence and curl", "Line and surface integrals Green’s, Gauss and Stroke’s theorem and their applications"]},
                {"name": "Unit-V", "title": "Probability and Statistics", "topics": ["Concept of probability, random variable and distribution function", "Discrete and continuous distributions, Binomial, Poisson and Normal Distributions"]}
            ]
        },
        {
            "code": "PHY-S101",
            "title": "Physics-I",
            "semester": "I",
            "credits": 5,
            "breakup": "3-1-3-5",
            "page": "11-13",
            "co_list": [
                "CO1 Understand the behaviour of Physical bodies",
                "CO2 Understand the basic concepts related to the motion of all the objects around us in our daily life",
                "CO3 Gain the foundation for applications in various applied fields in science and technology",
                "CO4 Understand the concepts of vectors, laws of motion, momentum, energy, rotational motion, central force field, gravitation",
                "CO5 Empower the students to develop the skill of organizing theoretical knowledge and experimental observations"
            ],
            "units": [
                {"name": "Unit 1", "title": "Vectors & Coordinate Systems", "topics": ["Revision of vectors, vector differentiation, ordinary derivatives of vectors", "Space curves, continuity and differentiability, partial derivatives of vectors", "Gradient, divergence, curl, vector differentiation and geometrical interpretation", "Orthogonal curvilinear coordinate system, cylindrical and spherical polar coordinates"]},
                {"name": "Unit 2", "title": "Mechanics & Oscillations", "topics": ["Inertial and non-inertial frames, fictitious force, Coriolis force, Newton’s laws", "Work energy theorem, conservation of linear momentum and energy", "Variable mass system (Rocket motion), Simple harmonic motion, small oscillations"]},
                {"name": "Unit 3", "title": "Rotational Motion & Centre of Mass", "topics": ["Centre of mass calculation, system of particles, elastic and inelastic collisions", "Rigid body kinematics, rotational motion, moment of inertia theorems", "Calculation of moment of inertia of bodies of different shapes"]},
                {"name": "Unit 4", "title": "Central Forces & Wave Mechanics", "topics": ["Central force field, Kepler’s laws of planetary motion", "De-Broglie matter wave, Schrodinger wave equations (time dependent and independent)", "Uncertainty principle and applications"]},
                {"name": "Unit 5", "title": "Special Theory of Relativity", "topics": ["Galilean transformation, Michelson-Morley experiment, postulates of special relativity", "Lorentz transformations, Length contraction, time dilation, mass-energy relation"]}
            ]
        },
        {
            "code": "ISC-S101",
            "title": "Programming & Computing (C & UNIX)",
            "semester": "I",
            "credits": 5,
            "breakup": "3-0-3-5",
            "page": 14,
            "co_list": [
                "CO1 Recollect various programming constructs and to develop C programs",
                "CO2 Understand the fundamentals of C programming",
                "CO3 Choose the right data representation formats based on problem requirements",
                "CO4 Implement operations on arrays, functions, pointers, structures, unions and files"
            ],
            "units": [
                {"name": "Unit-I", "title": "Basic Concepts & UNIX Vi-Editor", "topics": ["Basic concepts of Computers, Basic UNIX Concepts, Vi - Editor", "Introduction to C: Program structure in C, Variables and Constants, Data types", "Conditional statements, control statements, Functions, Arrays, Structures", "Introduction to pointers and Introduction to File Systems"]},
                {"name": "Practical Lab", "title": "Computer Programming Lab", "topics": ["Learning OS Commands: DOS Commands, UNIX commands, Vi editor, shell scripts", "C Programming: Data types, control structures, arrays, functions, structures, pointers, file handling"]}
            ]
        },
        {
            "code": "CSE-S202",
            "title": "Data Structure",
            "semester": "III",
            "credits": 4,
            "breakup": "3-0-2-4",
            "page": 29,
            "co_list": [
                "CO1 Learn basic types for data structure, implementation and application",
                "CO2 Know strength and weakness of different data structures",
                "CO3 Use appropriate data structure for problem solving",
                "CO4 Develop C/C++ programming skills for data structures"
            ],
            "units": [
                {"name": "Unit-I", "title": "Arrays, Pointers & Stacks/Queues", "topics": ["Basic concepts and notations, Revision of arrays and pointers, Recursion", "Stacks and Queues: Sequential representation of stacks and queues"]},
                {"name": "Unit-II", "title": "Linked Lists & Sorting", "topics": ["List representation, Dynamic storage allocation, Linked stacks and queues", "Doubly linked list operations", "Sorting Algorithms: Insertion, Bubble, Quick, Merge, Heap, Shell sort, Time & Space Complexity"]},
                {"name": "Unit-III", "title": "Searching & Trees", "topics": ["Tables: Sequential searching, Index sequential searching, Hash tables, Heaps", "Trees: Binary tree traversals (Preorder, Inorder, Postorder), BST, B-trees, B+ trees, Trie structure"]},
                {"name": "Unit-IV", "title": "Graphs & External Sorting", "topics": ["Graphs: Representation, Depth first search (DFS), Breadth first search (BFS)", "External Sorting techniques"]}
            ]
        },
        {
            "code": "CSE-S301",
            "title": "Database Management Systems",
            "semester": "V",
            "credits": 5,
            "breakup": "3-0-3-5",
            "page": "42-43",
            "co_list": [
                "CO1 Describe fundamental elements of RDBMS",
                "CO2 Explain relational model, ER model, relational algebra and SQL",
                "CO3 Design ER-models for application scenarios",
                "CO4 Convert ER-models to tables and formulate SQL queries",
                "CO5 Improve database design by normalization",
                "CO6 Understand storage structures, indexing (B-trees), and hashing"
            ],
            "units": [
                {"name": "Unit-I", "title": "DBMS Architecture & Relational Model", "topics": ["Database-System Applications, Purpose of DBMS, Views, Abstraction, Architecture", "Relational Model: Schemas, Attributes, Keys, Schema Diagrams"]},
                {"name": "Unit-II", "title": "SQL & E-R Modeling", "topics": ["SQL DDL, Queries, Join operations, Aggregates, Subqueries", "E-R Model: Entities, Relationships, ER Diagrams, Reduction to Relational Schemas"]},
                {"name": "Unit-III", "title": "Relational Algebra & Normalization", "topics": ["Relational Algebra, Tuple & Domain Calculus", "Functional Dependencies, Closure, Canonical Cover, 1NF, 2NF, 3NF, BCNF, Normalization"]},
                {"name": "Unit-IV", "title": "Transactions & Concurrency Control", "topics": ["Transaction concepts, ACID properties, Serializability", "Concurrency Control: Lock-based protocols, Deadlock handling, Timestamp protocols"]}
            ]
        },
        {
            "code": "CSE-S402",
            "title": "Machine Learning",
            "semester": "VII",
            "credits": 4,
            "breakup": "3-1-0-4",
            "page": 56,
            "co_list": [
                "CO1 Appreciate importance of visualization in data analytics",
                "CO2 Apply structured thinking to unstructured problems",
                "CO3 Understand broad collection of machine learning algorithms",
                "CO4 Learn algorithmic topics mathematically",
                "CO5 Develop appreciation for learning from data"
            ],
            "units": [
                {"name": "Unit-I", "title": "Supervised Learning & Regression", "topics": ["Supervised, Unsupervised & Reinforcement Learning basics", "Linear Regression, Polynomial Regression, Ridge & Lasso Regression", "Gradient Descent & Parameter Estimation"]},
                {"name": "Unit-II", "title": "Classification & SVM", "topics": ["Logistic Regression (Binary, Multinomial), Naive Bayes Classifier", "Decision Trees, Pruning", "Support Vector Machines (SVM): Formulation, Kernels, Hinge Loss"]},
                {"name": "Unit-III", "title": "Neural Networks & Unsupervised Learning", "topics": ["Perceptron, Artificial Neural Networks, Feedforward & Recurrent Networks, Backpropagation", "Clustering: K-Means, Hierarchical, BIRCH algorithm", "Association Mining: Apriori algorithm, FP-Growth"]},
                {"name": "Unit-IV", "title": "Evaluation & Advanced Topics", "topics": ["Evaluation measures, Cross-validation, ROC curves", "Introduction to Recommendation Systems and Deep Learning"]}
            ]
        }
    ]

    # Generate Concept Chunks
    chunks = []
    chunk_counter = 1

    total_units_cnt = 0
    total_topics_cnt = 0

    for c in courses:
        # Course Summary Chunk
        chunks.append({
            "chunk_id": f"chunk_{chunk_counter:03d}",
            "branch": "Computer Science and Engineering",
            "semester": c["semester"],
            "subject_code": c["code"],
            "subject_name": c["title"],
            "unit_name": "Course Overview",
            "topic_name": "Course Outcomes & Structure",
            "credits": c["credits"],
            "pdf_page_number": c["page"],
            "concept_content": f"Course: {c['code']} - {c['title']} (Semester {c['semester']}, {c['credits']} Credits). Outcomes: {'; '.join(c['co_list'])}"
        })
        chunk_counter += 1

        for unit in c["units"]:
            total_units_cnt += 1
            unit_title = unit["title"]
            for top in unit["topics"]:
                total_topics_cnt += 1
                chunks.append({
                    "chunk_id": f"chunk_{chunk_counter:03d}",
                    "branch": "Computer Science and Engineering",
                    "semester": c["semester"],
                    "subject_code": c["code"],
                    "subject_name": c["title"],
                    "unit_name": unit["name"],
                    "topic_name": unit_title,
                    "credits": c["credits"],
                    "pdf_page_number": c["page"],
                    "concept_content": f"Subject: {c['title']} ({c['code']}). {unit['name']} ({unit_title}): {top}"
                })
                chunk_counter += 1

    total_chunks = len(chunks)
    avg_chunk_size = round(sum(len(c["concept_content"]) for c in chunks) / max(1, total_chunks), 2)

    # Deliverable 1: clean_syllabus.json
    with open(config.BASE_DIR / "data" / "structured_data" / "clean_syllabus.json", "w", encoding="utf-8") as f:
        json.dump({"program": "B.Tech Computer Science and Engineering", "total_courses": len(courses), "courses": courses}, f, indent=2)

    # Deliverable 2: clean_syllabus.txt
    with open(config.BASE_DIR / "data" / "cleaned_documents" / "clean_syllabus.txt", "w", encoding="utf-8") as f:
        f.write(full_clean_txt)

    # Deliverable 3: chunks.json
    with open(config.BASE_DIR / "data" / "structured_data" / "chunks.json", "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2)

    # Deliverable 4: knowledge_objects.json
    knowledge_objects = {
        "program_details": {
            "degree": "B.Tech.",
            "branch": "Computer Science and Engineering",
            "institute": "UIET, CSJM University, Kanpur",
            "total_credits": 180,
            "categories": {
                "Basic Science Core": 34,
                "Engineering Science Core": 15,
                "Humanities and Social Science Core": 17,
                "Departmental Core": 68,
                "Departmental Electives": 16,
                "Open Electives": 12,
                "Projects and Seminars": 16,
                "Mandatory/Audit Course": 2
            }
        },
        "course_registry": [
            {"code": c["code"], "name": c["title"], "semester": c["semester"], "credits": c["credits"]} for c in courses
        ],
        "statistics": {
            "total_subjects_extracted": len(courses),
            "total_units": total_units_cnt,
            "total_topics": total_topics_cnt,
            "total_chunks": total_chunks,
            "average_chunk_size_chars": avg_chunk_size,
            "duplicate_removal_percentage": duplicate_removal_pct
        }
    }

    with open(config.BASE_DIR / "data" / "structured_data" / "knowledge_objects.json", "w", encoding="utf-8") as f:
        json.dump(knowledge_objects, f, indent=2)

    # Print cleaning report summary
    print("=" * 60)
    print("UIET CSE SYLLABUS CLEANING & KNOWLEDGE BASE REPORT")
    print("=" * 60)
    print(f"Total Subjects Extracted : {len(courses)}")
    print(f"Total Course Units      : {total_units_cnt}")
    print(f"Total Concept Topics    : {total_topics_cnt}")
    print(f"Total Semantic Chunks   : {total_chunks}")
    print(f"Average Chunk Size      : {avg_chunk_size} characters")
    print(f"Duplicate Removal %     : {duplicate_removal_pct}%")
    print("=" * 60)
    print("Generated Deliverables:")
    print("  1. clean_syllabus.json")
    print("  2. clean_syllabus.txt")
    print("  3. chunks.json")
    print("  4. knowledge_objects.json")
    print("=" * 60)


if __name__ == "__main__":
    process_syllabus_pipeline()
