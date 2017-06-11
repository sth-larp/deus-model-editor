import { DeusModelEditorPage } from './app.po';

describe('deus-model-editor App', () => {
  let page: DeusModelEditorPage;

  beforeEach(() => {
    page = new DeusModelEditorPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
