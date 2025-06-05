FROM nodered/node-red:latest

# Set working directory
WORKDIR /usr/src/node-red

# Install node-red-contrib-modbus
RUN npm install node-red-contrib-modbus

RUN npm i node-red-contrib-aedes

# Expose the default Node-RED port
EXPOSE 1880

# Start Node-RED
CMD ["npm", "start", "--", "--userDir", "/data"]