const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const admin = require('firebase-admin');

const PORT = 3004;

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDmdf8NhoFAzXKGuBWYq5XoDrM5eNClgOg",
    authDomain: "bradensbay-1720893101514.firebaseapp.com",
    databaseURL: "https://bradensbay-1720893101514-default-rtdb.firebaseio.com/",
    projectId: "bradensbay-1720893101514",
    storageBucket: "bradensbay-1720893101514.appspot.com",
    messagingSenderId: "280971564912",
    appId: "1:280971564912:web:989fff5191d0512c1b21b5",
    measurementId: "G-DNJS8CVKWD"
};

// Initialize Firebase App
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: firebaseConfig.databaseURL
});

const app = express();
app.use(cors());
app.use(express.json());

// Function to fetch port and password from the database
const getPortPwd = async (uid, idToken) => {
    // Verify the Firebase Auth token
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.uid !== uid) {
            throw new Error('UID mismatch. Token does not belong to the provided UID.');
        }
    } catch (error) {
        console.error('Authentication failed:', error.message);
        throw new Error('Authentication failed.');
    }

    // Fetch data from the database
    const userRef = ref(database, `users/${uid}`);
    try {
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const { port, password } = snapshot.val();
            return { message: "", port: port, pwd: password };
        } else {
            return {
                message: "Since this is your first login, your VM is being initialized, which could take up to 2 minutes. Stay on this window and don't refresh. If your VM details don't show within 3 minutes, contact support at 705-795-6508.",
                port: "",
                pwd: ""
            };
        }
    } catch (error) {
        console.error('Error retrieving user credentials:', error.message);
        throw new Error('Failed to fetch user data.');
    }
};

// Public API Endpoint
app.post('/execute', async (req, res) => {
    const { uid, idToken } = req.body;

    // Validate request body
    if (!uid || !idToken) {
        return res.status(400).json({ error: 'UID and ID token are required.' });
    }

    try {
        const result = await getPortPwd(uid, idToken);
        return res.status(200).json(result);
    } catch (error) {
        console.error(`Error processing request for UID ${uid}: ${error.message}`);
        return res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
