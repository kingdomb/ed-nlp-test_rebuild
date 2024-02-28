/**
 * This script, `nlpDataPreparation.js`, is designed to run independently from `index.js` to preprocess and prepare necessary files for the NLP engine. It must be executed manually to generate processed course data and vocabulary for the NLP tasks in `index.js`. 
 * 
 * This preprocessing step is crucial for setting up the NLP engine in `index.js` by providing it with the necessary vocabulary and precomputed vectors for course descriptions.
 * 
 * Expected Inputs:
 * - JSON file containing course descriptions located in the `../resources/nlpDataCourseDescriptions.json`.
 * 
 * What it does:
 * 1. Reads course descriptions from the specified JSON file.
 * 2. Performs TF-IDF preprocessing on course descriptions to extract vocabulary and compute term frequencies.
 * 3. Generates vector representations of course descriptions for use in NLP tasks.
 * 4. Saves processed course data and vocabulary to 
 *    a) `../resources/nlpDataProcessedCourses.json` and 
 *    b) `../resources/nlpDataCourseVectorsCache.json`, respectively.
 * 5. A global vocabulary is saved to 
 *    c) `../resources/nlpDataGlobalVocabulary.json`.
 * 
 * Expected Outputs:
 * - Processed course data and vocabulary files in the `../resources` directory.
 * 
 * Usage:
 * Run this script with Node.js by executing `node admin/nlpDataPreparation.js` from the project root directory. 
 
 */

const fs = require('fs');
const path = require('path');
const natural = require('natural');
const courseDescriptions = require('../resources/nlpDataCourseDescriptions.json')

const { promises: fsPromises } = fs;


const outputFilePath = path.join(__dirname, '../resources/nlpDataProcessedCourses.json');
const courseVectorsFilePath = path.join(__dirname, '../resources/nlpDataCourseVectorsCache.json');

//*-- Global Variables and TF-IDF Initialization --*/
//? Defines the foundational data structures for the application's core functionality.

const tfidfPreprocess = new natural.TfIdf();
let globalVocabularyPreprocess = new Set();

let coursesData = [];

let courseVectors = [];

let globalVocabulary = new Set();


let vocabularyArray = Array.from(globalVocabulary); // convert Set to Array for indexing


//*-- Preprocess Courses --*/

async function preprocessCourses() {
    try {
        const coursesData = courseDescriptions
        coursesData.forEach(course => {
            if (course.Description) {
                tfidfPreprocess.addDocument(course.Description);
                const words = course.Description.match(/\w+/g) || [];
                words.forEach(word => globalVocabularyPreprocess.add(word.toLowerCase()));
            }
        });

        const courseVectorsPreprocess = tfidfPreprocess.documents.map(doc => {
            const vector = [];
            Object.keys(doc).forEach(term => {
                const score = tfidfPreprocess.tfidf(term, tfidfPreprocess.documents.indexOf(doc));
                vector.push(score);
            });
            return vector;
        });

        const vocabularyArray = Array.from(globalVocabularyPreprocess);
        const processedData = { vocabularyArray, courseVectorsPreprocess };

        await fs.promises.writeFile(outputFilePath, JSON.stringify(processedData, null, 2));

        const vocabularyFilePath = path.join(__dirname, '../utils', 'nlpDataGlobalVocabulary.json');
        await fsPromises.writeFile(vocabularyFilePath, JSON.stringify(Array.from(globalVocabularyPreprocess)));

        console.log('Course data preprocessed and saved.');
    } catch (err) {
        console.error('Error processing course data:', err);
        throw err; 
    }
}



//*-- Vectorization and Similarity Computation --*/
//? These functions transform text into vector representations and compute similarities, essential for recommendation logic.

function vectorizeText(text) {
    // initialize a sparse vector to optimize memory
    const vector = {};
    const words = text.match(/\w+/g) || [];
    words.forEach(word => {
        const wordLowerCase = word.toLowerCase();
        if (vocabularyIndexMap.has(wordLowerCase)) {
            const index = vocabularyIndexMap.get(wordLowerCase);
            if (!vector[index]) {
                vector[index] = 1;
            } else {
                vector[index] += 1;
            }
        }
    });
    // convert the sparse vector into a dense vector format if necessary
    const denseVector = new Array(vocabularyArray.length).fill(0);
    Object.keys(vector).forEach(index => {
        denseVector[index] = vector[index];
    });
    return denseVector;
}


//*-- Data Processing and Vocabulary Management --*/
//? Includes methods for loading course data and managing the vocabulary, which are critical for understanding the content to be analyzed.

function generateCourseVectors() {
    courseVectors = []; // clear existing vectors
    coursesData.forEach(course => {
        if (course.Description) {
            const vector = vectorizeText(course.Description);
            courseVectors.push(vector); // store the vector representation
        } else {
            // handle courses with no description by pushing an empty vector
            courseVectors.push(new Array(globalVocabulary.size).fill(0));
        }
    });
    console.log(`Precomputed vectors for ${courseVectors.length} courses.`);
}


async function loadCourseData(generateVectors = true) {
    try {
        coursesData = courseDescriptions
        buildVocabulary();
        if (generateVectors) {
            generateCourseVectors();
        }
        console.log('Course data loaded and processed.');
    } catch (err) {
        console.error('Error reading course data:', err.message);
    }
}


async function saveCourseVectorsToFile() {
    // ensure course data and vocabulary are loaded and processed
    await loadCourseData();
    buildVocabulary();
    updateVocabularyIndexMap();

    // generate course vectors with precomputed vectors
    generateCourseVectors();


    // save the precomputed course vectors to a file
    fs.writeFileSync(courseVectorsFilePath, JSON.stringify(courseVectors));
    console.log('Course vectors saved to file:', courseVectorsFilePath);
}


function buildVocabulary() {
    coursesData.forEach(course => {
        if (course.Description) {
            const words = course.Description.match(/\w+/g) || [];
            words.forEach(word => {
                globalVocabulary.add(word.toLowerCase());
            });
        }
    });

    // populate vocabularyArray after globalVocabulary is updated
    vocabularyArray = Array.from(globalVocabulary);

    updateVocabularyIndexMap(); // ensure the map is up to date
}


// set a map for efficient lookups
let vocabularyIndexMap = new Map();


// update the vocabulary index map 
function updateVocabularyIndexMap() {
    vocabularyArray = Array.from(globalVocabulary);
    vocabularyIndexMap.clear();
    vocabularyArray.forEach((word, index) => {
        vocabularyIndexMap.set(word, index);
    });
}

preprocessCourses();
saveCourseVectorsToFile();


module.exports = { 
    preprocessCourses,
    saveCourseVectorsToFile,
    buildVocabulary,
    loadCourseData,
    vectorizeText, // Exporting for testing purposes
    generateCourseVectors, // Exporting for testing purposes
    globalVocabulary, 
    vocabularyIndexMap
 };



// end



