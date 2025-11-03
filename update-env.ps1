$content = @"
MONGODB_URI=mongodb+srv://padeco1113_db_user:Q5i0O0nH9AMObNh4@iron.l2nlwuj.mongodb.net/raptor-fitt?retryWrites=true&w=majority&appName=iron
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=raptor-fitt-secret-key-change-in-production
GEMINI_API_KEY=AIzaSyAzs_bal6ygXqEQq-DF-5HJoLW5zD8vIgM
"@

$content | Out-File -FilePath ".env.local" -Encoding UTF8 -NoNewline
Write-Host "✅ .env.local updated successfully!"
