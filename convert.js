const pdf = require('pdf-poppler');
const jsdom = require("jsdom");
const fs = require('fs');
const { config } = require('process');
const { JSDOM } = jsdom;

const htmlContent = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
</head>
<body></body>
</html>
`
const dom = new JSDOM(`${htmlContent}`);
const document = dom.window.document;
let pdf_name = "page";
let c =0; let i = 1; let v = 0; l =1;
let jsonPath = './config/';
let aaa = 2;
let data = new Date()
let month = (data.getMonth() + 1).toString().padStart(2, "0");
let day = data.getDate().toString().padStart(2, "0");
let cache_data = day+month;

// Recebe os args inputados no terminal (path do diretório / formato da imagem)
let _terminal_arg = process.argv;
_terminal_arg.forEach(function terminal_arg (input, index) {
    console.log(`${index}: ${input}`)

});

let pdfCount = _terminal_arg.slice();
pdfCount.splice(0, 2);

const perChunk = 2 // args recebidos por chunk    

const inputArray = pdfCount

const pdf_chunkConfig = inputArray.reduce((resultArray, item, index) => { 
  const chunkIndex = Math.floor(index/perChunk)

  if(!resultArray[chunkIndex]) {
    resultArray[chunkIndex] = [] 
  }

  resultArray[chunkIndex].push(item)
    
  return resultArray;
}, [])

fs.mkdir('./dist', { recursive: true }, (err) => {
    if (err) throw err;
});

while(v < pdf_chunkConfig.length) {


    //Envia info da remomeação para a edição do html

     function folderNum(folderNum, jsonData) {
            folderNum = `./dist/${jsonData.dir}`

            fs.mkdir(folderNum, { recursive: true }, (err) => {
                if (err) throw err;
            });
            l++;
            return(folderNum)
        }
    //Leitura da configuração do file json
    function readConfig(terminal_arg) {
        console.log(terminal_arg)
        fs.readdir(jsonPath, (err, data) => {
            if (err) throw err;
            Object.keys(data).forEach(key => {
                let configName = data[key].replace('.json','');
                if (configName == terminal_arg[0]) {
                    dataToConversion(terminal_arg, data[key], configName)
                };
            });
        });
    };

    function dataToConversion(terminal_arg, config, configName) {
        fs.readFile(`${jsonPath}${config}`, (err, data) => {
            if (err) throw err;
            jsonData = JSON.parse(data);
            console.log('jsonData');
            console.log(jsonData);

            terminal_arg[0].toLowerCase();
            convert(terminal_arg, jsonData, configName);
        });
    }


    // Converte o diretório do pdf as para o formato selecionado 
    function convert(terminal_arg, jsonData, configName) {
    

    // Declaraçôes do path e formato da imagem
        let opts = {
            format: jsonData.extension,
            out_dir: folderNum(folderNum, jsonData),
            out_prefix: "page",
            page: null,
            scale: jsonData.height
        };

        pdf.convert(terminal_arg[1], opts)
        .then(res => {
            console.log('Conversão concluida!');
            
            pdf.info(terminal_arg[1])
            .then(pdfinfo => {
                edit__html(pdfinfo.pages, jsonData, cache_data, opts.out_dir);
            });            

        })
        .catch(error => {
            console.error(error);
        })
        
    } 

    //Realiza alteraçôes no html
    function edit__html(pages, jsonData, cache_data, standard_folder) {
        document.querySelector("title").innerHTML = `${jsonData.title}`

        function testPromise(result, err) {

            return  new Promise ((resolve, reject) => {
        
                if (pages <= 9) { resolve({
                    name: "OLAAAA"
        
                    }) 
                }
                else if (pages >9 ) { reject({
                    name: "Falso"
                })}
            })
        }
        
        testPromise()
            .then((res) => {
                for (i = 0; i < 5; i++) {
                    document.querySelector("body").innerHTML += (`
                    <img src="./${pdf_name}-${page_count}.${jsonData.extension}?t=${cache_data}" alt="" style="width: 100%; max-width: none;"><br>`);
                    console.log(res.name)
                }
                create__html(standard_folder);                 
            }).catch ((err) => {
                console.log(err.name)
            })
        // if  (pages > 9) {
        //     for (c; c<pages; c++) {
        //         let page_count = i.toString().padStart(2, "0");
        // document.querySelector("body").innerHTML += (`
        // <img src="./${pdf_name}-${page_count}.${jsonData.extension}?t=${cache_data}" alt="" style="width: 100%; max-width: none;"><br>`);
        // i++;
        //     }   
        // }

        // else if (pages <= 9) {
        //     for (c; c<pages; c++) {
        // document.querySelector("body").innerHTML += (`
        // <img src="./${pdf_name}-${i}.${jsonData.extension}?t=${cache_data}" alt="" style="width: 100%; max-width: none;"><br>`);
        // i++;
        //     }        
        // }
    }


    //Realiza a escrita do html
    function create__html(standard_folder) {
        fs.writeFile(`${standard_folder}/index.html`, document.documentElement.innerHTML, function(error) {
            console.log(document.documentElement.innerHTML)
            if (error) throw error;
        });
    }

    readConfig(pdf_chunkConfig[v]);
    v++;
}