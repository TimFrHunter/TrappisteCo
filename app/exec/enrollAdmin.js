const fs = require('fs')
const FabricCAServices = require('fabric-ca-client')
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');

const pathFile = __dirname + '/../../crypto-config/peerOrganizations/magasin.trappiste.fr/tlsca/tlsca.magasin.trappiste.fr-cert.pem'
const certificatOrga1DePeers = fs.readFileSync(pathFile, 'utf8')

    enrollAdmin = async () => {
        try{


            //FileSytem 
            const walletPath = __dirname + '/../wallet'
            const wallet = new FileSystemWallet(walletPath)

            //CaClient to communicate with the CA
            const url = "https://localhost:7054" // check ca0 docker-compose-cli.yaml
            const caName = "ca.magasin.trappiste.fr" // check ca0 docker-compose-cli.yaml
            const caClient = new FabricCAServices(url, { trustedRoots: certificatOrga1DePeers, verify: false }, caName)
            
           
            const adminExists = await wallet.exists('admin')
            if (adminExists) {
                console.log('An identity for the admin user "admin" already exists in the wallet');
                return;
            }

            const enrollment = await caClient.enroll({ enrollmentID: 'admin',
             enrollmentSecret: 'adminpw' // par defaut dans le serveur CA
            })
            const x509identity = X509WalletMixin.createIdentity('MagasinMSP', enrollment.certificate, enrollment.key.toBytes())
            await wallet.import('admin', x509identity)
            console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
            
        }catch (error) {
            console.error(`Failed to enroll admin user "admin": ${error}`);
            process.exit(1);
        }
    }

    



enrollAdmin()
