const request = require('supertest');
const express = require('express');
const { validateApiKey, validateStudentRecord } = require('./nlpMiddlewares');

jest.mock('./nlpApiKeys.json', () => ({
    validApiKeys: ['test-api-key']
}));

describe('NLP Middlewares', () => {
    describe('api key validation', () => {
        const app = express();
        app.use(validateApiKey);
        app.get('/', (req, res) => res.status(200).json({ message: 'Success' }));

        it('should allow request with valid API key', async () => {
            const response = await request(app).get('/').set('X-API-Key', 'test-api-key');
            expect(response.statusCode).toBe(200);
        });

        it('should reject request with invalid API key', async () => {
            const response = await request(app).get('/').set('X-API-Key', 'invalid-key');
            expect(response.statusCode).toBe(401);
        });
    });

    describe('Student Record Validation', () => {
        const app = express();
        app.use(express.json());
        app.post('/', validateStudentRecord, (req, res) => res.status(200).json({ message: 'Valid' }));
    
        const validRecord = {
            "CalculateByLearningGap": true,
            "Degree program": "Software Engineering",
            "Courses taken": [{
                "Subject": "CS",
                "Number": "101",
                "Course": "CS101",
                "Title": "Introduction to Computer Science",
                "Description": "An introductory course...",
                "Grade": "A"
            }],
            "Allowed subject": ["CS", "IT"]
        };
    
        it('should validate correct student record', async () => {
            const response = await request(app)
                .post('/')
                .send(validRecord);
            expect(response.statusCode).toBe(200);
        });
    
        it('should reject record with missing degree program', async () => {
            let invalidRecord = { ...validRecord, "Degree program": "" };
            const response = await request(app)
                .post('/')
                .send(invalidRecord);
            expect(response.statusCode).toBe(400);
        });
    
        it('should reject record with incorrect course object structure', async () => {
            let invalidRecord = { ...validRecord, "Courses taken": [{ "InvalidKey": "InvalidValue" }] };
            const response = await request(app)
                .post('/')
                .send(invalidRecord);
            expect(response.statusCode).toBe(400);
        });
    
        it('should reject record with non-array Allowed subject', async () => {
            let invalidRecord = { ...validRecord, "Allowed subject": "Invalid" };
            const response = await request(app)
                .post('/')
                .send(invalidRecord);
            expect(response.statusCode).toBe(400);
        });
    
        it('should reject record with non boolean CalculateByLearningGap', async () => {
            let invalidRecord = { ...validRecord, "CalculateByLearningGap": "Invalid" };
            const response = await request(app)
                .post('/')
                .send(invalidRecord);
            expect(response.statusCode).toBe(400);
        });
    });
});

