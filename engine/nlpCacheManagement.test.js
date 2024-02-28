const { generateBaseCacheKey } = require('./nlpCacheManagement');

describe('generateBaseCacheKey', () => {
  it('should generate a correct cache key for a student record with courses and grade', () => {
    const studentRecord = {
      "CalculateByLearningGap": false,
      "Career goal": "Frontend Developer",
      "Degree program": "Software Engineering",
      "Courses taken": [
        { "Course": "SWE3313", "Grade": "A" },
        { "Course": "SWE3623", "Grade": "B" }
      ]
    };
    const expectedKey = "false-Frontend Developer-Software Engineering-[{\"Course\":\"SWE3313\",\"Grade\":\"A\"},{\"Course\":\"SWE3623\",\"Grade\":\"B\"}]";
    const key = generateBaseCacheKey(studentRecord);
    expect(key).toBe(expectedKey);
  });

  it('should use "NoGrade" for courses without a grade', () => {
    const studentRecord = {
      "CalculateByLearningGap": true,
      "Career goal": "Data Scientist",
      "Degree program": "Computer Science",
      "Courses taken": [
        { "Course": "CS101", "Grade": "B" },
        { "Course": "CS102" } // no grade provided
      ]
    };
    const expectedKey = "true-Data Scientist-Computer Science-[{\"Course\":\"CS101\",\"Grade\":\"B\"},{\"Course\":\"CS102\",\"Grade\":\"NoGrade\"}]";
    const key = generateBaseCacheKey(studentRecord);
    expect(key).toBe(expectedKey);
  });
});
