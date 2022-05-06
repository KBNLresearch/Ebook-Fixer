/**
 * makes a get request to get the file with given id to download from the server
 * @param {*} fileId 
 * @returns  response
 */
export function  getFile(fileId) {
    return fetch('http://localhost:8000/ebooks/download/'+ fileId + "/", {
        method: 'GET'
    })
    .then(response => {
        if (response.ok) {
            console.log("okay")
            response.blob().then(blob => {
                console.log("blob")
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = fileId+'.epub';
                a.click();
                


            });


        }


    })
    .then(function (response) {
        console.log("Response: ");
        console.log(response);
        return response;
    })
    .catch(error => {
        window.alert("Error! Please try again.")
        console.log(error);
        throw error;
    })

}