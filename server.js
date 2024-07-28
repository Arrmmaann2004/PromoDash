var express = require("express");
var fileUploader = require("express-fileupload");
var nodemailer = require("nodemailer");
var http = require("http");
let app = express();
var fs = require("fs");
var cloudinary = require("cloudinary").v2;
require('dotenv').config();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(fileUploader());

let config = {
    host: "bf1aav0ryn2ajmi0vuc4-mysql.services.clever-cloud.com",
    user: "uaqoec9wo0wrns8k",
    password: "cl7YRIwfgJxwcTZ2dgWp",
    database: "bf1aav0ryn2ajmi0vuc4",
    dateStrings: true,
    keepAliveInitialDelay: 10000,
    enableKeepAlive: true
}

let mysql2 = require("mysql2");
let mysql = mysql2.createConnection(config);

mysql.connect(function(err){
    if(err)
        console.log(err.message);
    else
        console.log("Database connected");
})

app.listen(3000,function(){
    console.log("Server is running on this port");
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.get("/",function(req,resp){
    let path = __dirname + "/public/index.html";
    resp.sendFile(path);
})

app.get("/index",function(req,resp){
    let path = __dirname + "/public/index.html";
    resp.sendFile(path);
})

app.get("/signup-process",function(req,resp){
    
    let status = 1;
    var intStatus = parseInt(status);
    mysql.query("insert into users values(?,?,?,?)",[req.query.txtEmail,req.query.txtPwd,req.query.utype,intStatus],function(err){
        if(err!=null)
            resp.send(err.message);
        else{
            let mail = req.query.txtEmail;
            resp.send("Data inserted");
            let reciever = {
                from: "armansingla02@gmail.com",
                to: mail,
                subject: "Successfully Registered",
                text: "Congratulations You have successfully registered on PromoDash...."
            }
            aunthentication.sendMail(reciever, function(err, info) {
                if (err) {
                    resp.send(err.message);
                }
                else
                    resp.send("Email sent");
            }); 
        }
    });
    return;
});

app.get("/email-check-process",function(req,resp){
    mysql.query("select * from users where email like ?",["%"+req.query.txtEmail+"%"],function(err,result){
        if(err!=null)
            resp.send(err.message);
        else if(result.length==0)
            resp.send("Available");
        else if(result.length!=0)
            resp.send("Not Available");
    })
})

app.get("/login-process",function(req,resp){   
    mysql.query("select * from users where email=? and pwd=?",[req.query.txtEmail,req.query.txtPwd],function(err,result){
        if(err!=null)
            resp.send(err.message);
        if(result.length==0){
            resp.send("Login Failed");
        }
        else if(result[0].status==0){
            resp.send("Blocked by the admin");
        }
        else{
            let utype = result[0].utype;
            resp.send(utype);
        }
    })
    return;
})

app.get("/clientdash",function(req,resp){
    let path = __dirname + "/public/client-dash.html";
    resp.sendFile(path);
})

app.get("/clientprofile",function(req,resp){
    let path = __dirname + "/public/client-profile.html";
    resp.sendFile(path);
})

app.get("/client-profile-search-process",function(req,resp){
    mysql.query("select * from cprofile where email = ?",[req.query.email],function(err,resultjsonAry){
        if(err==null){
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/save-client-profile",function(req,resp){
    mysql.query("insert into cprofile values(?,?,?,?,?,?)",[req.query.txtClientEmail,req.query.txtClientName,req.query.txtClientCity,req.query.txtClientState,req.query.txtClientType,req.query.txtClientContact],function(err){
        if(err==null)
            resp.send("Data inserted");
        else
            resp.send(err.message);
    })
})

app.get("/infldash",function(req,resp){
    let path = __dirname + "/public/infldash.html";
    resp.sendFile(path);
})

app.get("/profile",function(req,resp){
    let path = __dirname + "/public/infprofile.html";
    resp.sendFile(path);
})

app.post("/save-profile", async function(req, resp) {
    let mail = req.body.txtProfileEmail;
    let name = req.body.txtProfileName;
    let phone = req.body.txtProfilePhone;
    let address = req.body.txtProfileAddress;
    let city = req.body.txtProfileCity;
    let contact = req.body.txtProfileContact;
    let gender = req.body.comboProfileGender;
    let insta = req.body.txtProfileInsta;
    let fb = req.body.txtProfileFacebook;
    let youtube = req.body.txtProfileYoutube;
    let profilePic = req.files ? req.files.ppic : null;
    let ary = req.body.profileField;
    let others = req.body.txtProfileOther;
    let dob = req.body.ProfileDate;
    let str = "";
    
    if(Array.isArray(ary)){
        for(let i = 0; i < ary.length; i++){
            str += ary[i] + ",";
        }
        str = str.slice(0, -1);
    } else {
        str = ary;
    }
    
    let fileName = "";
    if(profilePic != null){
        try {
            let result = await cloudinary.uploader.upload(profilePic.tempFilePath);
            fileName = result.secure_url; // Use the URL of the uploaded image
        } catch (error) {
            return resp.send(error.message);
        }
    }
    
    mysql.query("insert into iprofile values(?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [mail, name, gender, dob, address, city, contact, str, insta, fb, youtube, others, fileName],
    function(err){
        if (err == null) {
            resp.redirect("updatedProfile.html");
        } else {
            resp.send("Already Exists");
        }
    });
    return;
});

app.post("/update-profile", async function(req, resp) {
    let mail = req.body.txtProfileEmail;
    let name = req.body.txtProfileName;
    let phone = req.body.txtProfilePhone;
    let address = req.body.txtProfileAddress;
    let city = req.body.txtProfileCity;
    let contact = req.body.txtProfileContact;
    let gender = req.body.comboProfileGender;
    let insta = req.body.txtProfileInsta;
    let fb = req.body.txtProfileFacebook;
    let youtube = req.body.txtProfileYoutube;
    let profilepic = req.files ? req.files.ppic : null;
    let ary = req.body.profileField;
    let others = req.body.txtProfileOther;
    let dob = req.body.ProfileDate;
    let str = "";

    if (Array.isArray(ary)) {
        for (let i = 0; i < ary.length; i++) {
            str += ary[i] + ",";
        }
        str = str.slice(0, -1);
    } else {
        str = ary;
    }

    let fileName = req.body.hdn;
    if(profilepic != null){
        try {
            let result = await cloudinary.uploader.upload(profilepic.tempFilePath);
            fileName = result.secure_url; // Use the URL of the uploaded image
        } catch (error) {
            return resp.send(error.message);
        }
    }
    
    mysql.query("update iprofile set iname=?, gender=?, dob=?, address=?, city=?, contact=?, fields=?, insta=?, fb=?, youtube=?, others=?, picpath=? where emailid=?", 
    [name, gender, dob, address, city, contact, str, insta, fb, youtube, others, fileName, mail], 
    function(err) {
        if (err == null) {
            resp.redirect("updatedProfile.html");
        } else {
            resp.send(err.message);
        }
    });

    return;
});

app.get("/search-process",function(req,resp){
    let email = req.query.txtProfileEmail;
    mysql.query("select * from iprofile where emailid = ?",[email],function(err,resultjsonAry){
        if(err==null){
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
});

app.get("/booking-process",function(req,resp){
    let email = req.query.txtEventEmail;
    let event = req.query.txtEventTitle;
    let date = req.query.EventDate;
    let time = req.query.EventTime;
    let venue = req.query.txtEventVenue;
    let city = req.query.txtEventCity;

    mysql.query("insert into events values(?,?,?,?,?,?)",[email,event,date,time,city,venue],function(err){
        if(err==null)
            resp.send("Congrats");
        else
            resp.send(err.message);
    })
    return;
})

app.get("/change-password-process",function(req,resp){
    let email = req.query.txtSettingEmail;
    let old = req.query.txtSettingOldPassword;
    let newpwd = req.query.txtSettingNewPassword;
    let renew = req.query.txtSettingRePassword;

    mysql.query("update users set pwd = ? where email = ? and pwd = ?",[newpwd,email,old],function(err){
        if(err!=null){
            resp.send(err.message);
        }
        else{
            resp.send("Password Changed");
        }
    })
    return;
})

app.get("/setting",function(req,resp){
    let path = __dirname + "/public/setting.html";
    resp.sendFile(path);
})

app.get("/logout-process",function(req,resp){
    resp.redirect("index.html");
})

app.get("/admin",function(req,resp){
    let path = __dirname + "/public/admin-login.html";
    resp.sendFile(path);
})

app.get("/admin-login-process",function(req,resp){
    let adminEmail = req.query.txtAdminEmail;
    let adminPwd = req.query.txtAdminPwd;

    mysql.query("select * from admin where adminemail = ? and adminpwd = ?",[adminEmail,adminPwd],function(err,result){
        if(err!=null){
            resp.send(err.message);
        }
        if(result.length==0){
            resp.send("Login Failed");
        }
        else
            resp.redirect("admin-dashboard.html");
    })
})

app.get("/block-users",function(req,resp){
    let path = __dirname + "/public/admin-block.html";
    resp.sendFile(path);
})

app.get("/fetch-block-process",function(req,resp){
    let utype = req.query.utype;

    mysql.query("select * from users where utype = ?",[utype],function(err,resultjsonAry){
        if(err==null){
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/status-change",function(req,resp){
    let email = req.query.emailid;
    let status = req.query.status;

    mysql.query("update users set status = ? where email = ?",[status,email],function(err){
        if(err!=null){
            resp.send(err.message);
        }
        else{
            resp.send("Status Updated");
        }
    })
})

app.get("/delete-process",function(req,resp){
    let email = req.query.emailid;
    mysql.query("delete from users where email = ?",[email],function(err){
        if(err!=null){
            resp.send(err.message);
        }
        else{
            resp.send("Account Deleted");
        }
    })
})

app.get("/fetch-users-process",function(req,resp){
    let utype = req.query.utype;

    mysql.query("select * from users where utype = ?",[utype],function(err,resultjsonAry){
        if(err==null){
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/fetch-infl-profiles",function(req,resp){
    mysql.query("select * from iprofile",[],function(err,resultjsonAry){
        if(err==null){
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/delete-infl",function(req,resp){
    let email = req.query.emailid;
    mysql.query("delete from iprofile where emailid = ?",[email],function(err){
        if(err==null)
            resp.send("Influencer Removed");
        else
            resp.send(err.message);
    })
})

app.get("/fetch-client-profiles",function(req,resp){
    mysql.query("select * from cprofile",[],function(err,resultjsonAry){
        if(err==null){
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/delete-client",function(req,resp){
    let email = req.query.emailid;
    mysql.query("delete from cprofile where email = ?",[email],function(err){
        if(err==null)
            resp.send("Client Removed");
        else
            resp.send(err.message);
    })
})

app.get("/fetch-events-process",function(req,resp){
    let utype = req.query.utype;
    let email = req.query.email;

    mysql.query("select * from events where email = ?",[email],function(err,resultjsonAry){
        if(err==null){
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/fetch-admin-events-process",function(req,resp){
    mysql.query("select * from events",[],function(err,resultjsonAry){
        if(err==null){
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/delete-events-process",function(req,resp){
    let email = req.query.emailid;
    let event = req.query.event;

    mysql.query("delete from events where email = ? and eventtitle = ?",[email,event],function(err){
        if(err==null)
            resp.send("Event Deleted");
        else
            resp.send(err.message);
    })
})

app.get("/fetch-admin-infl-profiles",function(req,resp){
    mysql.query("select * from iprofile",[],function(err,resultjsonAry){
        if(err==null){
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/admin-fetch-client-profiles",function(req,resp){
    mysql.query("select * from cprofile",[],function(err,resultjsonAry){
        if(err==null){
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
})
