FROM node:16.14.0
WORKDIR /server
COPY package.json /server
RUN npm install
COPY . /server
EXPOSE 4000
CMD ["npm","start"]