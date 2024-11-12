# Emotion-Driven Music

Emotion-Driven Music is a web application that analyzes a user’s emotions via facial recognition and suggests music that matches the detected mood. This project uses a React frontend and a Python backend to provide real-time emotion analysis and music recommendations.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [Usage](#usage)

  
## Features

- Real-time emotion detection using facial recognition.
- Music recommendations based on detected emotions.
- User-friendly interface for seamless interaction.

## Technologies

- **Frontend:** React, HTML, CSS, JavaScript
- **Backend:** Python (Flask)
- **Emotion Analysis:** OpenCV, Dlib
- **Music API:** Spotify Web API (requires Client ID)

## Setup

### Prerequisites

1. [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) (or [Yarn](https://yarnpkg.com/)) for the frontend.
2. [Python 3.x](https://www.python.org/) and [pip](https://pip.pypa.io/en/stable/) for the backend.
3. [Spotify Developer Account](https://developer.spotify.com/) to obtain the `CLIENT_ID` for accessing the Spotify Web API.

### Environment Variables

In the root directory, create a `.env` file and define the following environment variables:

```plaintext
REACT_APP_CLIENT_ID="YOUR_CLIENT_ID"
REACT_APP_REDIRECT_ID=http://localhost:3000/
```

Replace `"YOUR_CLIENT_ID"` with your actual Spotify Client ID.

## Setup Instructions

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/YB-CG/Emotion-Driven-Music.git
    cd Emotion-Driven-Music
    ```

2. **Frontend Setup (Client):**

    Open a terminal, navigate to the client directory, and set up the frontend.

    ```bash
    cd client
    ```

    - **Set Execution Policy (Windows only):**

        ```bash
        Set-ExecutionPolicy Unrestricted -Scope Process
        ```

    - **Set Legacy Provider (for OpenSSL compatibility):**

        ```bash
        $env:NODE_OPTIONS="--openssl-legacy-provider"
        ```

    - Install the dependencies:

        ```bash
        yarn install
        ```

      Alternatively, if using npm:

        ```bash
        npm install
        ```

    - Start the frontend server:

        ```bash
        yarn start
        ```

      Alternatively, if using npm:

        ```bash
        npm start
        ```

    The frontend server should now be running on `http://localhost:3000`.

3. **Backend Setup (Server):**

    Open another terminal, navigate to the server directory, and set up the backend.

    ```bash
    cd server
    ```

    - **Set Execution Policy (Windows only):**

        ```bash
        Set-ExecutionPolicy Unrestricted -Scope Process
        ```

    - **Create and Activate the Virtual Environment:**

        ```bash
        python -m venv env
        env\Scripts\activate
        ```

    - Install the required Python packages:

        ```bash
        pip install -r requirements.txt
        ```

    - Start the backend server:

        ```bash
        python app.py
        ```

    The backend server should now be running, ready to handle requests from the frontend.

## Usage

1. **Access the Application:**

   Open your browser and go to `http://localhost:3000/`.

2. **Emotion Detection:**

   Use the camera to detect emotions based on facial expressions.

3. **Music Suggestions:**

   Based on the detected emotion, the app will display music recommendations from Spotify.

