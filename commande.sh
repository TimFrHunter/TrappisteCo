#!/bin/bash
# # generate certificates using cryptogen tool (crypto materials)
# cryptogen generate --config=./crypto-config.yaml
#
# # generate genesis block for orderer : genesis.block
# # utilise le fichier configtx.yaml
# configtxgen -profile OrganismeOrdererGenesis -outputBlock ./channel-artifacts/genesis.block
#     # profile se trouve dans configtx.yaml
#     # outputBlock
#
# # generating channel configuration transaction file : 'channel.tx'
# configtxgen -profile OrgsChannel -channelID $CHANNEL_NAME -outputCreateChannelTx ./channel-artifacts/channel.tx
#     # profile se trouve dans configtx.yaml
#     # channelID dans File .env
#     # outputCreateChannelTx
# # generate anchor peer transaction to communicate between Organisation,s thanks one peer on each organisation
# configtxgen blablabla...

##Generate Certificats Stuff
rm channel-artifacts -rf 
rm crypto-config -r
./bin/cryptogen generate --config=./crypto-config.yaml
##Generate Channels Stuff
mkdir channel-artifacts
./bin/configtxgen -profile ChannelSystemOrderer00 -channelID channel-sys -outputBlock ./channel-artifacts/genesis.block
./bin/configtxgen -profile Channel01 -outputCreateChannelTx ./channel-artifacts/channelOne.tx -channelID channel-one

exit 1

##Up Network
docker-compose -f docker-compose-cli.yaml up

##Connect To cli node 
docker exec -it cli bash

#### IN THE NETWORK WITH CLI container#####
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/orga1.trappiste-hunter.com/users/Admin@orga1.trappiste-hunter.com/msp
export CORE_PEER_ADDRESS=peer0.orga1.trappiste-hunter.com:7051
export CORE_PEER_LOCALMSPID="Orga1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/orga1.trappiste-hunter.com/peers/peer0.orga1.trappiste-hunter.com/tls/ca.crt
#CREER le channel-one grace au fichier channelOne.txt
peer channel create -o orderer.trappiste-hunter.com:7050 -c channel-one -f ./channel-artifacts/channelOne.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste-hunter.com/orderers/orderer.trappiste-hunter.com/msp/tlscacerts/tlsca.trappiste-hunter.com-cert.pem

# On ajoute le peer0.orga1
# peer0.orga1 joined channel 'channel-one'
peer channel join -b channel-one.block



########################
########################


peer chaincode install -n chainecode-trappiste -v 1.0 -l golang -p github.com/chaincode/
peer chaincode instantiate -o orderer.trappiste-hunter.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste-hunter.com/orderers/orderer.trappiste-hunter.com/msp/tlscacerts/tlsca.trappiste-hunter.com-cert.pem -C channel-one -n chainecode-trappiste -l golang -v 1.0 -c '{"Args":["init"]}' -P 'AND ('\''Orga1MSP.peer'\'')'

peer chaincode invoke -o orderer.trappiste-hunter.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste-hunter.com/orderers/orderer.trappiste-hunter.com/msp/tlscacerts/tlsca.trappiste-hunter.com-cert.pem  -C channel-one -n chainecode-trappiste -c '{"Args":["incrementerVente" ,"Vente0" , "Reduction1", "1651351654565" ,"{\"biere1\" : 6, \"biere2\" : 12}" ,"11.95"]}'

peer chaincode query -C channel-one -n chainecode-trappiste -c '{"Args":["listerVente","Vente0", "Vente5"]}'



peer chaincode invoke -o orderer.trappiste-hunter.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste-hunter.com/orderers/orderer.trappiste-hunter.com/msp/tlscacerts/tlsca.trappiste-hunter.com-cert.pem  -C channel-one -n chainecode-trappiste -c '{"Args":["incrementerStock" ,"Biere0" , "Orval", "300", "322243423", "0.15", "1.9"]}'

peer chaincode query -C channel-one -n chainecode-trappiste -c '{"Args":["afficherBiereUnique","biere0"]}'

peer chaincode query -C channel-one -n chainecode-trappiste -c '{"Args":["listerBieres","biere0", "biere5"]}'



########################
########################

docker image rm $(docker images | grep dev | tr -s ' ' | cut -d ' ' -f 3) -f




#"Installing chaincode on peer0.orga1..."
peer chaincode install -n chaine-code -v 1.0 -l golang -p github.com/chaincode/

#instantiate chaincode only in peer0.Org2
peer chaincode instantiate -o orderer.trappiste-hunter.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste-hunter.com/orderers/orderer.trappiste-hunter.com/msp/tlscacerts/tlsca.trappiste-hunter.com-cert.pem -C channel-one -n chaine-code -l golang -v 1.0 -c '{"Args":["init","a","100","b","200"]}' -P 'AND ('\''Orga1MSP.peer'\'')'

peer chaincode invoke -o orderer.trappiste-hunter.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste-hunter.com/orderers/orderer.trappiste-hunter.com/msp/tlscacerts/tlsca.trappiste-hunter.com-cert.pem -C channel-one -n chaine-code -c '{"Args":["invoke","a","b","20"]}'

# peer chaincode invoke -o orderer.trappiste-hunter.com:7050 --tls true 
# --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/trappiste-hunter.com/orderers/
# orderer.trappiste-hunter.com/msp/tlscacerts/tlsca.trappiste-hunter.com-cert.pem 
# -C mychannel -n mycc --peerAddresses peer0.org1.trappiste-hunter.com:7051 
# --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.trappiste-hunter.com/peers
# /peer0.org1.trappiste-hunter.com/tls/ca.crt 
# --peerAddresses peer0.org2.trappiste-hunter.com:9051 
# --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.trappiste-hunter.com/peers/
# peer0.org2.trappiste-hunter.com/tls/ca.crt 
# -c '{"Args":["invoke","a","b","10"]}'


peer chaincode query -C channel-one -n chaine-code -c '{"Args":["query","a"]}'






