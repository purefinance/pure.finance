FROM node:14

WORKDIR /usr/src/site

COPY . .
RUN npm rebuild

CMD ["npm", "start"]

EXPOSE 3000
