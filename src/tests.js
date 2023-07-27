import {
  hasElementBySelectors,
  getStyle,
} from 'lib-verstka-tests';

const logoWrapper = async (page) => {
  const hasWrapper = await hasElementBySelectors(page, 'a img[src*="logo"]');

  if (!hasWrapper) {
    return [{
      id: 'logoWrapper',
    }];
  }

  return [];
};

const prefixForEmailAndPhone = async (page) => {
  const hasPrefixForEmail = await hasElementBySelectors(page, 'a[href^="mailto"]');
  const hasPrefixForPhone = await hasElementBySelectors(page, 'a[href^="tel"]');

  if (!hasPrefixForEmail || !hasPrefixForPhone) {
    return [{
      id: 'prefixForEmailAndPhone',
    }];
  }

  return [];
};

const semanticTags = async (page, tags) => {
  const tagsAfterSearch = await Promise.all(tags.map(async (tagName) => {
    const isFound = await hasElementBySelectors(page, tagName);

    return {
      tagName,
      isMissing: !isFound,
    };
  }));
  const missingTags = tagsAfterSearch.filter(({ isMissing }) => isMissing);
  const missingTagNames = missingTags.map(({ tagName }) => tagName);

  if (missingTagNames.length) {
    return [{
      id: 'semanticTagsMissing',
      values: {
        tagNames: missingTagNames.join(', '),
      },
    }];
  }

  return [];
};

const resetMargins = async (page, tags) => {
  const properties = ['margin', 'padding'];

  const elementsProperties = await Promise.all(tags.map(async (tagName) => {
    const elementProperties = await getStyle(page, tagName, properties);

    return {
      tagName,
      isNotReset: elementProperties.some((property) => property !== '0px'),
    };
  }));

  const notResetTags = elementsProperties.filter(({ isNotReset }) => isNotReset);
  const notResetTagNames = notResetTags.map(({ tagName }) => tagName);

  if (notResetTagNames.length) {
    return [{
      id: 'notResetMargins',
      values: {
        tagNames: notResetTagNames.join(', '),
      },
    }];
  }

  return [];
};

export {
  semanticTags,
  resetMargins,
  logoWrapper,
  prefixForEmailAndPhone,
};
