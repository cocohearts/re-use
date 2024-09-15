FROM ubuntu:latest

WORKDIR /app
EXPOSE 8000

RUN apt-get update
RUN apt-get install -y python3 python3-pip nodejs npm python3-venv
RUN python3 -m venv /app/venv

COPY ./backend/requirements.txt /app/backend/requirements.txt
COPY ./frontend/package.json /app/frontend/package.json
COPY ./frontend/package-lock.json /app/frontend/package-lock.json

RUN /app/venv/bin/pip install -r /app/backend/requirements.txt
RUN cd /app/frontend && npm install

COPY ./backend /app/backend
COPY ./frontend /app/frontend
COPY ./entrypoint.sh /app/entrypoint.sh

# build args
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_PROJECT_REF
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_PROJECT_REF=${VITE_PROJECT_REF}

RUN cd /app/frontend && npm run build

ENTRYPOINT ["/app/entrypoint.sh"]
