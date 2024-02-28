const {
  recommendCourses,
  filterRecommendationsByAllowedSubject,
  createWeightedStudentDescription,
  adjustForCareerGoal,
  isCourseSimilar
} = require('./nlpRecommendationLogic');

jest.mock('../resources/nlpDataCourseDescriptions.json', () => [
  {
    "Subject": "ACCT",
    "Number": "2101",
    "Course": "ACCT2101",
    "Title": "Principles of Accounting I",
    "Description": "A study of the underlying theory and application of financial accounting concepts."
  },
  {
    "Subject": "CS",
    "Number": "101",
    "Course": "CS101",
    "Title": "Introduction to Computer Science",
    "Description": "Introduction to the fundamental concepts of computer science."
  }
]);
jest.mock('./nlpDataProcessing', () => ({
  vectorizeText: jest.fn().mockImplementation(() => [1, 0, 2]),
  computeSimilarityScores: jest.fn().mockImplementation(() => [0.9, 0.8])
}));
const natural = require('natural');
jest.mock('natural', () => ({
  JaroWinklerDistance: jest.fn().mockImplementation((title1, title2) => {
    if (title1 === title2) return 1;
    return 0.7; // set default score 
  })
}));

describe('NLP Recommendation Logic', () => {
  describe('createWeightedStudentDescription', () => {
    it('should create a weighted description based on courses taken', () => {
      const studentRecord = {
        'CalculateByLearningGap': false,
        'Courses taken': [
          {
            "Grade": "A",
            "Description": "Test course description."
          }
        ]
      };
      const description = createWeightedStudentDescription(studentRecord);
      expect(description).toContain("Test course description.");
    });
    it('should return an empty string when no courses are taken', () => {
      const studentRecord = {
        'CalculateByLearningGap': false,
        'Courses taken': []
      };
      const description = createWeightedStudentDescription(studentRecord);
      expect(description).toEqual('');
    });

  });

  describe('recommendCourses', () => {
    it('should recommend courses based on student profile and preferences', () => {
      const studentRecord = {
        'CalculateByLearningGap': true,
        'Career goal': 'accounting',
        'Courses taken': [
          {
            "Title": "Introduction to Accounting",
            "Grade": "A",
            "Description": "Basic principles of accounting."
          }
        ]
      };

      const recommendations = recommendCourses(studentRecord);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].score).toBeGreaterThan(0);
    });
  });

  it('should recommend courses based on student profile and preferences', () => {
    const studentRecord = {
      'CalculateByLearningGap': true,
      'Courses taken': [
        {
          "Title": "Introduction to Accounting",
          "Grade": "A",
          "Description": "Basic principles of accounting."
        }
      ],
      // career goal not provided
    };

    const recommendations = recommendCourses(studentRecord);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].score).toBeGreaterThan(0);
  });  

  it('should apply correct weights for recognized grades', () => {
    const studentRecordWithKnownGrades = {
      'CalculateByLearningGap': true,
      'Courses taken': [
        {
          "Grade": "A",
          "Description": "Well-known course description."
        }
      ]
    };
    const description = createWeightedStudentDescription(studentRecordWithKnownGrades);
    expect(description.split(" ").length).toBeGreaterThan(1); 
  });
  
  it('should use a default weight for unrecognized grades', () => {
    const studentRecordWithUnknownGrades = {
      'CalculateByLearningGap': true,
      'Courses taken': [
        {
          "Grade": "Z", 
          "Description": "Unknown course description."
        }
      ]
    };
    const description = createWeightedStudentDescription(studentRecordWithUnknownGrades);
    
    expect(description.split(" ").length).toBeGreaterThanOrEqual(10); 
  });
  
  it('should handle missing career goal and use a dummy scores array', () => {
    const studentRecord = {
      'CalculateByLearningGap': true,
      'Courses taken': [
        {
          "Title": "Introduction to Accounting",
          "Grade": "A",
          "Description": "Basic principles of accounting."
        }
      ],
      // career goal not provided
    };
  
    const recommendations = recommendCourses(studentRecord);
    // console.log(recommendations); 
    expect(recommendations.every(course => course.score)).toBeTruthy();

  });

  describe('filterRecommendationsByAllowedSubject', () => {
    it('should filter recommendations by allowed subjects', () => {
      const baseRecommendations = [
        { Subject: 'ACCT', score: 0.9 },
        { Subject: 'CS', score: 0.8 }
      ];
      const allowedSubjects = ['ACCT'];

      const filtered = filterRecommendationsByAllowedSubject(baseRecommendations, allowedSubjects);
      expect(filtered.length).toBe(1);
      expect(filtered[0].Subject).toEqual('ACCT');
    });

    it('should return base recommendations if allowed subjects are empty/not provided', () => {
      const baseRecommendations = [
        { Subject: 'ACCT', score: 0.9 },
        { Subject: 'CS', score: 0.8 }
      ];
      const allowedSubjects = [];
  
      const filtered = filterRecommendationsByAllowedSubject(baseRecommendations, allowedSubjects);
      expect(filtered).toEqual(baseRecommendations);
    });

  });

  describe('adjustForCareerGoal', () => {
    it('should adjust scores with career scores correctly and normalize', () => {
      const baseScores = [0.5, 0.2, 0.8];
      const careerScores = [0.1, 0.2, 0.3];
      const combinedScores = baseScores.map((base, index) => base + careerScores[index]);
      const maxCombinedScore = Math.max(...combinedScores);
      const expectedNormalizedScores = combinedScores.map(score => score / maxCombinedScore);

      const adjustedScores = adjustForCareerGoal(baseScores, careerScores);

      expect(adjustedScores).toEqual(expectedNormalizedScores);
    });

    it('should handle empty scores arrays', () => {
      const baseScores = [];
      const careerScores = [];
      const adjustedScores = adjustForCareerGoal(baseScores, careerScores);
      expect(adjustedScores).toEqual([]);
    });
  
  });



  describe('isCourseSimilar', () => {
    beforeEach(() => {
      natural.JaroWinklerDistance.mockClear();
    });

    it('should return true for similar course titles', () => {
      const courseTitle = "Introduction to Computer Science";
      const coursesTaken = [{ Title: "Intro to CS" }]; // simulate similar title
      natural.JaroWinklerDistance.mockReturnValueOnce(0.76); // mock similarity score just above threshold
      expect(isCourseSimilar(courseTitle, coursesTaken)).toBeTruthy();
    });

    it('should return false for course titles that are noit similar', () => {
      const courseTitle = "Advanced Topics in Quantum Mechanics";
      const coursesTaken = [{ Title: "Intro to CS" }]; // not similar
      natural.JaroWinklerDistance.mockReturnValueOnce(0.4); // mock similarity score below threshold
      expect(isCourseSimilar(courseTitle, coursesTaken)).toBeFalsy();
    });
  });

});
