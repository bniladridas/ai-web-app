# AI-Powered Search Assistant

![MERN Stack](https://img.shields.io/badge/MERN-Stack-blue)
![Node.js](https://img.shields.io/badge/Node.js-v20.18.3-green)
![React](https://img.shields.io/badge/React-v18.2.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

A MERN-stack application leveraging Google Gemini API for advanced multimodal search and coding capabilities.

## How to Run the Project

### Prerequisites
- Node.js (v20.18.3 recommended)
- npm (included with Node.js)
- Git
- MongoDB (Atlas or local)

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/bniladridas/ai-web-app.git
   ```

2. **Navigate to the project directory**:
   ```bash
   cd ai-web-app
   ```

3. **Install backend dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   - Create a `.env` file in the root:
     ```bash
     PORT=5003
     MONGODB_URI=your_mongodb_atlas_uri
     JWT_SECRET=your_secure_jwt_secret
     GOOGLE_API_KEY=your_gemini_api_key
     ```

5. **Start the backend server**:
   ```bash
   node gemini-app.js
   ```

6. **Set up the frontend (React)**:
   - Navigate to the `/client` folder:
     ```bash
     cd client
     ```
   - Install frontend dependencies:
     ```bash
     npm install
     ```
   - Build for production:
     ```bash
     npm run build
     ```
   - Or run in development:
     ```bash
     npm start
     ```

7. **Access the application**:
   - Backend-served: `http://localhost:5003`
   - Dev server: `http://localhost:3000` (if using `npm start`)

## Why Use .gitignore?

The `.gitignore` file prevents sensitive files (e.g., `.env` with `JWT_SECRET` and API keys) and build artifacts (e.g., `/client/build`) from being tracked by Git, ensuring security and a clean repository.

## Modules Used

- **Express**: Minimalist web framework for Node.js.
- **Mongoose**: MongoDB object modeling for Node.js.
- **React**: Library for building user interfaces.
- **React Markdown**: Renders Markdown in React.
- **@google/generative-ai**: Integrates with the Gemini API.
- **jsonwebtoken**: Handles JWT authentication.

## Installation

1. **Install Node.js and npm** (e.g., via Homebrew on macOS):
   ```bash
   brew install node
   ```

2. **Install required modules**:
   ```bash
   npm install express mongoose jsonwebtoken @google/generative-ai
   cd client && npm install react react-dom react-markdown
   ```

## Optional Upgrade: Switching to GPT-4o

You can enhance this app by switching from Gemini to OpenAI GPT-4o:
- **Install**: `npm install openai`
- **Update `.env`**: Replace `GOOGLE_API_KEY` with `OPENAI_API_KEY=your_openai_api_key`
- **Modify `gemini-app.js`** (example):
  ```javascript
  const { OpenAI } = require("openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  app.post("/search", async (req, res) => {
    const { query } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: query }],
    });
    res.json({ response: completion.choices[0].message.content });
  });
  ```
- **Why GPT-4o?**:
  - **Reasoning**: Deeper, more nuanced search responses.
  - **Coding**: Cleaner, more reliable code generation (e.g., React components).
  - **Multimodal**: Strong text and image handling for future expansion.

## Box Chart

```plaintext
+---------------------+
|   AI-Powered       |
|   Search Assistant  |
+---------------------+
|   Frontend: React   |
|   Backend: Node.js  |
|   Database: MongoDB |
+---------------------+
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
