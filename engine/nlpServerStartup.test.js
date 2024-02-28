const express = require('express');
const request = require('supertest'); 
const { startup } = require('./nlpServerStartup');
const { recommendCourses } = require('./nlpRecommendationLogic');


jest.mock('swagger-ui-express', () => ({
    serve: jest.fn((req, res, next) => next()), 
    setup: jest.fn().mockReturnValue((req, res) => {
      res.send('Swagger UI setup success');
    }),
  }));
jest.mock('markdown-it', () => () => ({
  render: jest.fn().mockReturnValue('mocked HTML content'),
}));
jest.mock('../resources/nlpConciseReadme', () => 'Mocked README content', { virtual: true });
jest.mock('./nlpDataProcessing', () => ({
  loadGlobalVocabulary: jest.fn().mockResolvedValue(),
}));
jest.mock('./nlpMiddlewares', () => ({
  validateApiKey: jest.fn((req, res, next) => next()),
  limiter: jest.fn((req, res, next) => next()),
  validateStudentRecord: jest.fn((req, res, next) => next()),
}));
jest.mock('./nlpCacheManagement', () => ({
  generateBaseCacheKey: jest.fn().mockReturnValue('mockCacheKey'),
}));
jest.mock('./nlpRecommendationLogic', () => ({
    recommendCourses: jest.fn().mockImplementation(() => {
      return [{ Subject: 'SomeSubject', score: 0.9 }];
    }),
    filterRecommendationsByAllowedSubject: jest.fn((recs) => recs),
  }));

describe('NLP Server Startup', () => {
    
  let app;

  const mockStudentRecord = {
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
          "Grade": "A"
      },
      {
          "Subject": "SWE",
          "Number": "3623",
          "Course": "SWE3623",
          "Title": "Software Systems Requirements",
          "Description": "This course covers engineering activities related to the definition and representation of software system requirements. Topics include the elicitation analysis specification and validation of software system requirements. Emphasis is on the application of processes and techniques of requirements engineering. Projects focus on current analysis methods and supporting tools for specification organization change management traceability prototyping and validating requirements.",
          "Grade": "B"
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
  };


  beforeEach(() => {
    app = express();
    app.use(express.json()); 
  });

  it('should setup api documentation route', async () => {
    await startup(app);
    const response = await request(app).get('/api-swagger');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Swagger UI setup success'); 
  });
  

  it('should render README content on /readme route', async () => {
    await startup(app);
    const response = await request(app).get('/readme');
    expect(response.status).toBe(200);
    expect(response.text).toContain('mocked HTML content');
  });

  it('should handle recommend request and respond with filtered recommendations', async () => {
    await startup(app);

    const response = await request(app)
      .post('/recommend')
      .send(mockStudentRecord);

    expect(response.status).toBe(200);
    expect(response.body.recommendations).toEqual([{ Subject: 'SomeSubject', score: 0.9 }]);
    expect(response.body.recommendations[0].score).toBeGreaterThan(0.55);
  });


  it('should serve cached recommendations if available', async () => {
    await startup(app);
  
    const mockStudentRecord = {
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
    };
  
    await request(app).post('/recommend').send(mockStudentRecord);
    jest.clearAllMocks();  
    await request(app).post('/recommend').send(mockStudentRecord);
    expect(recommendCourses).not.toHaveBeenCalled();
  });
  
  test('robots.txt should disallow all', async () => {
    await startup(app);
    const response = await request(app).get('/robots.txt');
    expect(response.text).toContain('Disallow: /');
  });

});
