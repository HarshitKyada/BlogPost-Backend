const OwnerProfile = require("../../models/OwnerProfile");

async function authChecker(token, uniqueId) {
  try {
    const isAuth = await OwnerProfile.findOne({ token: token });
    const isUnique = await OwnerProfile.findOne({ uniqueId: uniqueId });
    if (isAuth && isUnique) {
      return true;
    }
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
}

module.exports = authChecker;