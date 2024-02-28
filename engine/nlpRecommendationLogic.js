
const coursesData = require('../resources/nlpDataCourseDescriptions.json');
const { computeSimilarityScores, vectorizeText } = require('./nlpDataProcessing');
const natural = require('natural');


//*-- Recommendation Logic --*/
//? Contains the algorithms for generating personalized course recommendations based on the user's profile and preferences.


function createWeightedStudentDescription(studentRecord) {
    let weightedDescriptions = "";

    if (studentRecord['Courses taken'] && studentRecord['Courses taken'].length) {
        // map grades to numerical weights
        const gradeWeightMap = studentRecord.CalculateByLearningGap ? {
            "A+": 1.0, "A": 1.25, "A-": 1.5,
            "B+": 1.75, "B": 2.0, "B-": 2.25,
            "C+": 3.0, "C": 3.75, "C-": 4.0,
            "D+": 4.25, "D": 4.5, "D-": 4.75,
            "F": 5.0
        } : {
            "A+": 5.0, "A": 4.75, "A-": 4.5,
            "B+": 4.25, "B": 4.0, "B-": 3.75,
            "C+": 3.0, "C": 2.25, "C-": 2.0,
            "D+": 1.75, "D": 1.5, "D-": 1.25,
            "F": 1.0
        };
        const baselineMultiplier = 10; // adjustable multiplier 

        studentRecord['Courses taken'].forEach(course => {
            const grade = course.Grade;
            const weight = gradeWeightMap[grade] || 1; // use a default weight if the grade is not recognized
            const repeatTimes = Math.round(weight * baselineMultiplier);
            const description = course.Description ? course.Description.trim() : "";
            // repeat the description based on its weight to increase its influence
            weightedDescriptions += " ".repeat(repeatTimes).split(" ").map(() => description).join(" ");
        });
    }

    return weightedDescriptions.trim();
}


function adjustForCareerGoal(baseScores, careerScores) {
    let adjustedScores = baseScores.map((score, index) => score + careerScores[index]);

    // normalize adjusted scores
    const maxScore = Math.max(...adjustedScores);
    if (maxScore > 0) {
        adjustedScores = adjustedScores.map(score => score / maxScore);
    }

    return adjustedScores;
}


const JaroWinklerDistance = natural.JaroWinklerDistance;

function isCourseSimilar(courseTitle, coursesTaken) {
    return coursesTaken.some(takenCourse => JaroWinklerDistance(courseTitle, takenCourse.Title) > 0.75);
}


function recommendCourses(studentRecord) {

    let studentDescription = createWeightedStudentDescription(studentRecord);
    let studentVector = vectorizeText(studentDescription);    
    let scores = computeSimilarityScores(studentVector);

    let careerScores = [];
    // check if "Career goal" is provided
    if (studentRecord['Career goal'] && studentRecord['Career goal'].trim()) {
        let careerGoalVector = vectorizeText(studentRecord['Career goal']);
        careerScores = computeSimilarityScores(careerGoalVector);
    } else {
        // else use a dummy scores array with zeros
        careerScores = new Array(scores.length).fill(0);
    }

    let adjustedScores = adjustForCareerGoal(scores, careerScores);




    // henerate base recommendations
    let baseRecommendations = coursesData.map((course, index) => ({
        ...course,
        score: adjustedScores[index]
    })).filter(course =>
        course.score > 0 && !isCourseSimilar(course.Title, studentRecord['Courses taken'])
    ).sort((a, b) => b.score - a.score);

    // return the base recommendations for potential caching and further filtering
    return baseRecommendations;
}


function filterRecommendationsByAllowedSubject(baseRecommendations, allowedSubjects) {

    // return baseRecommendations.filter(course =>
    //   !allowedSubjects || allowedSubjects.length === 0 || allowedSubjects.includes(course.Subject)
    // );
    // return all recommendations if "Allowed subject" is not provided or is empty
    if (!allowedSubjects || allowedSubjects.length === 0) {
      return baseRecommendations;
    }
    return baseRecommendations.filter(course =>
      allowedSubjects.includes(course.Subject)
    );
  
  }

module.exports = { recommendCourses, filterRecommendationsByAllowedSubject,
    createWeightedStudentDescription,
    adjustForCareerGoal, 
    isCourseSimilar }
