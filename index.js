var pinyin = require("chinese-to-pinyin")
var express = require("express")
var app = express()
var wav = require("wav-concat")

app.get("/generate",async (req,res) => {
    // get "name" parameter from request
    var name = req.query.name
    var removeTone = req.query.removeTone
    var options = {
        removeTone: false,
        toneToNumber: true,
        noToneWhenNoFiles: false,
    }
    if (!name){
        return res.send("缺失要產生的語詞")
    }
    if (removeTone) {
        console.log("Tone Remove")
        options.removeTone = true
        options.toneToNumber = false
    }
    if (req.query.noToneWhenNoFiles) {
        console.log("No Tone When No Files")
        options.noToneWhenNoFiles = true
    }
    // generate pinyin
    var pinyinName = pinyin(name,options)
    console.log(pinyinName)
    var splited = pinyinName.split(" ")
    var voicefiles = [

    ]

   
    var missingFiles = []
    // check file exists
    for (let i = 0; i < splited.length;i++){
        var file = splited[i] + ".wav"
        
        var fs = require("fs")
        if (fs.existsSync("./voicebank/" + file)){
            voicefiles.push("./voicebank/" + file)
        } else {
            missingFiles.push(splited[i])
          if (!options.noToneWhenNoFiles) {
            let replacedTextName = "./voicebank/" + splited[i].replace(/[1-5]/g,"") + ".wav"
            if (fs.existsSync("./voicebank/" + splited[i].replace(/[1-5]/g,"") + ".wav")){
                console.log("Replace " + file + " with " + replacedTextName)
                voicefiles.push(replacedTextName)
                
            }
            continue;
          }
          console.log(file + " not exists")

        }
    } 
    // Combine voice files
    if (!voicefiles.length){
     return res.send("Error: No voice files found")
    }
    var date = new Date()
    var time = date.getTime()

    var fileName = `${time}.mp3`
    let wavs = await wav(voicefiles).concat("./temp/" + fileName)
    wavs.on("error",(err) => {
        return res.send("Error: " + err)
    })
    wavs.on("end",(output) => {
        // send json with buffer
        
        res.json({
            filePath: `./vocals/${fileName}`,
            missingFiles: missingFiles
        })
    })


})
app.use("/vocals",express.static("temp"))
app.use("/",express.static("public"))
app.listen(3000)