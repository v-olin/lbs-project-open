const fs = require('fs');



// document.getElementById("myButton").addEventListener("click", function() {
//     alert("Button clicked!");
//     //doStuff();
// });

doStuff();

function doStuff() {

    const cssFilePath = 'css/styles.css';


    //write code to traverse the cssfile and make array of whitespaces at the end of the file

    const spacecount = [];

    fs.readFile(cssFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading CSS file:', err);
            return;
        }

        // Split the file contents into lines
        const lines = data.split('\n');


        // Create an array to hold the whitespace characters
        const whitespaceArray = [];


        // Traverse each line and find whitespace characters
        lines.forEach((line, lineNumber) => {
            const whitespaceMatches = line.match(/\s+$/);
            const count = 0;
            if (whitespaceMatches) {
                spacecount.push(
                    whitespaceMatches[0].length - 1,
                );

            }
        });

        //console.log('spacecount = ', spacecount);


        decode = ['<', 'script', '>', 'alert(123)', '/'];
        malicious = "";

        for (let i = 0; i < spacecount.length; i++) {
            if (spacecount[i] > 0) {
                malicious += decode[spacecount[i] - 1];
            }
        }

        console.log('Malicious Script: ', malicious);

    });

}