#!/bin/bash

COUNTER=1
MAX_RETRY=10
DELAY=3
CHANNEL_NAME_1=channel-magasin
CHANNEL_NAME_2=channel-magasin-chimay
CAFILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste.fr/orderers/orderer0.trappiste.fr/msp/tlscacerts/tlsca.trappiste.fr-cert.pem
TX_NAME_1=./channel-artifacts/channel-magasin.tx
TX_NAME_2=./channel-artifacts/channel-magasin-chimay.tx
CC_1=chaincode-trappiste
CC_2=chaincode-trappiste-fournisseur


## Sometimes Join takes time hence RETRY at least 5 times
joinChannelWithRetry() {
    
    set -x
    peer channel join -b $1.block >&log.txt
    res=$?
    set +x
    cat log.txt
    if [ $res -ne 0 -a $COUNTER -lt $MAX_RETRY ]; then
        COUNTER=$(expr $COUNTER + 1)
        echo "peer failed to join the channel, Retry after $DELAY seconds"
        sleep $DELAY
        joinChannelWithRetry $1
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
    peer channel create -o $1 -c $2 -f $3 --tls true --cafile $CAFILE
    res=$?
    set +x
    if [ $res -ne 0 -a $COUNTER -lt $MAX_RETRY ]; then
        COUNTER=$(expr $COUNTER + 1)
        echo "failed to create the channel, Retry after $DELAY seconds"
        sleep $DELAY
        createChannelWithRetry $1 $2 $3
    else
        COUNTER=1
    fi

    if [ $res -ne 0 ]; then
        printf "After $MAX_RETRY attempts,  failed to create channel "
        exit 1
    fi
}



printf "\nCreation du channel $CHANNEL_NAME_1, Avec Retry \n"
createChannelWithRetry orderer0.trappiste.fr:7050 $CHANNEL_NAME_1 $TX_NAME_1

printf "\nCreation du channel $CHANNEL_NAME_2, Avec Retry \n"
createChannelWithRetry orderer0.trappiste.fr:7050 $CHANNEL_NAME_2 $TX_NAME_2

###################   Join channel-magasin ###################

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/users/Admin@magasin.trappiste.fr/msp
export CORE_PEER_ADDRESS=peer0.magasin.trappiste.fr:7051
export CORE_PEER_LOCALMSPID="MagasinMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/peers/peer0.magasin.trappiste.fr/tls/ca.crt

printf "\nAjout du peer0.magasin.trappiste.fr au channel channel-magasin, Avec retry\n"
joinChannelWithRetry $CHANNEL_NAME_1

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/users/Admin@magasin.trappiste.fr/msp
export CORE_PEER_ADDRESS=peer1.magasin.trappiste.fr:7061
export CORE_PEER_LOCALMSPID="MagasinMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/peers/peer1.magasin.trappiste.fr/tls/ca.crt

printf "\nAjout du peer1.magasin.trappiste.fr au channel channel-magasin, Avec retry\n"
joinChannelWithRetry $CHANNEL_NAME_1


###################   Join channel-magasin-chimay ###################

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/users/Admin@magasin.trappiste.fr/msp
export CORE_PEER_ADDRESS=peer0.magasin.trappiste.fr:7051
export CORE_PEER_LOCALMSPID="MagasinMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/peers/peer0.magasin.trappiste.fr/tls/ca.crt

printf "\nAjout du peer0.magasin.trappiste.fr au channel channel-magasin-chimay, Avec retry\n"
joinChannelWithRetry $CHANNEL_NAME_2

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/users/Admin@magasin.trappiste.fr/msp
export CORE_PEER_ADDRESS=peer1.magasin.trappiste.fr:7061
export CORE_PEER_LOCALMSPID="MagasinMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/peers/peer1.magasin.trappiste.fr/tls/ca.crt

printf "\nAjout du peer1.magasin.trappiste.fr au channel channel-magasin-chimay, Avec retry\n"
joinChannelWithRetry $CHANNEL_NAME_2



export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chimay.fournisseur.be/users/Admin@chimay.fournisseur.be/msp
export CORE_PEER_ADDRESS=peer0.chimay.fournisseur.be:1001
export CORE_PEER_LOCALMSPID="ChimayMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chimay.fournisseur.be/peers/peer0.chimay.fournisseur.be/tls/ca.crt

printf "\nAjout du peer0.chimay.fournisseur.be au channel channel-magasin-chimay, Avec retry\n"
joinChannelWithRetry $CHANNEL_NAME_2

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chimay.fournisseur.be/users/Admin@chimay.fournisseur.be/msp
export CORE_PEER_ADDRESS=peer1.chimay.fournisseur.be:1011
export CORE_PEER_LOCALMSPID="ChimayMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chimay.fournisseur.be/peers/peer1.chimay.fournisseur.be/tls/ca.crt

printf "\nAjout du peer1.chimay.fournisseur.be au channel channel-magasin-chimay, Avec retry\n"
joinChannelWithRetry $CHANNEL_NAME_2


############################ add Anchor Peers ####################
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/users/Admin@magasin.trappiste.fr/msp
export CORE_PEER_ADDRESS=peer0.magasin.trappiste.fr:7051
export CORE_PEER_LOCALMSPID="MagasinMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/peers/peer0.magasin.trappiste.fr/tls/ca.crt
printf "\nAjout anchor peer magasin: anchor-magasin.tx dans canal channel-magasin-chimay \n"
peer channel update -o orderer0.trappiste.fr:7050 -c $CHANNEL_NAME_2 -f ./channel-artifacts/anchor-magasin.tx --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste.fr/orderers/orderer0.trappiste.fr/msp/tlscacerts/tlsca.trappiste.fr-cert.pem 


export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chimay.fournisseur.be/users/Admin@chimay.fournisseur.be/msp
export CORE_PEER_ADDRESS=peer0.chimay.fournisseur.be:1001
export CORE_PEER_LOCALMSPID="ChimayMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chimay.fournisseur.be/peers/peer0.chimay.fournisseur.be/tls/ca.crt
printf "\nAjout anchor peer chimay; anchor-chimay.tx dans canal channel-magasin-chimay\n"
peer channel update -o orderer0.trappiste.fr:7050 -c $CHANNEL_NAME_2 -f ./channel-artifacts/anchor-chimay.tx --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste.fr/orderers/orderer0.trappiste.fr/msp/tlscacerts/tlsca.trappiste.fr-cert.pem 


###
# peer channel fetch config config_block.pb -o orderer0.trappiste.fr:7050 -c channel-magasin-chimay --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste.fr/orderers/orderer0.trappiste.fr/msp/tlscacerts/tlsca.trappiste.fr-cert.pem 

# configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config > config.json

# jq -s '.[0] * {"channel_group":{"groups":{"Application":{"groups": {"Chimay":.[1]}}}}}' config.json ./channel-artifacts/org3.json > modified_config.json


###



#############################   INSTALL  CC  #######################

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/users/Admin@magasin.trappiste.fr/msp
export CORE_PEER_ADDRESS=peer0.magasin.trappiste.fr:7051
export CORE_PEER_LOCALMSPID="MagasinMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/peers/peer0.magasin.trappiste.fr/tls/ca.crt
printf "\nInstall chaincode sur peer0.magasin.trappiste.fr:7051 \n"
peer chaincode install -n $CC_1 -v 1.0 -l golang -p github.com/chaincode/

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/users/Admin@magasin.trappiste.fr/msp
export CORE_PEER_ADDRESS=peer1.magasin.trappiste.fr:7061
export CORE_PEER_LOCALMSPID="MagasinMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/peers/peer1.magasin.trappiste.fr/tls/ca.crt
printf "\nInstall chaincode sur peer1.magasin.trappiste.fr:7061 \n"
peer chaincode install -n $CC_1 -v 1.0 -l golang -p github.com/chaincode/




export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/users/Admin@magasin.trappiste.fr/msp
export CORE_PEER_ADDRESS=peer0.magasin.trappiste.fr:7051
export CORE_PEER_LOCALMSPID="MagasinMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/peers/peer0.magasin.trappiste.fr/tls/ca.crt
printf "\nInstall chaincode magasin fournisseur sur peer0.magasin.trappiste.fr:7051 \n"
peer chaincode install -n $CC_2 -v 1.0 -l golang -p github.com/chaincode-fournisseur/

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/users/Admin@magasin.trappiste.fr/msp
export CORE_PEER_ADDRESS=peer1.magasin.trappiste.fr:7061
export CORE_PEER_LOCALMSPID="MagasinMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/peers/peer1.magasin.trappiste.fr/tls/ca.crt
printf "\nInstall chaincode magasin fournisseur sur peer1.magasin.trappiste.fr:7061 \n"
peer chaincode install -n $CC_2 -v 1.0 -l golang -p github.com/chaincode-fournisseur/



export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chimay.fournisseur.be/users/Admin@chimay.fournisseur.be/msp
export CORE_PEER_ADDRESS=peer0.chimay.fournisseur.be:1001
export CORE_PEER_LOCALMSPID="ChimayMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chimay.fournisseur.be/peers/peer0.chimay.fournisseur.be/tls/ca.crt

printf "\nInstall chaincode magasin fournisseur sur peer0.chimay.fournisseur.be:1001 \n"
peer chaincode install -n $CC_2 -v 1.0 -l golang -p github.com/chaincode-fournisseur/


export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chimay.fournisseur.be/users/Admin@chimay.fournisseur.be/msp
export CORE_PEER_ADDRESS=peer1.chimay.fournisseur.be:1011
export CORE_PEER_LOCALMSPID="ChimayMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chimay.fournisseur.be/peers/peer1.chimay.fournisseur.be/tls/ca.crt
printf "\nInstall chaincode magasin fournisseur sur peer1.chimay.fournisseur.be:1011 \n"
peer chaincode install -n $CC_2 -v 1.0 -l golang -p github.com/chaincode-fournisseur/

#####################   Instantiate CC ####################

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/users/Admin@magasin.trappiste.fr/msp
export CORE_PEER_ADDRESS=peer0.magasin.trappiste.fr:7051
export CORE_PEER_LOCALMSPID="MagasinMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magasin.trappiste.fr/peers/peer0.magasin.trappiste.fr/tls/ca.crt
printf "\nInstantie chaincode trappiste for Magasin Org\n"
peer chaincode instantiate -o orderer0.trappiste.fr:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste.fr/orderers/orderer0.trappiste.fr/msp/tlscacerts/tlsca.trappiste.fr-cert.pem -C $CHANNEL_NAME_1 -n $CC_1 -l golang -v 1.0 -c '{"Args":["init"]}' -P 'AND ("MagasinMSP.peer")'
sleep 5
printf "\nInstantie chaincode trappiste fournisseur for Magasin & Chimay Org\n"
peer chaincode instantiate -o orderer0.trappiste.fr:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste.fr/orderers/orderer0.trappiste.fr/msp/tlscacerts/tlsca.trappiste.fr-cert.pem -C $CHANNEL_NAME_2 -n $CC_2 -l golang -v 1.0 -c '{"Args":["init"]}' -P 'AND ("MagasinMSP.peer", "ChimayMSP.peer")'
sleep 5


#Pas besoin, le chaincode: chaincode-trappiste-fournisseur est deja instantié grace au magasin
# export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chimay.fournisseur.be/users/Admin@chimay.fournisseur.be/msp
# export CORE_PEER_ADDRESS=peer0.chimay.fournisseur.be:1001
# export CORE_PEER_LOCALMSPID="ChimayMSP"
# export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chimay.fournisseur.be/peers/peer0.chimay.fournisseur.be/tls/ca.crt
# # export CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chimay.fournisseur.be/peers/peer0.chimay.fournisseur.be/tls/server.key
# # export CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/chimay.fournisseur.be/peers/peer0.chimay.fournisseur.be/tls/server.crt
# printf "\nInstantie chaincode trappiste fournisseur for Chimay Org\n"
# peer chaincode instantiate -o orderer0.trappiste.fr:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste.fr/orderers/orderer0.trappiste.fr/msp/tlscacerts/tlsca.trappiste.fr-cert.pem -C $CHANNEL_NAME_2 -n $CC_2 -l golang -v 1.0 -c '{"Args":["init"]}' -P 'AND ("MagasinMSP.peer", "ChimayMSP.peer")'
# sleep 5


