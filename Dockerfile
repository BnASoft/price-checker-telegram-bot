FROM node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
RUN npm install



ENV PHANTOMJS_ARCHIVE="phantomjs.tar.gz"
RUN echo '@edge http://nl.alpinelinux.org/alpine/edge/main'>> /etc/apk/repositories \
	&& apk --update add curl

RUN curl -Lk -o $PHANTOMJS_ARCHIVE https://github.com/fgrehm/docker-phantomjs2/releases/download/v2.0.0-20150722/dockerized-phantomjs.tar.gz \
	&& tar -xf $PHANTOMJS_ARCHIVE -C /tmp/ \
	&& cp -R /tmp/etc/fonts /etc/ \
	&& cp -R /tmp/lib/* /lib/ \
	&& cp -R /tmp/lib64 / \
	&& cp -R /tmp/usr/lib/* /usr/lib/ \
	&& cp -R /tmp/usr/lib/x86_64-linux-gnu /usr/ \
	&& cp -R /tmp/usr/share/* /usr/share/ \
	&& cp /tmp/usr/local/bin/phantomjs /usr/bin/ \
	&& rm -fr $PHANTOMJS_ARCHIVE  /tmp/*


ENV TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
COPY ./bot.js /usr/src/app/bot.js
COPY ./util/** /usr/src/app/util/
COPY ./config/** /usr/src/app/config/
COPY ./exchange/** /usr/src/app/exchange/
EXPOSE 5000
CMD ["npm", "run", "start"]