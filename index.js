const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  let token = null
  if (!event.body) { token = await generateToken(null, null, null) }
  else {
    const body = JSON.parse(event.body)
    const isCostumerRegistered = await costumerIsRegistered(body.documentNumber, body.name, body.email)
    if (!isCostumerRegistered) {
      return {
        statusCode: 401,
        body: JSON.stringify('Parâmetros inválidos ou incorretos'),
        headers: { 'Content-Type': 'application/json' }
      }
    }
    else { 
      token = await generateToken(body.documentNumber, body.name, body.documentNumber);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ token: token }),
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

async function costumerIsRegistered(documentNumber, name, email) {
  let costumerRegistered = false

  costumerRegistered = await fetch(`${process.env.urlApi}/customers`, {
    method: "GET",
    query: {
      "documentNumber": documentNumber,
      "name": name,
      "email": email
    }
  })

  if(costumerRegistered.status === 200) return true
  else return false
}