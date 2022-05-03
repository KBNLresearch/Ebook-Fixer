export function sendFile(file) {
    return fetch('http://localhost:8000/api/ebooks/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: file,
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.status + ", message: " + response.statusText)
    })
    .then(function (response) {
        console.log("Response: " + response);
        return response;
    })
    .catch(error => {
        console.log(error);
        throw error;
    })
}