
FROM nginx:alpine


RUN rm /etc/nginx/conf.d/*
    apt update -y \
    && apt install nginx curl vim -y \
    && apt-get install software-properties-common -y \
    && add-apt-repository ppa:certbot/certbot -y \
    && apt-get update -y \
    && apt-get install python-certbot-nginx -y \
    && apt-get clean



COPY ./default.conf /etc/nginx/conf.d/


EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
