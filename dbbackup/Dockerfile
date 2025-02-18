FROM docker:latest

WORKDIR /app

ENV TZ=Asia/Bangkok
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

ADD cron.txt .

RUN mkdir /db_backup

RUN crontab -u root cron.txt && \
    rm cron.txt

CMD [ "crond", "-f" ]