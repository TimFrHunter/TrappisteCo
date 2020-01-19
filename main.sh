#!/bin/bash

function down() {
    export APP_PATH=$PWD/app
    kill $(ps -ef | grep 'node app/app.js' | grep -v 'grep'  | head -n 1 | tr -s ' '  | cut -d ' ' -f 2) # kill server
    docker-compose -f docker-compose-cli.yaml down
    docker container prune -f 
    docker network prune -f
    docker volume prune -f
    docker image rm $(docker images | grep dev.peer | tr -s ' ' | cut -d ' ' -f 3) -f
    rm $APP_PATH/wallet -rf
    rm $APP_PATH/db/* -rf
}

function up () {
    down

    docker-compose -f docker-compose-cli.yaml up -d 2>&1
    docker exec ca.orga1.trappiste-hunter.com bash -c " \
    fabric-ca-client enroll -u https://admin:adminpw@ca.orga1.trappiste-hunter.com:7054
    fabric-ca-client affiliation add magasin 
    fabric-ca-client affiliation add magasin.responsable 
    fabric-ca-client affiliation add magasin.vendeur
    "
    docker exec cli /tmp/scripts/doConfig.sh
    #docker exec cli bash -c "peer chaincode query -C channel-magasin -n chainecode-trappiste -c '{\"Args\":[\"test\"]}'"

    #return 1
    docker exec cli /tmp/scripts/incrementeLedger.sh
    
    node app/exec/enrollAdmin.js
    node app/exec/registerUser.js
 
    node app/exec/appUsers.js
    node app/exec/appStock.js
    node app/exec/appTdr.js
    
    docker exec cli bash -c " \
    printf '\n'
    peer chaincode query -C channel-magasin -n chainecode-trappiste -c '{\"Args\":[\"listerBieres\",\"Biere\",\"Biere~\"]}'
    printf '\n'
    peer chaincode query -C channel-magasin -n chainecode-trappiste -c '{\"Args\":[\"listerVente\",\"Vente\",\"Vente~\"]}'
    "

    docker ps
   
  
    node app/app.js > /dev/null 2>&1 &
    #nodemon app.js
    printf 'Server NodeJs à demarrer\n'
    printf "\nUtilisation:\n"
    printf "Normalement votre navigateur s'ouvre, si c'est pas le cas go : http://localhost:3000\n"
    printf "les identifiants de connexions: \n"
    printf "responsable : pwd\n"
    printf "vendeur : pwd\n\n"
    printf "Conseil:\n"
    printf "ouvrer deux navigateurs pour chaque utilisateur, ainsi vous pourrez aller chercher les codes barres que vous voulez utiliser directement avec le user responsable\n"
    printf "et avec le user vendeur ajouter les code barres à la caisse\n\n"
    
    sleep 2

    if which xdg-open > /dev/null 
        then
        xdg-open http://localhost:3000 > /dev/null 2>&1
    elif which gnome-open > /dev/null 
        then
        gnome-open http://localhost:3000 > /dev/null 2>&1

    
         
    # printf "\n\nYour environment is ready, attention the ledger has no data now.\n"
    # printf "Now go try some nodeJs insert and query requests.\n"
    # printf "Go to web/ and use action.js Script\n"
    # printf "Go to test() function on bottom \n\n"
    fi    
    
}



MODE=$1
if [ "$MODE" == "up" ]; then
    up
elif [ "$MODE" == "down" ]; then
    down
fi  