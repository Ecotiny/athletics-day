FROM node:12.18.1

ENV NODE_ENV production

ENV PORT 3000
EXPOSE $PORT

RUN npm i npm@6.14.5 -g

RUN mkdir /opt/node_app && chown node:node /opt/node_app
WORKDIR /opt/node_app

COPY package.json package-lock.json ./
RUN chown node:node /opt/node_app/*
USER node
RUN npm install && npm cache clean --force
COPY . .
ENV PATH /opt/node_app/node_modules/.bin:$PATH

WORKDIR /opt/node_app/app
COPY . .

CMD ["node", "/opt/node_app/app/index.js"]
