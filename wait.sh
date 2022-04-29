#!/bin/sh

#A script that waits for the dind docker daemon to start
while :
do
    if docker info > /dev/null 2>&1; then
        break
    fi
    echo 'waiting docker daemon...'
    sleep 1
done

exit 0
