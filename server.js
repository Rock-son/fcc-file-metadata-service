var express = require("express"),
    path = require("path"),
    fs = require("fs"),
    morgan = require('morgan'),
    upload = require("multer")({dest: "uploads/", limits: 150000}),
    file = upload.single('fileUpload'), // name must be the same as "name" in the form field! - for security resons
    port = process.env.PORT || 3000,

app = express();
    
app.use(express.static(path.join(__dirname, "public")));

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}))


app.post("/file-upload", file, function(req, res) {
    if (req.file) {
        var tmp_path = req.file.path,
            target_path = "uploads/" + req.file.originalname,
            readStream = fs.createReadStream(tmp_path),
            dest = fs.createWriteStream(target_path);
        
        readStream.pipe(dest);
        readStream.on("error", function(err) {res.send({"error": err})});
        readStream.on("end", function() {
            var stats = fs.statSync(path.join(__dirname, target_path));
            fs.unlinkSync(tmp_path);
            fs.unlinkSync(target_path);

            res.set({status: 200, "content-type":"application/json"});
            res.send({"size": stats.size })
           
        });
    } else {
        res.send("Error uploading file! Please try again.");
    }    
});

app.listen(port);