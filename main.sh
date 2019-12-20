#!/bin/bash

function up () {
    docker-compose -f docker-compose-cli.yaml up -d 2>&1
    docker exec cli bash -c " \
    peer channel create -o orderer.trappiste-hunter.com:7050 -c channel-one -f ./channel-artifacts/channelOne.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste-hunter.com/orderers/orderer.trappiste-hunter.com/msp/tlscacerts/tlsca.trappiste-hunter.com-cert.pem
    peer channel join -b channel-one.block
    peer chaincode install -n chainecode-trappiste -v 1.0 -l golang -p github.com/chaincode/
    peer chaincode instantiate -o orderer.trappiste-hunter.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste-hunter.com/orderers/orderer.trappiste-hunter.com/msp/tlscacerts/tlsca.trappiste-hunter.com-cert.pem -C channel-one -n chainecode-trappiste -l golang -v 1.0 -c '{\"Args\":[\"init\"]}' -P 'AND ('\''Orga1MSP.peer'\'')'
    "
    docker ps
    printf "\n\nYour environment is ready, attention the ledger has no data now.\n"
    printf "Now go try some nodeJs insert and query requests.\n"
    printf "Go to web/ and use action.js Script\n"
    printf "Go to test() function on bottom \n\n"
    
}
function down() {
    docker-compose -f docker-compose-cli.yaml down
    docker container prune -f 
    docker network prune -f
    docker volume prune -f
    docker image rm $(docker images | grep dev.peer | tr -s ' ' | cut -d ' ' -f 3) -f
}


MODE=$1
if [ "$MODE" == "up" ]; then
    up
elif [ "$MODE" == "down" ]; then
    down
fi  