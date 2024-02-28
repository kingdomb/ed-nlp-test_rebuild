const express = require('express');
const cors = require('cors');
const { startup } = require('./engine/nlpServerStartup');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors({ origin: '*' }));

//*-- Application Launch --*/
//? Executes the necessary startup procedures to load data, prepare the system, and launch the server.

app.listen(port, () => console.log(`Listening on port ${port}`));

// end
