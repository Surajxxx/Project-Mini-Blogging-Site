const AuthorModel = require("../models/authorModel");
const jwt = require("jsonwebtoken");

//**************************************VALIDATION FUNCTIONS************************************************* */

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length > 0) return true;
  return false;
};

const isValidRequest = function (object) {
  return Object.keys(object).length > 0;
};

const isValidEmail = function (value) {
  const regexForEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regexForEmail.test(value);
};

//*************************************REGISTER NEW AUTHOR************************************************************ */

const createAuthor = async function (req, res) {
  try {
    const requestBody = req.body;
    const queryParams = req.query;

    if (isValidRequest(queryParams)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid request" });
    }

    if (!isValidRequest(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "author data is required" });
    }

    const { title, fname, lname, email, password } = requestBody;

    if(Object.keys(requestBody).length > 5){
        return res.status(400).send({status: false, message : "invalid data entry inside request body"})
    }

    if (!isValid(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Title is required" });
    }

    if (!["Mr", "Mrs", "Miss"].includes(title)) {
      return res
        .status(400)
        .send({
          status: false,
          message: `Title must be from these values [Mr, Mrs, Miss]`,
        });
    }

    if (!isValid(fname)) {
      return res
        .status(400)
        .send({ status: false, message: "First Name is required" });
    }

    if (!isValid(lname)) {
      return res
        .status(400)
        .send({ status: false, message: "Last Name is required" });
    }

    if (!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter a valid email address" });
    }

    const isEmailUnique = await AuthorModel.findOne({ email: email });

    if (isEmailUnique) {
      return res
        .status(400)
        .send({ status: false, message: "Email already exist" });
    }

    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    }

    const authorData = {
      title: title.trim(),
      fname: fname.trim(),
      lname: lname.trim(),
      email: email.trim().toLowerCase(),
      password: password,
    };

    const newAuthor = await AuthorModel.create(authorData);
    res
      .status(201)
      .send({
        status: true,
        message: "author registered successfully",
        data: newAuthor,
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

//*********************************************AUTHOR LOGIN************************************************* */

const authorLogin = async function (req, res) {
  try {
    const requestBody = req.body;
    const queryParams = req.query;

    if (isValidRequest(queryParams)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid request" });
    }

    if (!isValidRequest(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "author data is required" });
    }

    const userName = requestBody.email;
    const password = requestBody.password;

    if (!isValid(userName)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide email address" });
    }

    if (!isValidEmail(userName)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter a valid email address" });
    }

    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: "Password is required" });
    }

    const author = await AuthorModel.findOne({
      email: userName,
      password: password,
    });

    if (!author) {
      return res
        .status(401)
        .send({ status: false, message: "invalid login credentials" });
    }

    const payLoad = { authorId: author._id };
    const secretKey = "myprivatekeycontains123!@#";

    const token = jwt.sign(payLoad, secretKey, { expiresIn: "6000s" });

    res.header("x-api-key", token);

    res
      .status(200)
      .send({ status: true, message: "Author login successful", data: token });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

//**************************************EXPORTING BOTH HANDLERS********************************************* */

module.exports.createAuthor = createAuthor;
module.exports.authorLogin = authorLogin;
