/**
 * Loads a module after removing it from the cache (if exists).
 *
 * @param  {string} module module path
 * @return {module} module
 */

const requireUncached = (module: any): any => {
  delete require.cache[require.resolve(module)];
  return require(module);
};

export default requireUncached;
