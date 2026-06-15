import { describe, it, expect } from 'vitest'
import { untar } from '../src/untar'
import { makeTar } from './helpers'

const text = (u: Uint8Array) => new TextDecoder().decode(u)

describe('untar', () => {
  it('round-trips files (name + content)', () => {
    const tar = makeTar([
      { name: 'index.html', data: '<h1>hi</h1>' },
      { name: '_next/static/chunk.js', data: 'console.log(1)' },
      { name: 'data/pop.csv', data: 'a,b\n1,2' },
    ])
    const out = untar(tar)
    expect(out.map((e) => e.name)).toEqual(['index.html', '_next/static/chunk.js', 'data/pop.csv'])
    expect(text(out[0].data)).toBe('<h1>hi</h1>')
    expect(text(out[2].data)).toBe('a,b\n1,2')
  })

  it('strips a leading ./', () => {
    const out = untar(makeTar([{ name: './a.txt', data: 'x' }]))
    expect(out[0].name).toBe('a.txt')
  })

  it('handles empty files', () => {
    const out = untar(makeTar([{ name: 'empty', data: '' }]))
    expect(out).toHaveLength(1)
    expect(out[0].data.length).toBe(0)
  })
})
