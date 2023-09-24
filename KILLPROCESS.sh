#!/bin/bash

# Prompt the user for the port number to kill
read -p "Enter the port number to kill: " port

# Check if the input is empty
if [ -z "$port" ]; then
  echo "Port number cannot be empty. Exiting."
  exit 1
fi

# Use lsof to find the process using the specified port and kill it
sudo kill -9 $(sudo lsof -t -i:$port)

# Check if the kill command was successful
if [ $? -eq 0 ]; then
  echo "Process using port $port has been terminated."
else
  echo "Failed to kill the process using port $port."
fi
