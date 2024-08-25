import { globalContainer } from '@/lib/common';
import { ConfigService } from '@/lib/config';
import chalk from 'chalk';
import firebase from 'firebase-admin';

const config = ConfigService.getInstance();

const params = {
    projectId: config.get('FIREBASE_PROJECT_ID'),
    privateKey: config.get('FIREBASE_PRIVATE_KEY'),
    clientEmail: config.get('FIREBASE_CLIENT_EMAIL')
}
firebase.initializeApp({
    credential: firebase.credential.cert(params),
})
console.log(chalk.green('[Firebase]: ', 'Firebase initialized'));
export default firebase;