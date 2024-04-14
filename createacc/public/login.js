function submitLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!/^[a-zA-Z0-9]+$/.test(username) || !(password.length >= 4 && /[a-zA-Z]/.test(password) && /\d/.test(password))) {
        document.getElementById('loginMessage').innerText = 'Invalid username or password format.';
        return;
    }

    fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loginMessage').innerText = data.message;
        if (data.success) {
            window.location.href = '/petForm.html'; // Redirect to pet form page on successful login
        }
    })
    .catch(error => console.error('Error:', error));
}
