//*-- Cache Management --*/
//? Manages caching of recommendations


function generateBaseCacheKey(studentRecord) {
  // include "CalculateByLearningGap", "Career goal", "Degree program",
  // and a serialization of "Courses taken" with both course codes;
  // courses without grades will have a default value of 'NoGrade'
  const coursesTakenSerialized = JSON.stringify(studentRecord['Courses taken'].map(course => {
    return {Course: course.Course, Grade: course.Grade || 'NoGrade'}; 
  }));

  return `${studentRecord['CalculateByLearningGap']}-${studentRecord['Career goal']}-${studentRecord['Degree program']}-${coursesTakenSerialized}`;
}

  module.exports = { generateBaseCacheKey}
