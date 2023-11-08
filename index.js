const jwt = require('jsonwebtoken');
const axios = require('axios');

exports.handler = async (event) => {
  let token = null

  if (Object.keys(event).length === 0) { 
    token = await generateToken(null, null, null) 
  }
  else {
    const iscustomerRegistered = await customerIsRegistered(event.documentNumber, event.name, event.email)
    if (!iscustomerRegistered) {
      return {
        statusCode: 401,
        body: { message: 'Invalid or incorrect parameters' },
        headers: { 'Content-Type': 'application/json' }
      }
    }
    else { 
      token = await generateToken(event.documentNumber, event.name, event.email);
    }
  }

  return {
    statusCode: 200,
    body: { token: token },
    headers: { 'Content-Type': 'application/json' }
  }
}

async function generateToken(documentNumber, name, email) {
  let principalIdCustomer = null
  const secret = Buffer.from(process.env.jwt_Secret, 'base64');

  if (!documentNumber && !name && !email) { 
    principalIdCustomer = process.env.documentNumberAnonymous 
  }
  else if (!documentNumber) { 
    principalIdCustomer = `${name}${email}` 
  }
  else { 
    principalIdCustomer = documentNumber 
  }

  return jwt.sign({ principalIdCustomer }, secret, { expiresIn: 3600 })
}

async function customerIsRegistered(documentNumber, name, email) {
  let customerRegistered = true

  try {
    await axios.get(`${process.env.urlApi}/customers`, {
      params: {
        "documentNumber": documentNumber,
        "name": name,
        "email": email
      }
    })
  }
  catch(e){
    customerRegistered = false
  }

  return customerRegistered
}