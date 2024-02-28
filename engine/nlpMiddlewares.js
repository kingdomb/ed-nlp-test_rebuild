const rateLimit = require('express-rate-limit');
const { validApiKeys } = require('./nlpApiKeys.json');

// middleware Function for API Key Validation
function validateApiKey(req, res, next) {
    const apiKey = req.header('X-API-Key');
    // const validApiKeys = ['289822b8c9de15456215e16b3ec512caed1c21458563c86094e9aef6f3f51d29'];
  
    if (validApiKeys.includes(apiKey)) {
      next();
    } else {
      res.status(401).json({ error: 'Invalid API Key' });
    }
  }

// middleware to limit each IP to 60 requests per windowMs
const limiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 60, 
      handler: function (req, res /*, next */) {
          res.status(429).json({
              error: "Too many requests, please try again later."
            });
        }
    });
    

function validateStudentRecord(req, res, next) {

  const studentRecord = req.body;

  // validate 'Degree program' is a non-empty string
  if (typeof studentRecord['Degree program'] !== 'string' || !studentRecord['Degree program'].trim()) {
    return res.status(400).json({ error: 'Degree program is required and must be a string.' });
  }

  // validate 'CalculateByLearningGap' is a boolean
  if (typeof studentRecord['CalculateByLearningGap'] !== 'boolean') {
    return res.status(400).json({ error: 'CalculateByLearningGap is required and must be a boolean.' });
  }

  // Validate 'Courses taken' is a required non-empty array with specific properties of type string
  if (!Array.isArray(studentRecord['Courses taken']) || studentRecord['Courses taken'].length === 0 || studentRecord['Courses taken'].some(course =>
    typeof course.Subject !== 'string' ||
    typeof course.Number !== 'string' ||
    typeof course.Course !== 'string' ||
    typeof course.Title !== 'string' ||
    typeof course.Description !== 'string' ||
    typeof course.Grade !== 'string')) {
    return res.status(400).json({ error: 'Courses taken is required and must be a non-empty array of objects with specific string properties.' });
  }

  // validate 'Allowed subject' is an array of strings
  if (!Array.isArray(studentRecord['Allowed subject']) || studentRecord['Allowed subject'].some(subject => typeof subject !== 'string')) {
    return res.status(400).json({ error: 'Allowed subject must be an array of strings.' });
  }

next()

    }



module.exports = {validateApiKey, limiter, validateStudentRecord}