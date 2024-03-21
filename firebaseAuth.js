// If user is not authenticated, redirect to login page
// If user is authenticated, retrieve and return the ID token

export function initFirebaseAndAuthUser() {
    const firebaseConfig = {
        apiKey: "AIzaSyANm47YWgqEwHI43Ho-P6PRzLd0SRaPQdY",
        authDomain: "auto-dnd-2ebcb.firebaseapp.com",
        projectId: "auto-dnd-2ebcb",
        storageBucket: "auto-dnd-2ebcb.appspot.com",
        messagingSenderId: "109641453328",
        appId: "1:109641453328:web:a517ce58e25dffbf3d9f95"
    };

    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);

    // Check for authentication state change
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                console.log("User is authenticated with ID:", user.uid);
                // Retrieve and return the ID token
                user.getIdToken().then(idToken => {
                    resolve({idToken, email: user.email});
                }).catch(error => {
                    console.log("Error retrieving user ID token:", error);
                    reject(error);
                });
            } else {
                console.log("No user is authenticated.");
                window.location.href = "/login.html";
                reject("No user is authenticated.");
            }
        });
    });
}
