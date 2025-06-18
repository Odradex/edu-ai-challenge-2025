require('dotenv').config();
const OpenAI = require('openai');
const readline = require('readline');
const fs = require('fs');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load the dataset
const products = JSON.parse(fs.readFileSync('products.json', 'utf-8'));

/**
 * Displays the filtered list of products.
 * This function is called by the AI with the products that match the user's query.
 * @param {object[]} filteredProducts - The array of product objects to display.
 */
function displayFilteredProducts(filteredProducts) {
  if (filteredProducts && filteredProducts.length > 0) {
    console.log('\nFiltered Products:');
    filteredProducts.forEach(product => {
      console.log(
        `- ${product.name} - $${product.price}, Rating: ${product.rating}, ${
          product.in_stock ? 'In Stock' : 'Out of Stock'
        }`
      );
    });
  } else {
    console.log('\nNo products found matching your criteria.');
  }
}

const tools = [
  {
    type: 'function',
    function: {
      name: 'displayFilteredProducts',
      description: 'Displays a list of filtered products to the user.',
      parameters: {
        type: 'object',
        properties: {
          filteredProducts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                category: { type: 'string' },
                price: { type: 'number' },
                rating: { type: 'number' },
                in_stock: { type: 'boolean' },
              },
              required: ['name', 'category', 'price', 'rating', 'in_stock'],
            },
          },
        },
        required: ['filteredProducts'],
      },
    },
  },
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  rl.question('Hi! What are you looking for today?\n> ', async (userInput) => {
    try {
      const messages = [
        { 
          role: 'system', 
          content: `You are a helpful assistant that filters a product catalog based on user queries. The user will provide a natural language search query. Your task is to analyze the query, filter the provided JSON product data, and then call the 'displayFilteredProducts' function with the array of matching products. Do not perform any other filtering on your own. The product data is: ${JSON.stringify(products)}`
        },
        { 
          role: 'user', 
          content: userInput 
        }
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages,
        tools,
        tool_choice: { type: "function", function: { name: "displayFilteredProducts" } },
      });

      const responseMessage = response.choices[0].message;
      const toolCalls = responseMessage.tool_calls;

      if (toolCalls) {
        for (const toolCall of toolCalls) {
          if (toolCall.function.name === 'displayFilteredProducts') {
            const functionArgs = JSON.parse(toolCall.function.arguments);
            displayFilteredProducts(functionArgs.filteredProducts);
          }
        }
      } else {
        // Fallback if the model doesn't call the function
        console.log("\nI was unable to filter the products based on your request. Please try again with a different query.");
      }
    } catch (error) {
      console.error('An error occurred:', error);
    } finally {
      rl.close();
    }
  });
}

main(); 