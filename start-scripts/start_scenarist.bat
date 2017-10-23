@echo off
start "" "node.exe" ".\http-server\\bin\\http-server" "..\\..\\dist" "-p 8080" "--cors"