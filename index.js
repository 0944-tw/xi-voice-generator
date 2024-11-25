(async () => {
  var pinyin = require("chinese-to-pinyin");
  var express = require("express");
  var app = express();
  var wav = require("wav-concat");

  var fs = require("fs");

  const voices = fs.readdirSync("./voicebank");
  if (!(await fs.existsSync("./temp")) ){
    await fs.mkdirSync("./temp");
  }
  app.get("/generate", async (req, res) => {
    // set csrf header
    res.header("Access-Control-Allow-Origin", "*");

    // get "name" parameter from request
    var name = req.query.name;
    var removeTone = req.query.removeTone;
    var options = {
      removeTone: false,
      toneToNumber: true,
      noToneWhenNoFiles: true,
    };
    if (!name) {
      return res.send("缺失要產生的語詞");
    }
    if (removeTone) {
      console.log("Tone Remove");
      options.removeTone = true;
      options.toneToNumber = false;
    }
    if (req.query.noToneWhenNoFiles) {
      console.log("No Tone When No Files");
      options.noToneWhenNoFiles = true;
    }
    // generate pinyin
    var pinyinName = pinyin(name, options);
    console.log(pinyinName);
    var splited = pinyinName.split(" ");
    var voicefiles = [];

    var missingFiles = [];
    // check file exists
    for (let i = 0; i < splited.length; i++) {
      var file = splited[i] + ".wav";
      if (voices.includes(file)) {
        voicefiles.push("./voicebank/" + file);
      } else {
        // remove number
        var noNumber = splited[i].replace(/\d/g, "");
        file = noNumber + ".wav";
        if (voices.includes(file)) {
          voicefiles.push("./voicebank/" + file);
        } else {
          missingFiles.push(splited[i]);
        }
      }
    }
    // Combine voice files
    if (!voicefiles.length) {
      return res.send("Error: No voice files found");
    }
    var date = new Date();
    var time = date.getTime();

    var fileName = `${time}.mp3`;
    let wavs = await wav(voicefiles).concat("./temp/" + fileName);
    wavs.on("error", (err) => {
      return res.send("Error: " + err);
    });
    wavs.on("end", (output) => {
      // send json with buffer

      res.json({
        filePath: `./vocals/${fileName}`,
        missingFiles: missingFiles,
      });
    });
    setTimeout(() => {
      // Delete File
      fs.unlink("./temp/" + fileName, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }, 15 * 1000);
  });
  app.use("/vocals", express.static("temp"));
  app.use("/", express.static("public"));
  app.listen(3000);
})();
