@ECHO OFF
ECHO Please wait we are working on release process...
set /p release_version="Enter Release Version: "
set app_name = "SuperTatkal-ChromeExtention"
set temp_release="%~dp0releases\temp\"%release_version%\
mkdir %temp_release%

xcopy /E /Y "%~dp0src" %temp_release%
copy "%~dp0README.md" %temp_release%"README.md"
copy "%~dp0LICENSE" %temp_release%"LICENSE"

rmdir /Q /S %temp_release%"scss"
rmdir /Q /S %temp_release%"libs\fontawesome-free-5.1.1-web\less"
rmdir /Q /S %temp_release%"libs\fontawesome-free-5.1.1-web\scss"
rmdir /Q /S %temp_release%"libs\fontawesome-free-5.1.1-web\svgs"
rmdir /Q /S %temp_release%"libs\fontawesome-free-5.1.1-web\metadata"
copy %temp_release%"libs\fontawesome-free-5.1.1-web\css\all.css" %temp_release%"libs\fontawesome-free-5.1.1-web\css\all.tmp"
del %temp_release%"libs\fontawesome-free-5.1.1-web\css\*.css"
copy %temp_release%"libs\fontawesome-free-5.1.1-web\css\all.tmp" %temp_release%"libs\fontawesome-free-5.1.1-web\css\all.css"
del %temp_release%"libs\fontawesome-free-5.1.1-web\css\*.tmp"

copy %temp_release%"libs\fontawesome-free-5.1.1-web\js\all.min.js" %temp_release%"libs\fontawesome-free-5.1.1-web\js\all.min.tmp"
del %temp_release%"libs\fontawesome-free-5.1.1-web\js\*.js"
copy %temp_release%"libs\fontawesome-free-5.1.1-web\js\all.min.tmp" %temp_release%"libs\fontawesome-free-5.1.1-web\js\all.min.js"
del %temp_release%"libs\fontawesome-free-5.1.1-web\js\*.tmp"

copy %temp_release%"libs\jquery-ui-1.12.1.custom\jquery-ui.min.css" %temp_release%"libs\jquery-ui-1.12.1.custom\jquery-ui.css.tmp"
copy %temp_release%"libs\jquery-ui-1.12.1.custom\jquery-ui.min.js" %temp_release%"libs\jquery-ui-1.12.1.custom\jquery-ui.js.tmp"
del %temp_release%"libs\jquery-ui-1.12.1.custom\*.js"
del %temp_release%"libs\jquery-ui-1.12.1.custom\*.css"
copy %temp_release%"libs\jquery-ui-1.12.1.custom\jquery-ui.js.tmp" %temp_release%"libs\jquery-ui-1.12.1.custom\jquery-ui.min.js"
copy %temp_release%"libs\jquery-ui-1.12.1.custom\jquery-ui.css.tmp" %temp_release%"libs\jquery-ui-1.12.1.custom\jquery-ui.min.css"
del %temp_release%"libs\jquery-ui-1.12.1.custom\*.tmp"
del %temp_release%"libs\jquery-ui-1.12.1.custom\*.html"
del %temp_release%"libs\jquery-ui-1.12.1.custom\*.txt"
del %temp_release%"libs\jquery-ui-1.12.1.custom\*.json"

rmdir /Q /S %temp_release%"images\logos"
rmdir /Q /S %temp_release%"images\ui"

7z a -tzip %~dp0releases\temp\TatkaalAutoFill_%release_version%.zip %temp_release%