export function fetchExampleApiCall() {
    return fetch("http://localhost:8000/api/students/")
      //.then(res => res.text()) // for the raw data
      .then(res => res.json()) // if it's in json format
      .then(
          (result) => {
            console.log(result);
            return result
        },
        // Error handling vvv
          (error) => {
            console.log(error);
            throw error;
        }
      )
}