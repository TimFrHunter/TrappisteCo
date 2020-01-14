#!/bin/bash

peer channel create -o orderer0.trappiste-hunter.com:7050 -c channel-magasin -f ./channel-artifacts/channelMagasin.tx --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste-hunter.com/orderers/orderer0.trappiste-hunter.com/msp/tlscacerts/tlsca.trappiste-hunter.com-cert.pem
peer channel join -b channel-magasin.block
peer chaincode install -n chainecode-trappiste -v 1.0 -l golang -p github.com/chaincode/

export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/orga1.trappiste-hunter.com/users/Admin@orga1.trappiste-hunter.com/msp
export CORE_PEER_ADDRESS=peer1.orga1.trappiste-hunter.com:7061
export CORE_PEER_LOCALMSPID="Orga1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/orga1.trappiste-hunter.com/peers/peer1.orga1.trappiste-hunter.com/tls/ca.crt
peer channel join -b channel-magasin.block
peer chaincode install -n chainecode-trappiste -v 1.0 -l golang -p github.com/chaincode/

peer chaincode instantiate -o orderer0.trappiste-hunter.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste-hunter.com/orderers/orderer0.trappiste-hunter.com/msp/tlscacerts/tlsca.trappiste-hunter.com-cert.pem -C channel-magasin -n chainecode-trappiste -l golang -v 1.0 -c '{"Args":["init"]}' -P 'AND ("Orga1MSP.peer")'

sleep 5