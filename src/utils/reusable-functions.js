export const extractDecimal = (num) => {
  if(!isNaN(num)) {
    let strFormat = num.toString();
    let response = 0;
    if (strFormat.includes(".")) {
      response = parseInt(strFormat.split(".")[1]);
    }
    return response;
  }
  else{
    return 0;
  }
}

export const compareBotVersions = (version1, version2)=>{
  if(isNaN(version1) || isNaN(version2)){
    return 0
  }
  else{
    if(parseInt(version1)>parseInt(version2)){
      return 1;
    }
    else if(parseInt(version1) === parseInt(version2)){
      return extractDecimal(version1)-extractDecimal(version2)
    }
    else{
      return -1;
    }
  }
}

export const isCurrentBotVersionGreater = (currentVersion, prevVersion)=>{
  return compareBotVersions(currentVersion, prevVersion) > 0 ? true:false;
}
