const { FileSystemWallet, Gateway } = require('fabric-network')

getWallet = (walletPath) => { // Create a new file system based wallet for managing identities.
    return new FileSystemWallet(walletPath)
}

userExists = async (wallet, user) => { // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(user)
    if (!userExists) {
        console.log('An identity for the user "'+user+'" does not exist in the wallet')
        return false
    }
    return true
}

initGateway = async (wallet, user, ccpPath) => {// Create a new gateway for connecting to our peer node. // Point d'entrée init 
    const gateway = new Gateway()
    await gateway.connect(ccpPath, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } })
    return gateway

}

getNetwork = async (gateway, channelName) => { // Get the network (channel) our contract is deployed to.
    return await gateway.getNetwork(channelName)
}

getContrat = async (network, chaincodeName) => {
    return await network.getContract(chaincodeName)
}

init = async (walletPath, user, ccpPath, channelName, chaincodeName) => {
    
    const wallet = getWallet(walletPath)
       
    if(!userExists(wallet, user)) return  

    const gateway = await initGateway(wallet, user, ccpPath)
   
    const network = await getNetwork(gateway, channelName)
    
    
    const contract = await getContrat(network, chaincodeName)
    
    return contract
   
}

exports.init = init
