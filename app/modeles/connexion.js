const crypto = require('crypto')
const levelDB = require(__dirname + '/levelDB');

submitForm = async (formData, session) => {
  let token = formData.token
  if(token != session.tokenForm){
    return false 
  }
  let username = formData.username
  try {
    user = JSON.parse(await levelDB.userDB.get(username))
    if (user.pwd != formData.pwd) 
      return false
    createUserSession(username, session, user.role) 
    return user.role
  } catch (error) {
    return false;
  }
},
addTokenSession =  () => {
  return   crypto.randomBytes(48).toString('hex')
},
createUserSession = (username, session, role) => {
  session.role = role
  session.username = username
},
removeTokenSession = () => {

},
updateSession = ( sessionName, datas) => {
  session({ 'name' : sessionName, 'datas' : datas }) // => data format {key : val}
}


module.exports = {
   submitForm : submitForm,
   addTokenSession : addTokenSession
};
  
