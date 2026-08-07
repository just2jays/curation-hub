FROM alpine:latest

ARG PB_VERSION=0.39.10

RUN apk add --no-cache \
    unzip \
    ca-certificates

# download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

RUN mkdir -p /pb/pb_migrations /pb/pb_hooks /pb/pb_data /pb/pb_public

COPY pocketbase-entrypoint.sh /usr/local/bin/pocketbase-entrypoint.sh
RUN chmod +x /usr/local/bin/pocketbase-entrypoint.sh

EXPOSE 8080

# start PocketBase
CMD ["/usr/local/bin/pocketbase-entrypoint.sh"]