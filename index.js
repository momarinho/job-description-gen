const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const OPENAI_API_KEY = ''

const app = express();

app.use(express.json());

// serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// an api endpoint that generates the job description
app.post('/generate-description', async (req, res) => {
  const { jobTitle, industry, keyWords, tone, numWords } = req.body;

  try {
    const response = await fetch(
      'https://api.openai.com/v1/engines/text-davinci-003/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: `Write a job description for a  ${jobTitle} role 
          ${industry ? `in the ${industry} industry` : ''} that is around ${
            numWords || 200
          } words in a ${tone || 'neutral'} tone. ${
            keyWords ? `Incorporate the following keywords: ${keyWords}.` : ''
          }. The job position should be described in a way that is SEO friendly, highlighting its unique features and benefits.`,
          max_tokens: 300,
          temperature: 0.5,
        }),
      }
    );

    const { choices } = await response.json();
    const jobDescription = choices[0].text;

    res.status(200).json({
      jobDescription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while generating job description');
  }
});

// Handles any requests that don't match the ones above
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
