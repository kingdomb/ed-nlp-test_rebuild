# NLP Recommender API Service for KSU-CRS Capstone Project

README for `Maintaining Course Descriptions Data for the NLP Recommender Engine`.

## Data Preparation

file: `nlpDataPreparation.js`

The script `nlpDataPreparation.js`, is designed to run independently from `index.js` to preprocess and prepare necessary files for the NLP engine. It must be executed **manually** to generate processed course data and vocabulary for the NLP tasks in `index.js`. 

This preprocessing step is crucial for setting up the NLP engine in `index.js` by providing it with the necessary vocabulary and precomputed vectors for course descriptions.

### Expected Inputs:
- JSON file containing Course descriptions located in the `../resources/nlpDataCourseDescriptions.json`. (can be extracted from KSU Course Catalog)

Sample content for nlpDataCourseDescriptions.json:

```
[
    {
        "Subject": "CMPD",
        "Number": "4470",
        "Course": "CMPD4470",
        "Title": "Alternative Dispute Resolution",
        "Description": "This course offers a survey of theories and methods related to alternative dispute resolution and conflict management through lecture discussion and experiential activities. Emphasis will be placed on interpersonal conflict and mediation skills."
    },
    {
        "Subject": "RES",
        "Number": "4000",
        "Course": "RES4000",
        "Title": "Vertically Integrated Projects",
        "Description": "Multidisciplinary course supporting faculty research. Can participate multiple semesters. Students will have strong foundations within discipline pursue further knowledge/skills make meaningful contributions and assume significant technical/leadership responsibilities."
    },
    {
        "Subject": "ACCT",
        "Number": "2101",
        "Course": "ACCT2101",
        "Title": "Principles of Accounting I",
        "Description": "3 Credit Hours  Prerequisite: Business Majors: ENGL 1101\u00a0\u00a0and MATH 1111\u00a0\u00a0or higher Non-business Majors: ENGL 1101\u00a0\u00a0and MATH 1101\u00a0\u00a0or higher.  A study of the underlying theory and application of financial accounting concepts."
    },
...

...

...

    {
        "Subject": "AIAE",
        "Number": "0404",
        "Course": "AIAE0404",
        "Title": "Leadership Seminar IV",
        "Description": "This course builds on the skills learned in Leadership Seminar III and provides students a framework for developing leadership skills as they relate to career success. \u00a0Students will create an ePortfolio designed to help them promote themselves through a comparison of their skills and abilities and the artifacts that demonstrate their abilities."
    },
    {
        "Subject": "AIAE",
        "Number": "0405",
        "Course": "AIAE0405",
        "Title": "Career Preparation and Internship VII",
        "Description": "This course is designed to prepare students in the ALCD program for the transition to the workforce.\u00a0 Students will investigate how their skills interests values and personality influence career decisions.\u00a0\u00a0 Students will begin to organize and prepare professional documents that includes resumes cover letters letters of recommendation and other essential items needed for a customized employment portfolio. Internship hours are required."
    },
    {
        "Subject": "AIAE",
        "Number": "0406",
        "Course": "AIAE0406",
        "Title": "Career Preparation and Internship VIII",
        "Description": "Students will work with transition and career specialists to focus on job opportunities and establishing strategic career and professional goals.\u00a0 Students will complete professional documents that include a resume cover letters letters of recommendation and other essential items needed for a customized employment portfolio.\u00a0 Internship hours are required."
    }
]

```


### What it does:
1. Reads course descriptions from the specified JSON file.
2. Performs TF-IDF preprocessing on course descriptions to extract vocabulary and compute term frequencies.
3. Generates vector representations of course descriptions for use in NLP tasks.
4. Saves processed course data and vocabulary to 
   a) `../resources/nlpDataProcessedCourses.json` and 
   b) `../resources/nlpDataCourseVectorsCache.json`, respectively.
5. A global vocabulary is saved to 
   c) `../resources/nlpDataGlobalVocabulary.json`.

### Expected Outputs:
- Processed course data and vocabulary files in the `../resources` directory.

### * Usage:
Run this script with Node.js by executing `node admin/nlpDataPreparation.js` from the project root directory. 
 
## Helper Scripts

file: `nlpCountSubjectsAndCourses.js`

A script for counting the total number of *unique subjects* and *unique courses* from the `../resources/nlpDataCourseDescriptions.json` file.

You can run this file as `node admin/nlpCountSubjectsAndCourses.js`

file: `nlpGenerateApiKey.js`

A helper script for generating an API key. You can add/update an api key in the `engine\nlpApiKeys.json` file.

Usage: `node admin/nlpGenerateApiKey.js`