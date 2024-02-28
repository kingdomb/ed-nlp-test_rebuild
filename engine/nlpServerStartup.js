const swaggerUi = require('swagger-ui-express');
const markdownIt = require('markdown-it')();
const readme = require('../resources/nlpConciseReadme');
const {loadGlobalVocabulary } = require('./nlpDataProcessing');
const { validateApiKey, limiter, validateStudentRecord } = require('./nlpMiddlewares');
const { generateBaseCacheKey } = require('./nlpCacheManagement');
const { recommendCourses, filterRecommendationsByAllowedSubject } = require('./nlpRecommendationLogic');
const cache = new Map(); // in-memory cache


//*-- Server Startup and Request Handling --*/
//? Configures the web server routes, including API documentation and recommendation endpoint.

async function startup(app) {
    await loadGlobalVocabulary();
  
    const swaggerDocument = require('../resources/nlpSwaggerDefinition.json');
  
    app.use('/api-swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  
  
    app.get('/readme', (req, res) => {
      const result = markdownIt.render(readme);
      res.type('text/html');
      res.send(`
      <head>
          <meta name="robots" content="noindex, nofollow">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css">
          <style>body {box-sizing: border-box;min-width: 200px;max-width: 980px;margin: 0 auto;padding: 45px;}</style>
      </head>
      <body>
          <article class="markdown-body">${result}</article>
      </body>
  `);
    });
  
  
    app.post('/recommend', limiter, validateApiKey, validateStudentRecord, (req, res) => {
      
      const studentRecord = req.body;
  
  
      // generate a cache key that does NOT include "Allowed subject"
      const baseCacheKey = generateBaseCacheKey(studentRecord);
  
      let recommendations;
      if (cache.has(baseCacheKey)) {
        console.log('Serving base recommendations from cache');
        const baseRecommendations = cache.get(baseCacheKey);
        // dynamically apply "Allowed subject" filter
        recommendations = filterRecommendationsByAllowedSubject(baseRecommendations, studentRecord['Allowed subject']);
      } else {
        const baseRecommendations = recommendCourses(studentRecord);
        // cache the base recommendations
        cache.set(baseCacheKey, baseRecommendations);
        // apply "Allowed subject" filter
        recommendations = filterRecommendationsByAllowedSubject(baseRecommendations, studentRecord['Allowed subject']);
      }
  
      //   res.json({ recommendations: recommendations.slice(0, 25) }); // adjustable number of recommendations
  
      // filter recommendations to only include those with scores greater than 0.55
      recommendations = recommendations.filter(course => course.score > 0.55);
  
      res.json({ recommendations });
  
    });

    app.get('/robots.txt', (req, res) => {
      res.type('text/plain');
      res.send("User-agent: *\nDisallow: /");
    });
  
  }


module.exports = {startup}
