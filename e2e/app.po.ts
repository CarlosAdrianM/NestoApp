import { browser, by, element } from 'protractor';

export class Page {

  navigateTo(destination): any {
    return browser.get(destination);
  }

  getTitle(): any {
    return browser.getTitle();
  }

  getPageOneTitleText(): any {
    return element(by.tagName('page-page1')).element(by.tagName('ion-title')).element(by.css('.toolbar-title')).getText();
  }
}
