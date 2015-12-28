/**
 * Function composition
 * @param ...fs functions to compose
 * @return composed function
 **/
export default function compose (...fs) {
  return (v, ...args) =>
    fs.reduceRight(
      (g, f) => f(g, ...args), v
    )
}
