export function  getFile(fileId) {
    return fetch('http://localhost:8000/api/ebooks/download/'+ fileId, {
        method: 'GET'
    })
    .then(response => {
        if (response.ok) {
            response.blob().then(blob => {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = fileId+'.epub';
                a.click();
            });
        }
        throw new Error(response.status + ", message: " + response.statusText)
        
    })
    .then(function (response) {
        console.log("Response: ");
        console.log(response);
        return response;
    })
    .catch(error => {
        console.log(error);
        throw error;
    })
    
}