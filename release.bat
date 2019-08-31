@ECHO OFF
ECHO Please wait we are working on release process...
set /p release_version="Enter Release Version: "
set app_name = "SuperTatkal-ChromeExtention"
set temp_release="%~dp0releases\temp\"%release_version%\
mkdir %temp_release%
xcopy "%~dp0README.md" %temp_release%"README.md"
xcopy "%~dp0LICENSE" %temp_release%"LICENSE"
xcopy "%~dp0src\manifest.json" %temp_release%"manifest.json"
xcopy /E /Y "%~dp0src\css" %temp_release%"css"
xcopy /E /Y "%~dp0src\html" %temp_release%"html"
xcopy /E /Y "%~dp0src\images" %temp_release%"images"
pause