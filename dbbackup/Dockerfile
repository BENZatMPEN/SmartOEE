FROM docker:latest

WORKDIR /code

ADD cron.txt .

RUN mkdir /db_backup

RUN crontab -u root cron.txt && \
    rm cron.txt

CMD [ "crond", "-f" ]