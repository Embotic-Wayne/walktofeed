# Project Title 
Walk2Feed

# Project Description
With increase in time on our phones scrolling through TikTok and playing video games, we wanted to get more physical activities out of these individuals.
We wanted to use emotional incentives to get the user to be more motivated so we gave users a personalized pets where you can only feed it using Yum Tokens
you gain from getting steps in. Your steps will be taken from your health app.

# Dependencies 
• Expo Go App
• iPhone running the latest iOS version
• A computer to run the code (Mac or Windows)
• Make sure your iPhone and computer is connect to the same Wi-Fi

# Packages to Install 
• npm install expo-sensors
• npm install @react-native-async-storage/async-storage
• npm install expo-router
• npm install react-native-safe-area-context
• npm install react-native-svg

Please Let us know if we are missing any packages!

# Executing Program 
1. Go to chat.tsx and steps.tsx and change the IP Address to your computer's IP.
2. If you would like to activate the Claude AI chatbox, go grab your API key from:
   https://console.anthropic.com/login?returnTo=%2F%3F
   Apply the API Key into .env in the step-server folder

For Windows:
Terminal 1
cd step-server
node server.js

Terminal 2
cd step-app
npx expo start --tunnel

For Mac:
Terminal 1
cd step-server
node server.js

Terminal 2
cd step-app
npx expo start

# Contributors
Name + Github
- Wayne Ngo, @Embotic-Wayne
- Son Nguyen, @songuyen05
- Ela Aquino, @elaaquino
