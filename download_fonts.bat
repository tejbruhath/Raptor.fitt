@echo off
echo Downloading Raptor.fitt Fonts...

REM Create fonts directory if it doesn't exist
if not exist "public\fonts" mkdir "public\fonts"

echo Downloading Urbanist fonts from Google Fonts...

REM Urbanist Bold
curl -L "https://github.com/google/fonts/raw/main/ofl/urbanist/Urbanist-Bold.ttf" -o "public\fonts\Urbanist-Bold.ttf"

REM Urbanist SemiBold
curl -L "https://github.com/google/fonts/raw/main/ofl/urbanist/Urbanist-SemiBold.ttf" -o "public\fonts\Urbanist-SemiBold.ttf"

REM Space Mono (for numbers)
curl -L "https://github.com/google/fonts/raw/main/ofl/spacemono/SpaceMono-Bold.ttf" -o "public\fonts\SpaceMono-Bold.ttf"

echo.
echo ✅ Fonts downloaded successfully!
echo.
echo Fonts saved to: public\fonts\
echo - Urbanist-Bold.ttf
echo - Urbanist-SemiBold.ttf
echo - SpaceMono-Bold.ttf
echo.
pause
