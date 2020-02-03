const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const connexionOrga1InfoFile = __dirname + '/../connection-fournisseur-chimay.json';

registerFournisseurChimay = async () => {
    try{


        //FileSytem 
        const walletPath = __dirname + '/../wallet'
        const wallet = new FileSystemWallet(walletPath)

        // Check to see if we've already enrolled the user.
        if (await wallet.exists('fournisseur')) {
            console.log('An identity for the user "fournisseur" already exists in the wallet');
            return;
        }
        // Check to see if we've already enrolled the admin user.
        if (!await wallet.exists('adminChimay')) {
            console.log("Create Admin Wallet before");
            return;
        }
        
        // Create a new gateway for connecting to our peer node.
        const stargate = new Gateway()
        await stargate.connect(connexionOrga1InfoFile, {wallet, identity : 'adminChimay', discovery: { enabled: true, asLocalhost: true} })

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = stargate.getClient().getCertificateAuthority()
        const adminIdentity = stargate.getCurrentIdentity();
        
        const secret = await ca.register({ 
            affiliation: 'fournisseur.chimay' // par defaut dans le serveur CA //c'est le EnableOUs  Organization Unit créé des sous groupes qui sont rattachés un utilisteur avec son role
        , enrollmentID: 'fournisseur', role: 'client'}, adminIdentity)
        const enrollment = await ca.enroll({ enrollmentID: 'fournisseur', enrollmentSecret: secret})
        const userIdentity = X509WalletMixin.createIdentity('ChimayMSP', enrollment.certificate, enrollment.key.toBytes())
        await wallet.import('fournisseur', userIdentity)
        console.log('Successfully registered and enrolled by admin,  user : "fournisseur" and imported it into the wallet');

    }
    catch (error) {
        console.error(`Failed to register user "fournisseur": ${error}`);
        process.exit(1);
    }
    
}

registerFournisseurChimay()

