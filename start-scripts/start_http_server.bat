@echo off
start "" "node.exe" ".\http-server\\bin\\http-server" "..\\..\\rest-server\static" "-p 3003" "--cors"
cd ..\..