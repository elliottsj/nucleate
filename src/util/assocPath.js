export default function assocPath (pth, value, obj = {}) {
  return pth.length === 0 ? obj : {
    ...obj,
    [pth[0]]:
      pth.length === 1
        ? value
        : assocPath(pth.slice(1), value, obj[pth[0]])
  }
}
