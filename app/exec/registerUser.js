const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const connexionOrga1InfoFile = __dirname + '/../connection-magasin.json';

registerResponsable = async () => {
    try{


        //FileSytem 
        const walletPath = __dirname + '/../wallet'
        const wallet = new FileSystemWallet(walletPath)

        // Check to see if we've already enrolled the user.
        if (await wallet.exists('responsable')) {
            console.log('An identity for the user "responsable" already exists in the wallet');
            return;
        }
        // Check to see if we've already enrolled the admin user.
        if (!await wallet.exists('admin')) {
            console.log("Create Admin Wallet before");
            return;
        }
        
        // Create a new gateway for connecting to our peer node.
        const stargate = new Gateway()
        await stargate.connect(connexionOrga1InfoFile, {wallet, identity : 'admin', discovery: { enabled: true, asLocalhost: true} })

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = stargate.getClient().getCertificateAuthority()
        const adminIdentity = stargate.getCurrentIdentity();
        
        const secret = await ca.register({ 
            affiliation: 'magasin.responsable' // par defaut dans le serveur CA //c'est le EnableOUs  Organization Unit créé des sous groupes qui sont rattachés un utilisteur avec son role
        , enrollmentID: 'responsable', role: 'client'}, adminIdentity)
        const enrollment = await ca.enroll({ enrollmentID: 'responsable', enrollmentSecret: secret})
        const userIdentity = X509WalletMixin.createIdentity('MagasinMSP', enrollment.certificate, enrollment.key.toBytes())
        await wallet.import('responsable', userIdentity)
        console.log('Successfully registered and enrolled by admin,  user : "responsable" and imported it into the wallet');

    }
    catch (error) {
        console.error(`Failed to register user "responsable": ${error}`);
        process.exit(1);
    }
    
}

registerResponsable()

registerVendeur = async () => {
    try{


        //FileSytem 
        const walletPath = __dirname + '/../wallet'
        const wallet = new FileSystemWallet(walletPath)

        // Check to see if we've already enrolled the user.
        if (await wallet.exists('vendeur')) {
            console.log('An identity for the user "vendeur" already exists in the wallet');
            return;
        }
        // Check to see if we've already enrolled the admin user.
        if (!await wallet.exists('admin')) {
            console.log("Create Admin Wallet before");
            return;
        }
        
        // Create a new gateway for connecting to our peer node.
        const stargate = new Gateway()
        await stargate.connect(connexionOrga1InfoFile, {wallet, identity : 'admin', discovery: { enabled: true, asLocalhost: true} })

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = stargate.getClient().getCertificateAuthority()
        const adminIdentity = stargate.getCurrentIdentity();
        
        const secret = await ca.register({ 
            affiliation: 'magasin.vendeur' // par defaut dans le serveur CA //c'est le EnableOUs  Organization Unit créé des sous groupes qui sont rattachés un utilisteur avec son role
        , enrollmentID: 'vendeur', role: 'client'}, adminIdentity)
        const enrollment = await ca.enroll({ enrollmentID: 'vendeur', enrollmentSecret: secret})
        const userIdentity = X509WalletMixin.createIdentity('MagasinMSP', enrollment.certificate, enrollment.key.toBytes())
        await wallet.import('vendeur', userIdentity)
        console.log('Successfully registered and enrolled by admin,  user : "vendeur" and imported it into the wallet');

    }
    catch (error) {
        console.error(`Failed to register user "vendeur": ${error}`);
        process.exit(1);
    }
    
}

registerVendeur()

