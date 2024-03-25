FROM node:20

WORKDIR /usr/src/site

COPY . .
RUN npm rebuild

CMD ["npm", "run", "serve"]

EXPOSE 3000
