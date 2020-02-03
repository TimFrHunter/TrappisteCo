const fs = require('fs')
const FabricCAServices = require('fabric-ca-client')
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');

const pathFile = __dirname + '/../../crypto-config/peerOrganizations/chimay.fournisseur.be/tlsca/tlsca.chimay.fournisseur.be-cert.pem'
const certificatOrga1DePeers = fs.readFileSync(pathFile, 'utf8')

    enrollAdmin = async () => {
        try{


            //FileSytem 
            const walletPath = __dirname + '/../wallet'
            const wallet = new FileSystemWallet(walletPath)

            //CaClient to communicate with the CA
            const url = "https://localhost:1054" // check ca0 docker-compose-cli.yaml
            const caName = "ca.chimay.fournisseur.be" // check ca0 docker-compose-cli.yaml
            const caClient = new FabricCAServices(url, { trustedRoots: certificatOrga1DePeers, verify: false }, caName)
            
           
            const adminExists = await wallet.exists('adminChimay')
            if (adminExists) {
                console.log('An identity for the admin user "admin" already exists in the wallet');
                return;
            }

            const enrollment = await caClient.enroll({ enrollmentID: 'admin',
             enrollmentSecret: 'adminpw' // par defaut dans le serveur CA
            })
            const x509identity = X509WalletMixin.createIdentity('ChimayMSP', enrollment.certificate, enrollment.key.toBytes())
            await wallet.import('adminChimay', x509identity)
            console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
            
        }catch (error) {
            console.error(`Failed to enroll admin user "adminChimay": ${error}`);
            process.exit(1);
        }
    }

    



enrollAdmin()
