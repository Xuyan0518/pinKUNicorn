import axios from 'axios';

const API_KEY = 'api key'; // Replace with your actual API key
const API_URL = 'https://api.openai.com/v1/chat/completions';

const getChatGPTResponse = async (userInput) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: 'gpt-3.5-turbo', // Or 'gpt-4', depending on the model you're using
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' }, // Optional system message
          { role: 'user', content: userInput }
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );
    console.log(response.data.choices[0].message.content.trim());
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error fetching data from OpenAI:', error);
    throw new Error('Failed to fetch response from ChatGPT');
  }
};

export default getChatGPTResponse;