const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const PORT = 3004;

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

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

const app = express();
app.use(cors());
app.use(express.json());

const getPortPwd = async (uid) => {
    const userRef = ref(database, `users/${uid}`);
    console.log(uid);
    try {
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const { port, password } = snapshot.val();
            console.log({ message: "", port:port, pwd:password });
            return { message: "", port:port, pwd:pwd };
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

app.post('/execute', async (req, res) => {
    const { uid } = req.body;

    // Validate request body
    if (!uid) {
        return res.status(400).json({ error: 'UID is required.' });
    }

    try {
        const result = await getPortPwd(uid);
        return res.status(200).json(result);
    } catch (error) {
        console.error(`Error processing request for UID ${uid}: ${error.message}`);
        return res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
