const { exec } = require('child_process');

// Auto-deploy Firestore rules
exec('npx firebase deploy --only firestore:rules --token $FIREBASE_TOKEN', (error, stdout, stderr) => {
  if (error) {
    console.log('Installing Firebase CLI...');
    exec('npm install -g firebase-tools', (installError) => {
      if (!installError) {
        exec('npx firebase deploy --only firestore:rules', (deployError, deployStdout) => {
          console.log(deployError ? 'Deploy failed' : 'Rules deployed successfully');
        });
      }
    });
  } else {
    console.log('Rules deployed successfully');
  }
});