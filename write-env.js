const fs = require('fs');

const envContent = `MONGODB_URI=mongodb+srv://root:M4IKxuQAup4N9ZnQ@iron.l2nlwuj.mongodb.net/raptor-fitt?retryWrites=true&w=majority&appName=iron
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=raptor-fitt-secret-key-change-in-production
GEMINI_API_KEY=AIzaSyAzs_bal6ygXqEQq-DF-5HJoLW5zD8vIgM`;

fs.writeFileSync('.env.local', envContent, { encoding: 'utf8' });
console.log('✅ .env.local updated with new credentials!');
