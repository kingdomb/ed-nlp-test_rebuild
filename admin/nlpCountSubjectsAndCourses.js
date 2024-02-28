const fs = require('fs');

function countSubjectsAndCourses() {

    fs.readFile('./resources/nlpDataCourseDescriptions.json', (err, data) => {
        if (err) throw err;

        const courses = JSON.parse(data);
        const subjectsSet = new Set();
        const coursesSet = new Set();

        courses.forEach(course => {
            subjectsSet.add(course.Subject);
            coursesSet.add(course.Course);
        });

        console.log(`KSU Catalog courses: ./resources/nlpDataCourseDescriptions.json`);
        console.log(`Total unique subjects: ${subjectsSet.size}`);
        console.log(`Total unique courses: ${coursesSet.size}`);
    });
}

module.exports = countSubjectsAndCourses;