const express = require("express");
const Router = express.Router();
const judgement = require("../model/judgement.model");
const { upload } = require("../multer/index");
const { uploadFile } = require("../services/s3.service");
const axios = require("axios");

Router.route("/submit")
    .get(async (req, res) => {
        res.render("submit.ejs");
    })
    .post(upload.array("documents", 100), async (req, res) => {

        try {

            let files = [];
            let filesold = req.files;

            for (let file of filesold) {

                const result = await uploadFile(file);

                let filesnew = {
                    url: result.Location,
                    fileType: file.mimetype,
                }
                files.push(filesnew);
            }

            console.log(files);


            const newJudgement = new judgement({
                licenseID: "random", //* We will get this using cookies
                crimeYear: req.body.crimeYear,
                // caseNumber: req.body.caseNumber,
                crimeRegion: req.body.crimeRegion,
                documents: files
            });


            newJudgement.save((err, result) => {
                // res.redirect("/loader");

                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        message: "Error in saving data",
                        error: err
                    });
                }

                else {

                    // res.redirect("/loader");

                    let id = newJudgement.id;
                    console.log(id);
                    // res.render("loader.ejs", {
                    //     id: id
                    // })
                    // res.redirect(`/loader/${id}`)
                    let data = JSON.stringify({
                        "id": id
                    });

                    let config = {
                        method: 'post',
                        url: 'http://35.90.190.108/update',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: data
                    };

                    return axios(config)
                        .then(function (response) {
                            console.log(JSON.stringify(response.data));
                            // res.redirect("/success");
                            res.render("success.ejs");
                        })
                        .catch(function (error) {
                            console.log(error);
                        });



                }

                // else return res.status(200).json({
                //     message: "Data saved successfully",
                //     result: result
                // });
            })



        }
        catch (err) {
            console.log(err);
            return res.status(500).json({
                error: "true",
                message: "Error before saving data",
            });
        }

    })



module.exports = Router;