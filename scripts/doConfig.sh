#!/bin/bash

COUNTER=1
MAX_RETRY=10
DELAY=3
CHANNEL_NAME=channel-magasin
CAFILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste-hunter.com/orderers/orderer0.trappiste-hunter.com/msp/tlscacerts/tlsca.trappiste-hunter.com-cert.pem
TX_NAME=./channel-artifacts/channelMagasin.tx


## Sometimes Join takes time hence RETRY at least 5 times
joinChannelWithRetry() {
    
    set -x
    peer channel join -b $CHANNEL_NAME.block >&log.txt
    res=$?
    set +x
    cat log.txt
    if [ $res -ne 0 -a $COUNTER -lt $MAX_RETRY ]; then
        COUNTER=$(expr $COUNTER + 1)
        echo "peer failed to join the channel, Retry after $DELAY seconds"
        sleep $DELAY
        joinChannelWithRetry 
    else
        COUNTER=1
    fi

    if [ $res -ne 0 ]; then
        printf "After $MAX_RETRY attempts, peer has failed to join channel "
        exit 1
    fi
}
createChannelWithRetry() {
    set -x
    peer channel create -o $1 -c $CHANNEL_NAME -f $TX_NAME --tls true --cafile $CAFILE
    res=$?
    set +x
    if [ $res -ne 0 -a $COUNTER -lt $MAX_RETRY ]; then
        COUNTER=$(expr $COUNTER + 1)
        echo "failed to create the channel, Retry after $DELAY seconds"
        sleep $DELAY
        createChannelWithRetry $1
    else
        COUNTER=1
    fi

    if [ $res -ne 0 ]; then
        printf "After $MAX_RETRY attempts,  failed to create channel "
        exit 1
    fi
}


printf "\nCreation du channel, Avec Retry \n"
createChannelWithRetry orderer0.trappiste-hunter.com:7050 
printf "\nAjout du peer0.orga1.trappiste-hunter.com au channel, Avec retry\n"
joinChannelWithRetry 
printf "\nInstall chaincode\n"
peer chaincode install -n chainecode-trappiste -v 1.0 -l golang -p github.com/chaincode/

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/orga1.trappiste-hunter.com/users/Admin@orga1.trappiste-hunter.com/msp
export CORE_PEER_ADDRESS=peer1.orga1.trappiste-hunter.com:7061
export CORE_PEER_LOCALMSPID="Orga1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/orga1.trappiste-hunter.com/peers/peer1.orga1.trappiste-hunter.com/tls/ca.crt
printf "\nAjout du peer1.orga1.trappiste-hunter.com au channel, Avec retry\n"
joinChannelWithRetry 
printf "\nInstall chaincode\n"
peer chaincode install -n chainecode-trappiste -v 1.0 -l golang -p github.com/chaincode/
printf "\nInstantie chaincode\n"
peer chaincode instantiate -o orderer0.trappiste-hunter.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste-hunter.com/orderers/orderer0.trappiste-hunter.com/msp/tlscacerts/tlsca.trappiste-hunter.com-cert.pem -C channel-magasin -n chainecode-trappiste -l golang -v 1.0 -c '{"Args":["init"]}' -P 'AND ("Orga1MSP.peer")'
sleep 5




