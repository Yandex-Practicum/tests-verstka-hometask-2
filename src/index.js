import path from 'path';
import {
  launchBrowser,
  compareLayout,
  runTests,
  mkdir,
  mkfile,
  structure,
  stylelint,
  w3c,
  orderStyles,
  lang,
  titleEmmet,
  horizontalScroll,
  extraFonts,
} from 'lib-verstka-tests';
import ru from './locales/ru.js';
import {
  logoWrapper,
  prefixForEmailAndPhone,
  // resetMargins,
  semanticTags,
} from './tests.js';

const [, , PROJECT_PATH, LANG = 'ru'] = process.argv;

const app = async (projectPath, lng) => {
  const options = {
    projectPath,
    lang: lng,
    resource: ru,
  };

  const check = async () => {
    const tree = mkdir('project', [
      mkfile('index.html'),
      mkdir('styles', [
        mkfile('style.css'),
      ]),
      mkdir('fonts', [
        mkfile('fonts.css'),
      ]),
    ]);
    const structureErrors = structure(projectPath, tree);

    if (structureErrors.length) {
      return structureErrors;
    }

    const baseUrl = 'http://localhost:3000';
    const viewport = { width: 1100, height: 1080 };
    const launchOptions = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
    const { browser, page } = await launchBrowser(baseUrl, { launchOptions, viewport });
    const errors = (await Promise.all([
      w3c(projectPath, 'index.html'),
      stylelint(projectPath),
      orderStyles(page, ['fonts.css', 'global.css', 'style.css']),
      extraFonts(path.join(projectPath, 'styles', 'style.css'), ['Raleway']),
      lang(page, lng),
      titleEmmet(page),
      semanticTags(page, ['header', 'main', 'section', 'footer']),
      // resetMargins(page, ['body']),
      logoWrapper(page),
      prefixForEmailAndPhone(page),
      horizontalScroll(page),
      compareLayout(baseUrl, {
        canonicalImage: 'layout-canonical-1100.jpg',
        pageImage: 'layout-1100.jpg',
        outputImage: 'output-1100.jpg',
        reqPercentage: 8,
        browserOptions: { launchOptions, viewport: { width: 1100, height: 1080 } },
      }),
    ]))
      .filter(Boolean)
      .flat();

    await browser.close();

    return errors;
  };

  await runTests(options, check);
};

app(PROJECT_PATH, LANG);
