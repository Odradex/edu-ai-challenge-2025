# Service Analyzer

A Node.js console application that takes a service name or description and uses the OpenAI API to generate a multi-perspective report in markdown format.

## Features

- Analyzes services based on a name (e.g., "Notion") or a description (e.g., "A tool for thought and project management").
- Generates a structured report with sections like History, Target Audience, Core Features, and more.
- Uses `gpt-4o-mini` for analysis.
- Displays the report in the console.
- Optionally saves the report to `output.md`.

## Prerequisites

- Node.js (v18 or higher recommended)
- An OpenAI API key

## Installation

1.  **Clone the repository:**

2.  **Install dependencies:**
    ```sh
    npm install
    ```

## Configuration

1.  Create a `.env` file in the root of the directory.
2.  Add your OpenAI API key to the `.env` file:
    ```
    OPENAI_API_KEY=your_super_secret_api_key
    ```

## How to Run

Execute the application with the following command:

```sh
npm start
```

You will be prompted to enter a service name or description. Follow the on-screen prompts to generate and optionally save the report.
