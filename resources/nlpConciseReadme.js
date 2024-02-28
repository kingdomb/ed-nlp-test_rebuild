const readme = `# NLP Recommender API Service for KSU-CRS Capstone Project

The engine is crafted using **\`natural language processing (NLP)\`** techniques, specifically through the TF-IDF vectorizer from the \`natural\` library, to analyze course descriptions and recommend courses based on a KSU student's academic profile. It's built on a Node.js backend, leveraging Express.js for handling HTTP requests and middleware functionality. 

### Input
The server accepts POST requests containing JSON data that represents a student's academic profile. This data includes the student's:
- career goal, 
- degree program, 
- a list of courses already taken (each with a subject, course number, title, description, and grade), 
- preference whether to calculate recommendations by learning gaps or by strengths, and 
- a list of allowed subjects for further recommendations. 

### Process
Upon receiving the student record, the system generates a weighted description based on the courses taken, factoring in the student's preference for emphasizing learning gaps or strengths. For instance, if based on strengths, courses with higher grades are given more weight in the recommendation process than those with lower grades. This is converted into a student vector. Vectors for courses obtained from the KSU Catalog are already preprocessed utilizing the TF-IDF model and stored on the server  (see \`resources\` folder). 

The system then computes similarity scores between the student vector and course vectors, thereby identifying courses most relevant to the student's academic profile and career goals. Additionally, recommendations are filtered based on the allowed subjects specified in the input. For more information, please refer to the \`readme.md\` file located within the \`engine\` folder. This document provides information on the technical foundation and functionality of the engine.

### Output
The response to a successful POST request is a JSON array of recommended courses, limited to the top matches (default set to courses with scores > 0.55). Each recommended course includes its subject, number, course code, title, and description, ranked based on their relevance to the student's profile and preferences as determined by the similarity scores and filters. 

This output allows students to receive personalized course recommendations that align with their academic and career objectives.


## Testing the \`/recommend\` Endpoint

To test the \`/recommend\` endpoint, you can use tools like [Postman](https://www.postman.com/). 

You can also test it interactively with [Swagger UI](http://localhost:3000/api-swagger). Note: enter API key (*see below*) via \`Authorize\`.

This endpoint expects a POST request with a JSON payload containing the student's academic profile, including their career goal, degree program, courses taken, preference for calculation either by learning gaps or strength, and allowed subjects for recommendations. Here's an example:

\`\`\`sh
{
  "Career goal": "Frontend Developer",
  "Degree program": "Software Engineer",
  "CalculateByLearningGap": false,
  "Allowed subject": ["SWE", "CS", "IT", "PHYS", "MATH", "BIOL", "CHEM", "CGDD"],
  "Courses taken": [
    {
        "Subject": "SWE",
        "Number": "3313",
        "Course": "SWE3313",
        "Title": "Introduction to Software Engineering",
        "Description": "This course provides an overview of the software engineering discipline introducing the student to the fundamental principles and processes of software engineering. This course highlights the need for an engineering approach (both personal and team) to software with understanding of the activities performed at each stage in the development cycle. In this course students will perform requirements analysis design implementation and testing. The course presents software development processes at the various degrees of granularity. Students will become aware of libraries of standards (IEEE ACM SWEBOK etc.).",
        "Grade": "A+"
    },
    {
        "Subject": "SWE",
        "Number": "3623",
        "Course": "SWE3623",
        "Title": "Software Systems Requirements",
        "Description": "This course covers engineering activities related to the definition and representation of software system requirements. Topics include the elicitation analysis specification and validation of software system requirements. Emphasis is on the application of processes and techniques of requirements engineering. Projects focus on current analysis methods and supporting tools for specification organization change management traceability prototyping and validating requirements.",
        "Grade": "A-"
    },
    {
        "Subject": "SWE",
        "Number": "3633",
        "Course": "SWE3633",
        "Title": "Software Architecture and Design",
        "Description": "This course covers the fundamental design principles and strategy for software architecture and design. Architectural styles quality attributes design notations and documents reference architecture domain specific architecture in architecture process and pattern-oriented design component-oriented design and interface design in detailed design process are discussed.",
        "Grade": "C"
    }
  ]
}
\`\`\`

### Using Postman (with API Key)

1. Open Postman and create a new request.
2. Set the request type to \`POST\` and enter the url (e.g., \`https://arbcrsnlp.azurewebsites.net/recommend\`).
3. Go to the **Headers** tab.
   - Add a new header:
     - For the key, enter \`X-API-Key\`. For the value, enter your API key, such as \`289822b8c9de15456215e16b3ec512caed1c21458563c86094e9aef6f3f51d29\`.
   - Additionally, you may have other headers, such as: 
     - \`Content-Type\` : \`application/json\`
     - \`Accept\` : \`application/json\`
4. Switch to the **Body** tab, select **raw**, and then choose **JSON** from the dropdown menu. Enter the JSON data for the student's profile, similar to the example provided above.
5. Hit **Send** to make the request and receive the recommended courses.

### Paths and Operations
- **/recommend (POST)**: Defines a single endpoint \`/recommend\` that accepts POST requests. 
- **/readme**: View README.md content. 
- **/api-swagger**: API documentation with the feature to test the /recommend endpoint interactively. 

### Request and Response
- The API expects requests to contain JSON-formatted data.
  - Note: \`Degree program\` and \`Courses taken\` fields are marked as required.
- It responds with JSON-formatted data.
  - 200: Describes the successful operation's response, which is an array of \`Course\` objects. 
  - 400: Indicates a client-side error in the request. This might be due to missing required fields, incorrect data types, or improperly formatted data. 
  - 401: Indicates unauthorized access due to an invalid or missing API key. 
  - 429: Indicates the request has been rate-limited due to too many requests from the client's IP address in a given time frame. 
  - 500: Indicates a server-side error. This general error message is returned when an unexpected condition is encountered.

### Data Models
- The data model for courses includes properties such as subject, number, course code, title, description, and grade. This model supports detailed course representations, allowing for nuanced recommendations based on the content and academic performance (grade).

## Author

**Bernard Major**  
[bernardmajor80@outlook.com](bernardmajor80@outlook.com) 
 `;

module.exports = readme;