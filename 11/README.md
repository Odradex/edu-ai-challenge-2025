# Task 11: Audio Processing Application

This application transcribes, summarizes, and analyzes audio files using OpenAI's APIs.

## Prerequisites

- Node.js (v22 or higher recommended)
- An OpenAI API key

## Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**

    Create a `.env` file in this directory (`11/`) and add your OpenAI API key:

    ```
    OPENAI_API_KEY="your_openai_api_key"
    ```

    Replace `"your_openai_api_key"` with your actual key.

## How to Run

1.  **Start the application:**

    Run the application by passing the path to an audio file as an argument.

    ```bash
    node index.js /path/to/your/audiofile.mp3
    ```

    Replace `/path/to/your/audiofile.mp3` with the actual path to your audio file.

    The application will:
    - Transcribe the audio.
    - Summarize the transcription.
    - Analyze the transcription for word count, speaking speed, and frequently mentioned topics.
    - Save the transcription, summary, and analysis to `.md` and `.json` files in the `11/` directory.
    - Print the summary and analysis to the console.

God help me 🙏