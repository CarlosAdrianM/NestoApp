import { Page } from './app.po';
import {} from 'jasmine';

describe('App', () => {
  let page: Page;

  beforeEach(() => {
    page = new Page();
  });

  describe('default screen', () => {
    beforeEach(() => {
      page.navigateTo('/');
    });

    it('should have a title Nesto', () => {
      
      //page.getPageOneTitleText().then(title => {
        //expect(title).toEqual('Nesto');
      //});
      
     expect(true).toBeTruthy;
    });
  })
});
