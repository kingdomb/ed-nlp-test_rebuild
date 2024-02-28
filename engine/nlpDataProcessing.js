
const courseVectors = require('../resources/nlpDataCourseVectorsCache.json');
const vocabularyContent = require('../resources/nlpDataGlobalVocabulary.json');
const math = require('mathjs');


//*-- Initialization --*/
//? Defines the foundational data structures for the application's core functionality.

let globalVocabulary = new Set();

let vocabularyArray = Array.from(globalVocabulary); // convert Set to Array for indexing

let vocabularyIndexMap = new Map();

//*-- Data Processing and Vocabulary Management --*/
//? Includes methods for loading course data and managing the vocabulary, which are critical for understanding the content to be analyzed.

async function loadGlobalVocabulary() {
  try {
    globalVocabulary = new Set(vocabularyContent);
    vocabularyArray = Array.from(globalVocabulary);
    updateVocabularyIndexMap();
  } catch (error) {
    console.error('Failed to load global vocabulary:', error);
  }
}

// update the vocabulary index map 
function updateVocabularyIndexMap() {
  vocabularyArray = Array.from(globalVocabulary);
  vocabularyIndexMap.clear();
  vocabularyArray.forEach((word, index) => {
    vocabularyIndexMap.set(word, index);
  });
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

/* 

note: 

tf-idf was applied to course descriptions, but not directly feasible with student descriptions as it lacks full corpus analysis; it requires knowledge of document frequencies for each term across the entire set of documents to accurately calculate idf 

the approach used here is tf vectorization, where each word's occurrence in the text is counted and used to create a vector representation, without adjusting frequencies by idf

*/


function computeSimilarityScores(studentVector) {
  return courseVectors.map(courseVector => {
    // ensure both vectors have the same length
    if (studentVector.length !== courseVector.length) {
      throw new Error("Vectors must have equal length");
    }
    const dotProduct = math.dot(studentVector, courseVector);
    const normA = math.norm(studentVector);
    const normB = math.norm(courseVector);
    // return dotProduct / (normA * normB);

    // ensure norms are not zero to avoid division by zero
    if (normA === 0 || normB === 0) {
      return 0;
    }
    const similarity = dotProduct / (normA * normB);
    
    // ensure score between 0-1
    return Math.max(0, Math.min(similarity, 1));


  });
}





module.exports = {loadGlobalVocabulary, vectorizeText, computeSimilarityScores}