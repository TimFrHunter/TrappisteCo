const fs = require('fs')
const path = require('path')
const FabricCAServices = require('fabric-ca-client')
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');

const pathFile = path.resolve('../crypto-config/peerOrganizations/orga1.trappiste-hunter.com/tlsca/tlsca.orga1.trappiste-hunter.com-cert.pem')
const certificatOrga1DePeers = fs.readFileSync(pathFile, 'utf8')




    enrollAdmin = async () => {
        try{


            //FileSytem 
            const walletPath = path.join(process.cwd(), 'wallet')
            const wallet = new FileSystemWallet(walletPath)

            //CaClient to communicate with the CA
            const url = "https://localhost:7054" // check ca0 docker-compose-cli.yaml
            const caName = "ca0_orga1" // check ca0 docker-compose-cli.yaml
            const caClient = new FabricCAServices(url, { trustedRoots: certificatOrga1DePeers, verify: false }, caName)
            
           
            const adminExists = await wallet.exists('admin')
            if (adminExists) {
                console.log('An identity for the admin user "admin" already exists in the wallet');
                return;
            }

            const enrollment = await caClient.enroll({ enrollmentID: 'admin',
             enrollmentSecret: 'adminpw' // par defaut dans le serveur CA
            })
            const x509identity = X509WalletMixin.createIdentity('Orga1MSP', enrollment.certificate, enrollment.key.toBytes())
            await wallet.import('admin', x509identity)
            console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
            
        }catch (error) {
            console.error(`Failed to enroll admin user "admin": ${error}`);
            process.exit(1);
        }
    }

    



enrollAdmin()
