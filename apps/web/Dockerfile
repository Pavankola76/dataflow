FROM node:18-alpine

WORKDIR /app

# Support for node-gyp and python builds if necessary down the line
RUN apk add --no-cache python3 make g++

# Install pnpm workspace manager
RUN npm install -g pnpm

# Copy the entire monorepo workspace to resolve hoisted dependencies
COPY . .

# Install dependencies across all packages cleanly
RUN pnpm install --frozen-lockfile=false

WORKDIR /app/apps/web

# Build the Next.js Production bundle
RUN pnpm build

EXPOSE 3000

# Start the production Next.js runner
CMD ["pnpm", "start"]
