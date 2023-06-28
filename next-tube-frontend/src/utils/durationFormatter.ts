export const durationFormatter = (duration: bigint) => {
  const pad = (num: number) => num < 10 ? `0${num}` : num
  const seconds = parseInt(duration.toString())

  const H = Math.floor(seconds / 3600)
  const m = Math.floor(seconds % 3600 / 60)
  const s = pad(seconds % 60)


  let result = ''
  if (H > 0) result += `${+H}:`
  result += `${H > 0 ? pad(m) : m}:${s}`
  return result
}