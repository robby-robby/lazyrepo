import { compileMatcher } from './compileMatcher.js'
import { LazyDir } from './fs/LazyDir.js'
import { matchInDir } from './matchInDir.js'

export class LazyGlob {
  /** @type {LogicalClock} */
  #clock = { time: 0 }
  #rootDir = new LazyDir(this.#clock, '/', 0, false)

  /**
   * @param {string[]} patterns
   * @param {LazyGlobOptions} [opts]
   */
  sync(patterns, opts) {
    /** @type {LazyGlobOptions['cwd']} */
    const cwd = opts?.cwd || process.cwd()
    /** @type {LazyGlobOptions['cache']} */
    const cache = opts?.cache ?? 'normal'

    /** @type {MatchOptions} */
    const matchOpts = {
      dot: opts?.dot ?? false,
      types: opts?.types ?? 'files',
      cwd,
      expandDirectories: opts?.expandDirectories ?? false,
      symbolicLinks: opts?.symbolicLinks ?? 'follow',
    }

    const rootMatcher = compileMatcher(
      matchOpts,
      patterns.concat(opts?.ignore?.map((p) => '!' + p) ?? []),
      cwd,
    )

    if (cache === 'normal') {
      this.#clock.time++
    }

    const result = matchInDir(
      cache === 'none' ? new LazyDir(this.#clock, '/', 0, false) : this.#rootDir,
      matchOpts,
      rootMatcher.children,
      [],
    )
    return result
  }

  invalidate() {
    this.#clock.time++
  }
}
