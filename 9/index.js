import 'dotenv/config';
import OpenAI from 'openai';
import inquirer from 'inquirer';
import fs from 'fs/promises';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are an expert business and technology analyst. Your task is to generate a concise, multi-perspective report on a given service or product. The user will provide a service name or a description.

Generate the report in markdown format with the following sections, precisely in this order:

### Brief History
A short summary of the service's origin and key milestones.

### Target Audience
Describe the primary users or customers for this service.

### Core Features
List the main functionalities of the service.

### Unique Selling Points
What makes this service stand out from its competitors?

### Business Model
How does the service make money? (e.g., Subscription, Freemium, Ads, etc.)

### Tech Stack Insights
Provide an educated guess on the potential technologies used (frontend, backend, database). Mention this is an estimation.

### Perceived Strengths
List key advantages or positive aspects of the service.

### Perceived Weaknesses
List potential drawbacks or areas for improvement.

---

Here is an example of the desired output format.

User Input: "A platform for developers to host and review code"

Your Output:

### Brief History
Founded in 2008, GitHub was created as a platform for hosting Git repositories. It quickly became the largest host of source code in the world. Microsoft acquired it in 2018 for $7.5 billion.

### Target Audience
The primary audience is software developers, open-source communities, and businesses of all sizes that need to manage source code and collaborate on software projects.

### Core Features
- Git repository hosting
- Pull requests for code review
- Issue tracking
- GitHub Actions for CI/CD
- GitHub Pages for static site hosting

### Unique Selling Points
- Strong network effects due to its massive user base.
- Tight integration of version control, collaboration, and automation tools.
- Robust free tier for public and private repositories.

### Business Model
GitHub operates on a Freemium model. Core features are free for public and private repositories. It charges for advanced features, enterprise-level security, and private package hosting through its Team and Enterprise plans.

### Tech Stack Insights
- **Frontend:** Likely uses a modern JavaScript framework like React.
- **Backend:** Primarily built on Ruby on Rails.
- **Database:** Uses MySQL for its primary database.
- **Infrastructure:** Hosted on Microsoft Azure since the acquisition.
*(Note: This is an educated guess based on public information.)*

### Perceived Strengths
- Industry standard for source code hosting.
- Excellent collaboration and review tools.
- Powerful automation with GitHub Actions.

### Perceived Weaknesses
- Can be complex for beginners unfamiliar with Git.
- The user interface can feel cluttered at times.
- Dependence on a single, centralized platform for critical infrastructure.
`;

async function main() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY is not set.');
      console.error('Please create a .env file and add your API key.');
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'service',
        message: 'Enter a service name (e.g., "Spotify") or a description:',
        validate: (input) => input.trim() !== '' || 'Please enter a valid service or description.',
      },
      {
        type: 'confirm',
        name: 'saveToFile',
        message: 'Save the report to output.md?',
        default: false,
      },
    ]);

    console.log('\nGenerating your report, please wait...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: answers.service,
        },
      ],
      temperature: 0.6,
    });

    const report = response.choices[0].message.content;

    console.log('\n--- Service Report ---\n');
    console.log(report);
    console.log('\n--- End of Report ---\n');

    if (answers.saveToFile) {
      await fs.writeFile('output.md', report);
      console.log('Report successfully saved to output.md');
    }
  } catch (error) {
    console.error('\nAn error occurred:');
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.data.error.message}`);
    } else {
      console.error(error.message);
    }
  }
}

main();
