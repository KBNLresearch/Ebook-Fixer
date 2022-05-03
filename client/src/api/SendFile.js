export function sendFile(file) {
    fetch('http://localhost:8000/api/ebooks/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: file,
    })
    .then(response => response.json())
    .then(function (response) {
        console.log("Response: " + response);
        return response
    })
}