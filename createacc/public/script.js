function submitAccountCreation() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!isValidUsername(username)) {
        document.getElementById('message').innerText = 'Invalid username format. Username should only contain letters and digits.';
        return;
    }

    if (!isValidPassword(password)) {
        document.getElementById('message').innerText = 'Invalid password format. Password must be at least 4 characters long, include at least one letter and one digit.';
        return;
    }

    // Sending data to the server
    fetch('/create-account', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('message').innerText = data.message;
    })
    .catch(error => console.error('Error:', error));
}

function isValidUsername(username) {
    return /^[a-zA-Z0-9]+$/.test(username);
}

function isValidPassword(password) {
    return password.length >= 4 && /[a-zA-Z]/.test(password) && /\d/.test(password);
}
