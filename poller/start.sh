#!/bin/sh
while ! nc -z api 3000; do sleep 3; done
npm start