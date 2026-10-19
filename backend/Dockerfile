FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json knexfile.js ./
COPY src ./src
RUN npm run build

EXPOSE 3000
CMD ["sh", "-c", "npm run migrate && npm run start:prod"]
