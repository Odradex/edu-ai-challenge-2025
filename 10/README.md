# Task 10: AI-Powered Product Search

This is a console-based product search tool that uses the OpenAI API to understand natural language queries and filter a product dataset.

## Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**

    Create a `.env` file in this directory (`10/`) and add your OpenAI API key:

    ```
    OPENAI_API_KEY="your_openai_api_key"
    ```

    Replace `"your_openai_api_key"` with your actual key.

## How to Run

1.  **Start the application:**
    ```bash
    npm start
    ```

2.  **Enter your search query:**
    When prompted, type your product request in natural language. For example:
    - "I need a something for the kitchen that costs less than $90"
    - "Show me fitness gear that is in stock"
    - "Find electronics with a rating of at least 4.6"

The application will then contact the OpenAI API, find matching products from `products.json`, and display the results in your console.
