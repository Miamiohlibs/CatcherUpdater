class GetGSheetCsvUrl {
  getCsvUrl(url) {
    let sheetId = this.getSheetId(url);
    let pageIdSuffix = this.getPageIdSuffix(url);
    let newUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${pageIdSuffix}`;
    return newUrl;
  }
  getSheetId(url) {
    // get the part after /d/ and before /edit in the url
    return url.split('/d/')[1].split('/edit')[0];
  }
  getPageIdSuffix(url) {
    if (url.includes('#gid=')) {
      return '&gid=' + url.split('#gid=')[1];
    }
    return '';
  }
}

module.exports = GetGSheetCsvUrl;
