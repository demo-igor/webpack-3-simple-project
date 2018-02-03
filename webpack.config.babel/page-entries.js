export const additionalPageEntries = {
  about: ['./js/about', './scss/about', './scss/critical', './scss/main']
};

export const getPageEntries = () => {
  const entries = {
    index: ['./js/index', './scss/index', './scss/critical', './scss/main']
  };

  return {
    ...entries,
    ...additionalPageEntries
  }
};
