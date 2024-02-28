const { loadGlobalVocabulary, vectorizeText, computeSimilarityScores } = require('./nlpDataProcessing');

jest.mock('../resources/nlpDataGlobalVocabulary.json', () => ["word1", "word2", "word3"]);
jest.mock('../resources/nlpDataCourseVectorsCache.json', () => [[1, 0, 2], [2, 1, 0]]);
jest.mock('mathjs', () => ({
  dot: jest.fn(),
  norm: jest.fn(),
}));

describe('NLP Data Processing', () => {

  describe('vectorizeText', () => {
    beforeEach(async () => {
      await loadGlobalVocabulary();
    });

    it('should correctly vectorize text with known words', () => {
      const text = "word1 word3 word3";
      const vector = vectorizeText(text);
      expect(vector).toEqual([1, 0, 2]);
    });

    it('should handle text with unknown words', () => {
      const text = "word1 unknown word3";
      const vector = vectorizeText(text);
      expect(vector).toEqual([1, 0, 1]);
    });

    it('should return a vector of 0s for empty string or text without word characters', () => {
      const texts = ["", "   ", "123", "!@#", "$%^&", "\n\t"];
      texts.forEach(text => {
        const vector = vectorizeText(text);
        const expectedVectorLength = 3; 
        const expectedVector = new Array(expectedVectorLength).fill(0);
        expect(vector).toEqual(expectedVector);
      });
    });
  
  });

  describe('computeSimilarityScores', () => {
    it('should compute similarity scores correctly', () => {
      const studentVector = [1, 0, 2];
      const similarityScores = computeSimilarityScores(studentVector);
      expect(similarityScores).toEqual(expect.any(Array));
      expect(similarityScores.length).toBe(2);
    });

    it('should throw error for vectors of unequal length', () => {
      const studentVector = [1, 0]; // incorrect length
      expect(() => computeSimilarityScores(studentVector)).toThrow("Vectors must have equal length");
    });

  });

  
});
