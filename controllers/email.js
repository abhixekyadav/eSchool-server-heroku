const Support = require("../models/support");
// const SES = require("aws-sdk/clients/ses");
const AWS = require("aws-sdk");
const { supportEmailParams } = require("../utils/email");

// aws config old
// const ses = new SES({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
//   apiVersion: process.env.AWS_API_VERSION,
// });

// aws config new
const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  // apiVersion: process.env.AWS_API_VERSION,
  version: process.env.AWS_API_VERSION,
};
const ses = new AWS.SES(awsConfig);

exports.supportEmail = async (req, res) => {
  try {
    const { url, name, email, message } = req.body;
    // save new issue in db
    const issue = await new Support({
      course_url: url,
      message,
      postedBy: req.user._id,
    }).save();
    // prepare for email
    const params = supportEmailParams(url, name, email, message);
    // send
    // const emailSent = ses.sendEmail(params).promise();
    // emailSent
    //   .then((data) => {
    //     console.log(data);
    //     res.json({ ok: true });
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  } catch (err) {
    console.log(err);
  }
};
