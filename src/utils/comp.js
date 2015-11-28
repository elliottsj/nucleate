/**
 * Function composition
 * @param ...fs functions to compose
 * @return composed function
 **/
export default function comp (...fs) {
  return (v, ...args) =>
    fs.reduceRight(
      (g, f) => f(g, ...args), v
    )
}
