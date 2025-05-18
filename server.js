var express = require("express");
var fileUploader = require("express-fileupload");
var nodemailer = require("nodemailer");
var http = require("http");
let app = express();
var cloudinary = require("cloudinary").v2;
var fs = require("fs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true}));
app.use(fileUploader());
require('dotenv').config();

// let config = {
//     host: "127.0.0.1",
//     user: "root",
//     password: "Arman#2004",
//     database: "project",
//     dateStrings: true
// }
let configure = "mysql://avnadmin:AVNS_C0Nfsys9G38c2YoDyHX@mysql-23613a97-armaansingla2004-d757.g.aivencloud.com:20687/defaultdb";

let mysql2 = require("mysql2");
// const { setGlobalDispatcher } = require("undici-types");
let mysql = mysql2.createConnection(configure);
mysql.connect(function(err){
    if(err)
        console.log(err.message);
    else
        console.log("Database connected");
})

app.listen(3000,function(){
    console.log("Server is running on port 3000");
})

// cloudinary.config({
//     cloud_name: 'doicb4bys',
//     api_key: '553547862794321',
//     api_secret: 'ciYER--ebOWES-7jEBcRb8yyFh4'
// });

cloudinary.config({ 
    cloud_name: 'ddxyeuvfe', 
    api_key: '298667817963234', 
    api_secret: 'CKFE8eQoxjak78J1TWBeYS0vwFU',
    secure: true
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
                // else
                //     resp.send("Email sent");
            }); 
        }
})
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

app.get("/show-requests",function(req,resp){
    mysql.query("select * from requests where status = 0 and influencer = ?",[req.query.emailid],function(err,resultjsonAry){
        if(err==null){
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
});

app.get("/accept-request", function (req, resp) {
  let id = req.query.id;

  mysql.query(
    "UPDATE requests SET status = 1 WHERE id = ?",
    [id],
    function (err) {
      if (err == null) {
        resp.send("Request accepted successfully!");
      } else {
        resp.send(err.message);
      }
    }
  );
});

app.post("/save-client-profile",function(req,resp){
    // console.log(req.body.txtClientEmail);
    console.log("Received request:", req.body);
    // console.log("Hi");  
    mysql.query("insert into cprofile values(?,?,?,?,?,?)",[req.body.txtClientEmail,req.body.txtClientName,req.body.txtClientCity,req.body.txtClientState ,req.body.txtClientType,req.body.txtClientContact],function(err){
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

app.post("/save-profile",async function(req,resp){
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
    let str="";
    if(Array.isArray(ary)){
        for(i=0;i<ary.length;i++){
            str = str + ary[i] + ",";
        }
        str = str.slice(0,-1);
    }
    else
        str = ary;

    let fileName="";
    if(req.files!=null)
    {
        let fileName=profilePic.name;
        let path=__dirname+"/public/uploads/"+fileName;
        req.files.ppic.mv(path);
        await cloudinary.uploader.upload(path)
        .then(function(result){
            fileName = result.url;
        })
        .catch(error => {
            // resp.send("Cloudinary upload error: " + error.message);
            return;
        });
        // try {
        //     let result = await cloudinary.uploader.upload(path);
        //     fileName = result.url;
        // } catch (error) {
        //     resp.send("Cloudinary upload error: " + error.message);
        //     return;
        // }
    }
    
    mysql.query("insert into iprofile values(?,?,?,?,?,?,?,?,?,?,?,?,?)",[mail,name,gender,dob,address,city,contact,str,insta,fb,youtube,others,fileName],function(err){
        if (err == null) {
            resp.redirect("updatedProfile.html");
        } else {
            resp.send("Already Exists");
        }
    })
   
    return;
})

app.post("/update-profile",async function(req, resp) {
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
    if(profilepic!=null){
    
            fileName=profilepic.name;
            let path=__dirname+"/public/uploads/"+fileName;
            // console.log(profilepic)
            req.files.ppic.mv(path);
            await cloudinary.uploader.upload(path)
            .then(function(result){

                fileName = result.url;
                

            })
            .catch(error => {
                console.log("Cloudinary upload error: " + error.message);
                return;
            });
            // try {
            //     let result = await cloudinary.uploader.upload(path);
            //     fileName = result.url;
            // } catch (error) {
            //     console.log("Cloudinary upload error: " + error.message);
            //     return;
            // }
    }
    

    mysql.query("update iprofile set iname=?, gender=?,dob=?,address=?,city=?,contact=?,fields=?, insta=?, fb=?, youtube=?, others=?, picpath=?  where emailid=?", [name,gender,dob,address,city, contact, str, insta, fb, youtube, others,fileName,  mail], function(err) {
        if (err == null) {
            // console.log("Profile updated successfully");
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

    mysql.query("insert into events values(null,?,?,?,?,?,?)",[email,event,date,time,city,venue],function(err){
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
    let newP = req.query.txtSettingNewPassword;
    let confirmP = req.query.txtSettingConfirmPassword;

    if(newP!=confirmP){
        resp.send("Passwords don't match");
        return;
    }
    mysql.query("update users set pwd=? where email=? and pwd=?",[newP,email,old],function(err){
        if(err==null)    
            resp.send("Password Changed");
        else
            resp.send(err.message);
    })
    return;
});

var aunthentication = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
        user: "armansingla02@gmail.com",
        pass: "vzku tree aypx fphe",
    },
});

app.get("/forgot-password-process",function(req,resp){
    let mail = req.query.logintxtEmail;

    mysql.query("select pwd from users where email = ?",[mail],function(err,result){
        // resp.send(result);
        if(err==null){
            let reciever = {
                from: "armansingla02@gmail.com",
                to: mail,
                subject: "Forgot Password",
                text: "Your password is "+result[0].pwd
            }
            aunthentication.sendMail(reciever, function(err, info) {
                if (err) {
                    resp.send(err.message);
                }
                else
                    resp.send("Email sent");
            }); 
    };

    
    });

});

app.get("/event-manager-page",function(req,resp){
    let path = __dirname + "/public/event-manager.html";
    resp.sendFile(path);
})

app.get("/fetch-all-events",function(req,resp){
    mysql.query("select * from events where emailid = ? and doe>=current_date()",[req.query.emailid],function(err,resultjsonAry){
        if(err==null){
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/delete-event",function(req,resp){
    mysql.query("delete from events where doe = ? and tos = ?",[req.query.doe,req.query.tos],function(err){
        if(err==null)
            resp.send("Event Deleted");
        else
            resp.send(err.message);
    })
})

// -----------------------------------ADMIN-PANEL-------------------------------------

app.get("/admin-dash",function(req,resp){
    let path = __dirname + "/public/admin-dash.html";
    resp.sendFile(path);
});

app.get("/admin-users",function(req,resp){
    let path = __dirname + "/public/admin-users.html";
    resp.sendFile(path);
})

app.get("/admin-all-infl",function(req,resp){
    let path = __dirname + "/public/admin-all-infl.html";
    resp.sendFile(path);
})

app.get("/admin-fetch-client-profiles",function(req,resp){
    mysql.query("select * from cprofile",function(err,resultjsonAry){
        if(err==null){
            console.log(resultjsonAry);
            console.log("hi");
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/admin-all-clients",function(req,resp){
    let path = __dirname + "/public/admin-all-clients.html";
    resp.sendFile(path);
})

app.get("/fetch-all-users",function(req,resp){
    mysql.query("select * from users",function(err,resultjsonAry){
        if(err==null){
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/block-user",function(req,resp){
    mysql.query("update users set status = 0 where email = ?",[req.query.email],function(err){
        if(err==null)
            resp.send("User Blocked");
        else
            resp.send(err.message);
    })
})

app.get("/resume-user",function(req,resp){
    mysql.query("update users set status = 1 where email = ?",[req.query.email],function(err){
        if(err==null)
            resp.send("User Resumed");
        else
            resp.send(err.message);
    })
})

app.get("/delete-user",function(req,resp){
    mysql.query("delete from users where email = ?",[req.query.email],function(err){
        if(err==null)
            resp.send("User Deleted");
        else
            resp.send(err.message);
    })
    mysql.query("delete from iprofile where email = ?",[req.query.email],function(err){
        if(err==null)
            resp.send("User Deleted");
        else
            resp.send(err.message);
    })
    mysql.query("delete from cprofile where email = ?",[req.query.email],function(err){
        if(err==null)
            resp.send("User Deleted");
        else
            resp.send(err.message);
    })
})

// ------------------------------------------------CLIENT-PANEL--------------------------------------
app.get("/influfinder",function(req,resp){
    let path = __dirname + "/public/influ-finder.html";
    resp.sendFile(path);
})

app.get("/fetch-all-cities", function(req, resp) {
    mysql.query("select distinct city from iprofile where fields like ?",["%"+req.query.fields+"%"], function(err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;
        }
        // console.log(resultJsonAry);
        resp.send(resultJsonAry);
    });
});

app.get("/fetch-influencers-field-city", function(req, resp) {

    var sqlQuery;
    if(req.query.city!==undefined && req.query.fields!==undefined){
        mysql.query("select * from iprofile where city = ? && fields like ?", [req.query.city, "%" + req.query.fields + "%"], function(err, resultJsonAry) {
            if (err != null) {
                resp.send(err.message);
                return;
            }
            // console.log(resultJsonAry);
            resp.send(resultJsonAry);
        });
    }
    else if(req.query.city!==undefined && req.query.fields===undefined){
        mysql.query("select * from iprofile where city = ?", [req.query.city], function(err, resultJsonAry) {
            if (err != null) {
                resp.send(err.message);
                return;
            }
            // console.log(resultJsonAry);
            resp.send(resultJsonAry);
        });
    }
    else if(req.query.city===undefined && req.query.fields!==undefined){
        mysql.query("select * from iprofile where fields like ?", ["%" + req.query.fields + "%"], function(err, resultJsonAry) {
            if (err != null) {
                resp.send(err.message);
                return;
            }
            // console.log(resultJsonAry);
            resp.send(resultJsonAry);
        });
    }
        
    
});

app.get("/fetch-all-influencers",function(req,resp){
    mysql.query("select * from iprofile",function(err,resultjsonAry){
        if(err==null){
            resp.send(resultjsonAry);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/fetch-influencers-name", function(req, resp) {
    mysql.query("select * from iprofile where iname like ?", ["%" + req.query.iname + "%"], function(err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;
        }
        // console.log(resultJsonAry);
        resp.send(resultJsonAry);
    });
})

app.get("/send-request", function (req, resp) {
  let user = req.query.user;
  let influencer = req.query.influencer;
  let message = req.query.message; // Retrieve the message from the query parameters

  mysql.query(
    "INSERT INTO requests (user, influencer, status, message) VALUES (?, ?, 0, ?)",
    [user, influencer, message],
    function (err) {
      if (err == null) {
        resp.send("Your Connection request Sent");
      } else {
        resp.send(err.message);
      }
    }
  );
});