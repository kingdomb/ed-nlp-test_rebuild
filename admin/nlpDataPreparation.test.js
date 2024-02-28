const fs = require('fs');
const {
    preprocessCourses,
    saveCourseVectorsToFile,
    buildVocabulary,
    loadCourseData,
    vectorizeText,
    generateCourseVectors,
} = require('./nlpDataPreparation');

jest.mock('fs', () => ({
    promises: {
        writeFile: jest.fn().mockResolvedValue(undefined),
        readFile: jest.fn().mockRejectedValue(new Error('Failed to read course data')),
    },
    writeFileSync: jest.fn(),
}));

describe('NLP Data Preparation', () => {

    let globalVocabulary = new Set();
    let vocabularyIndexMap = new Map();

    beforeEach(() => {
        jest.clearAllMocks();
        globalVocabulary.clear();
        vocabularyIndexMap.clear();
    });


    describe('vectorizeText incrementing existing vector entries', () => {


        it('returns an empty vector for an empty string', () => {
            const vector = vectorizeText("");
            expect(vector.every(v => v === 0)).toBeTruthy();
        });

        it('ignores words not in vocabulary', () => {
            const vector = vectorizeText("unknownword");
            expect(vector.every(v => v === 0)).toBeTruthy();
        });
    });


    describe('preprocessCourses error handling', () => {
        it('should log an error if writing to the file fails', async () => {
            fs.promises.writeFile.mockRejectedValue(new Error('file write error'));

            await expect(preprocessCourses()).rejects.toThrow('file write error');
            expect(console.error).toHaveBeenCalledWith('Error processing course data:', expect.any(Error));
        });

    });

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterAll(() => {
        console.error.mockRestore();
    });
});