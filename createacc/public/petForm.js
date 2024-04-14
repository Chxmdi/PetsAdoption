// Assuming you have a function like this
function submitPet() {
    const petType = document.getElementById('type').value;
    const petAge = document.getElementById('age').value;
    const petGender = document.getElementById('gender').value;
    const petBreed = document.getElementById('breed').value;

    fetch('/submit-pet', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ petType, petAge, petGender, petBreed })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('petMessage').innerText = data.message;
    })
    .catch(error => console.error('Error:', error));
}
