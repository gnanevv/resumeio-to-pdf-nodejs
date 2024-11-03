export const renderIndexView = () => `
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resume Download Service</title>
      <style>
        ${getStyles()}
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Resume Download Service</h1>
        <p>Enter your rendering token to download your resume as a PDF.</p>
        <form action="/download" method="GET">
          <input type="text" name="rendering_token" placeholder="Rendering Token" required />
          <button type="submit">Download Resume</button>
        </form>
        <div class="footer">
          <div class="made-with-love">
            Made with love by 
            <a href="https://github.com/gnanevv">
              ${getGithubIcon()}
              gnanevv
            </a>
          </div>
        </div>
      </div>
    </body>
  </html>
`;

// Extract the CSS styles into a separate function for cleaner code organization
const getStyles = () => `
  body {
    background-color: #fef6e4;
    font-family: Arial, sans-serif;
    color: #5a2a27;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
  }
  .container {
    text-align: center;
    background-color: #f7e1c1;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    padding: 40px;
    width: 100%;
    max-width: 400px;
  }
  h1 {
    font-size: 24px;
    margin-bottom: 10px;
    color: #d17a57;
  }
  form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  input[type="text"] {
    padding: 10px;
    font-size: 16px;
    margin: 15px 0;
    border: 1px solid #d3a588;
    border-radius: 5px;
    width: 80%;
  }
  button {
    background-color: #d17a57;
    color: #ffffff;
    font-size: 16px;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  button:hover {
    background-color: #a4563f;
  }
  .footer {
    margin-top: 20px;
    font-size: 12px;
    color: #b07b61;
  }
  .footer a {
    color: #d17a57;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  .footer svg {
    width: 16px;
    height: 16px;
    margin-right: 5px;
    fill: #d17a57;
  }
  .made-with-love {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
`;

// Extract SVG for GitHub icon into a separate function
const getGithubIcon = () => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.6.111.82-.26.82-.577 0-.286-.01-1.043-.015-2.048-3.338.727-4.042-1.614-4.042-1.614-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.204.084 1.837 1.235 1.837 1.235 1.07 1.835 2.809 1.305 3.495.998.108-.774.42-1.306.762-1.606-2.665-.303-5.466-1.335-5.466-5.932 0-1.31.469-2.38 1.235-3.22-.123-.303-.535-1.52.118-3.168 0 0 1.008-.323 3.3 1.23.957-.266 1.984-.399 3.004-.404 1.02.005 2.047.138 3.004.404 2.292-1.553 3.3-1.23 3.3-1.23.653 1.648.241 2.865.118 3.168.767.84 1.235 1.91 1.235 3.22 0 4.608-2.803 5.625-5.474 5.922.43.372.814 1.104.814 2.224 0 1.606-.014 2.898-.014 3.293 0 .319.218.694.825.576C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
`;
