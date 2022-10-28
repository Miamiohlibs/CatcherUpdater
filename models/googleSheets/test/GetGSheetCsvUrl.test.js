let GetGSheetCsvUrl = require('../GetGSheetCsvUrl');
let getter = new GetGSheetCsvUrl();

describe('GetGSheetCsvUrl', () => {
  describe('getCsvUrl', () => {
    it('should create a CSV url from a url with no sheet id', () => {
      let url = 'https://docs.google.com/spreadsheets/d/xyz-321/edit';
      let expected =
        'https://docs.google.com/spreadsheets/d/xyz-321/export?format=csv';
      let res = getter.getCsvUrl(url);
      expect(res).toBe(expected);
    });

    it('should create a CSV url from a edit url with a sheet gid', () => {
      let url = 'https://docs.google.com/spreadsheets/d/xyz-321/edit#gid=123';
      let expected =
        'https://docs.google.com/spreadsheets/d/xyz-321/export?format=csv&gid=123';
      let res = getter.getCsvUrl(url);
      expect(res).toBe(expected);
    });
  });

  describe('getSheetId', () => {
    it('should get the sheet id from a real example with page id', () => {
      let url =
        'https://docs.google.com/spreadsheets/d/1cCcO1Y1rFonPCkwW3-NagwTVYhBB-Vn6RdQH0tIVmpE/edit#gid=0';
      let expected = '1cCcO1Y1rFonPCkwW3-NagwTVYhBB-Vn6RdQH0tIVmpE';
      let res = getter.getSheetId(url);
      expect(res).toBe(expected);
    });
    it('should get the sheet id from a real example with no page id', () => {
      let url =
        'https://docs.google.com/spreadsheets/d/1cCcO1Y1rFonPCkwW3-NagwTVYhBB-Vn6RdQH0tIVmpE/edit';
      let expected = '1cCcO1Y1rFonPCkwW3-NagwTVYhBB-Vn6RdQH0tIVmpE';
      let res = getter.getSheetId(url);
      expect(res).toBe(expected);
    });
    it('should get the sheet id from a fake example', () => {
      let url = 'https://docs.google.com/spreadsheets/d/xyz-321/edit#gid=123';
      let expected = 'xyz-321';
      let res = getter.getSheetId(url);
      expect(res).toBe(expected);
    });
  });

  describe('getPageIdSuffix', () => {
    it('should get the page id suffix when set to zero', () => {
      let url =
        'https://docs.google.com/spreadsheets/d/1cCcO1Y1rFonPCkwW3-NagwTVYhBB-Vn6RdQH0tIVmpE/edit#gid=0';
      let expected = '&gid=0';
      let res = getter.getPageIdSuffix(url);
      expect(res).toBe(expected);
    });
    it('should get the page id suffix when non-zero', () => {
      let url =
        'https://docs.google.com/spreadsheets/d/1cCcO1Y1rFonPCkwW3-NagwTVYhBB-Vn6RdQH0tIVmpE/edit#gid=8675309';
      let expected = '&gid=8675309';
      let res = getter.getPageIdSuffix(url);
      expect(res).toBe(expected);
    });
    it('should return empty string when none present', () => {
      let url =
        'https://docs.google.com/spreadsheets/d/1cCcO1Y1rFonPCkwW3-NagwTVYhBB-Vn6RdQH0tIVmpE/edit';
      let expected = '';
      let res = getter.getPageIdSuffix(url);
      expect(res).toBe(expected);
    });
  });
});
